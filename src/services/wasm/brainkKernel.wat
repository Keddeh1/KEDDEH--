(module
  ;; Braink Native Cognitive Microkernel (IL-LLM Substrate & Moebius Wire Core)
  ;; Memory layout:
  ;; 0x0000 - 0x3FFF (16384 bytes): Adjacency Matrix (64x64 f32 = 4096 floats)
  ;; 0x4000 - 0x7FFF (16384 bytes): Transitive Closure Matrix (64x64 f32 = 4096 floats)
  ;; 0x8000 - 0x80FF (256 bytes):   Eigenvector Centrality Vector (64 f32)
  ;; 0x8100 - 0x81FF (256 bytes):   Temp Centrality Vector (64 f32)
  ;; 0x8200 - 0x823F (64 bytes):    Node Active Bitmask / Status
  ;; 0x9000 - 0x9FFF (4096 bytes):  Moebius Ingress / Egress Wire Buffer
  (memory (export "memory") 2 16)

  ;; Helper: Calculate matrix offset for (u, v) in 64x64 f32 matrix
  ;; offset = base + ((u * 64) + v) * 4
  (func $matrix_offset (param $base i32) (param $u i32) (param $v i32) (result i32)
    local.get $base
    local.get $u
    i32.const 6
    i32.shl ;; u * 64
    local.get $v
    i32.add
    i32.const 2
    i32.shl ;; * 4
    i32.add
  )

  ;; Initialize kernel state: zeroes matrices and sets active flags
  (func (export "init_kernel")
    (local $i i32)
    ;; Clear 32KB of memory (0x0000 to 0x8300)
    (local.set $i (i32.const 0))
    (block $done
      (loop $clear_loop
        (i32.ge_u (local.get $i) (i32.const 33536))
        (br_if $done)
        (i32.store (local.get $i) (i32.const 0))
        (local.set $i (i32.add (local.get $i) (i32.const 4)))
        (br $clear_loop)
      )
    )
  )

  ;; Bind an associative relation: clamps weight to [0.0, 1.0], stores in memory
  (func (export "bind_relation") (param $u i32) (param $v i32) (param $weight f32) (result f32)
    (local $clamped f32)
    (local $offset i32)
    ;; Bounds check u, v in [0, 63]
    (if (i32.or (i32.ge_u (local.get $u) (i32.const 64)) (i32.ge_u (local.get $v) (i32.const 64)))
      (then (return (f32.const 0.0)))
    )
    ;; Clamp weight
    (local.set $clamped (local.get $weight))
    (if (f32.lt (local.get $clamped) (f32.const 0.0))
      (then (local.set $clamped (f32.const 0.0)))
    )
    (if (f32.gt (local.get $clamped) (f32.const 1.0))
      (then (local.set $clamped (f32.const 1.0)))
    )
    ;; Store at 0x0000 offset
    (local.set $offset (call $matrix_offset (i32.const 0) (local.get $u) (local.get $v)))
    (f32.store (local.get $offset) (local.get $clamped))

    ;; Mark nodes active in 0x8200 table
    (i32.store8 (i32.add (i32.const 33280) (local.get $u)) (i32.const 1))
    (i32.store8 (i32.add (i32.const 33280) (local.get $v)) (i32.const 1))

    (local.get $clamped)
  )

  ;; Get relation weight between concept u and v
  (func (export "get_relation") (param $u i32) (param $v i32) (result f32)
    (if (i32.or (i32.ge_u (local.get $u) (i32.const 64)) (i32.ge_u (local.get $v) (i32.const 64)))
      (then (return (f32.const 0.0)))
    )
    (f32.load (call $matrix_offset (i32.const 0) (local.get $u) (local.get $v)))
  )

  ;; High-speed temporal decay pass: w = max(0.01, w * (1.0 - decayFactor))
  (func (export "decay_pass") (param $decay f32) (result i32)
    (local $i i32)
    (local $active_count i32)
    (local $val f32)
    (local $multiplier f32)
    (local.set $multiplier (f32.sub (f32.const 1.0) (local.get $decay)))
    (local.set $i (i32.const 0))
    (local.set $active_count (i32.const 0))

    (block $break_decay
      (loop $decay_loop
        (i32.ge_u (local.get $i) (i32.const 16384))
        (br_if $break_decay)

        (local.set $val (f32.load (local.get $i)))
        (if (f32.gt (local.get $val) (f32.const 0.001))
          (then
            (local.set $val (f32.mul (local.get $val) (local.get $multiplier)))
            ;; Enforce minimum baseline 0.01
            (if (f32.lt (local.get $val) (f32.const 0.01))
              (then (local.set $val (f32.const 0.01)))
            )
            (f32.store (local.get $i) (local.get $val))
            (local.set $active_count (i32.add (local.get $active_count) (i32.const 1)))
          )
        )

        (local.set $i (i32.add (local.get $i) (i32.const 4)))
        (br $decay_loop)
      )
    )

    (local.get $active_count)
  )

  ;; Prune decayed relations below threshold
  (func (export "prune_decayed") (param $threshold f32) (result i32)
    (local $i i32)
    (local $pruned_count i32)
    (local $val f32)
    (local.set $i (i32.const 0))
    (local.set $pruned_count (i32.const 0))

    (block $break_prune
      (loop $prune_loop
        (i32.ge_u (local.get $i) (i32.const 16384))
        (br_if $break_prune)

        (local.set $val (f32.load (local.get $i)))
        (if (i32.and (f32.gt (local.get $val) (f32.const 0.0)) (f32.lt (local.get $val) (local.get $threshold)))
          (then
            (f32.store (local.get $i) (f32.const 0.0))
            (local.set $pruned_count (i32.add (local.get $pruned_count) (i32.const 1)))
          )
        )

        (local.set $i (i32.add (local.get $i) (i32.const 4)))
        (br $prune_loop)
      )
    )

    (local.get $pruned_count)
  )

  ;; Transitive Closure Matrix Multiplication (Max-Product Semiring)
  ;; Computes indirect semantic path associations across up to 64 concepts
  (func (export "compute_transitive_closure") (param $max_hops i32) (result i32)
    (local $u i32)
    (local $v i32)
    (local $k i32)
    (local $direct f32)
    (local $hops i32)
    (local $path_count i32)
    (local $w_uk f32)
    (local $w_kv f32)
    (local $cand f32)
    (local $existing f32)

    ;; 1. Copy direct relations from 0x0000 to 0x4000
    (local.set $u (i32.const 0))
    (block $copy_break
      (loop $copy_loop
        (i32.ge_u (local.get $u) (i32.const 16384))
        (br_if $copy_break)
        (f32.store (i32.add (i32.const 16384) (local.get $u)) (f32.load (local.get $u)))
        (local.set $u (i32.add (local.get $u) (i32.const 4)))
        (br $copy_loop)
      )
    )

    ;; 2. Dynamic programming multi-hop propagation (Floyd-Warshall variant for max-product)
    (local.set $hops (i32.const 2))
    (block $break_hops
      (loop $hops_loop
        (i32.gt_u (local.get $hops) (local.get $max_hops))
        (br_if $break_hops)

        (local.set $k (i32.const 0))
        (block $k_break
          (loop $k_loop
            (i32.ge_u (local.get $k) (i32.const 64))
            (br_if $k_break)

            (local.set $u (i32.const 0))
            (block $u_break
              (loop $u_loop
                (i32.ge_u (local.get $u) (i32.const 64))
                (br_if $u_break)

                ;; Read closure[u][k]
                (local.set $w_uk (f32.load (call $matrix_offset (i32.const 16384) (local.get $u) (local.get $k))))
                (if (f32.gt (local.get $w_uk) (f32.const 0.01))
                  (then
                    (local.set $v (i32.const 0))
                    (block $v_break
                      (loop $v_loop
                        (i32.ge_u (local.get $v) (i32.const 64))
                        (br_if $v_break)

                        (if (i32.and (i32.ne (local.get $u) (local.get $v)) (i32.ne (local.get $k) (local.get $v)))
                          (then
                            ;; Read direct matrix[k][v]
                            (local.set $w_kv (f32.load (call $matrix_offset (i32.const 0) (local.get $k) (local.get $v))))
                            (if (f32.gt (local.get $w_kv) (f32.const 0.01))
                              (then
                                (local.set $cand (f32.mul (local.get $w_uk) (local.get $w_kv)))
                                (local.set $existing (f32.load (call $matrix_offset (i32.const 16384) (local.get $u) (local.get $v))))
                                (if (f32.gt (local.get $cand) (local.get $existing))
                                  (then
                                    (f32.store (call $matrix_offset (i32.const 16384) (local.get $u) (local.get $v)) (local.get $cand))
                                  )
                                )
                              )
                            )
                          )
                        )

                        (local.set $v (i32.add (local.get $v) (i32.const 1)))
                        (br $v_loop)
                      )
                    )
                  )
                )

                (local.set $u (i32.add (local.get $u) (i32.const 1)))
                (br $u_loop)
              )
            )

            (local.set $k (i32.add (local.get $k) (i32.const 1)))
            (br $k_loop)
          )
        )

        (local.set $hops (i32.add (local.get $hops) (i32.const 1)))
        (br $hops_loop)
      )
    )

    ;; Count transitive paths > 0.05
    (local.set $path_count (i32.const 0))
    (local.set $u (i32.const 0))
    (block $count_break
      (loop $count_loop
        (i32.ge_u (local.get $u) (i32.const 16384))
        (br_if $count_break)
        (if (f32.gt (f32.load (i32.add (i32.const 16384) (local.get $u))) (f32.const 0.05))
          (then (local.set $path_count (i32.add (local.get $path_count) (i32.const 1))))
        )
        (local.set $u (i32.add (local.get $u) (i32.const 4)))
        (br $count_loop)
      )
    )

    (local.get $path_count)
  )

  ;; Get Transitive Closure Path Weight
  (func (export "get_transitive_weight") (param $u i32) (param $v i32) (result f32)
    (if (i32.or (i32.ge_u (local.get $u) (i32.const 64)) (i32.ge_u (local.get $v) (i32.const 64)))
      (then (return (f32.const 0.0)))
    )
    (f32.load (call $matrix_offset (i32.const 16384) (local.get $u) (local.get $v)))
  )

  ;; Compute Eigenvector Centrality via Power Iteration in linear memory
  (func (export "compute_eigenvector_centrality") (param $iterations i32) (param $damping f32) (result f32)
    (local $it i32)
    (local $u i32)
    (local $v i32)
    (local $sum f32)
    (local $norm_sq f32)
    (local $norm f32)
    (local $w f32)
    (local $score_v f32)

    ;; Initialize vector at 0x8000 (32768) with 1.0 / sqrt(64) = 0.125
    (local.set $u (i32.const 0))
    (block $init_break
      (loop $init_loop
        (i32.ge_u (local.get $u) (i32.const 64))
        (br_if $init_break)
        (f32.store (i32.add (i32.const 32768) (i32.shl (local.get $u) (i32.const 2))) (f32.const 0.125))
        (local.set $u (i32.add (local.get $u) (i32.const 1)))
        (br $init_loop)
      )
    )

    (local.set $it (i32.const 0))
    (block $break_iter
      (loop $iter_loop
        (i32.ge_u (local.get $it) (local.get $iterations))
        (br_if $break_iter)

        (local.set $norm_sq (f32.const 0.0))
        (local.set $u (i32.const 0))
        (block $u_centrality_break
          (loop $u_centrality_loop
            (i32.ge_u (local.get $u) (i32.const 64))
            (br_if $u_centrality_break)

            (local.set $sum (f32.const 0.0))
            (local.set $v (i32.const 0))
            (block $v_centrality_break
              (loop $v_centrality_loop
                (i32.ge_u (local.get $v) (i32.const 64))
                (br_if $v_centrality_break)

                ;; Adjacency[v][u]
                (local.set $w (f32.load (call $matrix_offset (i32.const 0) (local.get $v) (local.get $u))))
                (local.set $score_v (f32.load (i32.add (i32.const 32768) (i32.shl (local.get $v) (i32.const 2)))))
                (local.set $sum (f32.add (local.get $sum) (f32.mul (local.get $w) (local.get $score_v))))

                (local.set $v (i32.add (local.get $v) (i32.const 1)))
                (br $v_centrality_loop)
              )
            )

            ;; Apply damping: sum + damping
            (local.set $sum (f32.add (local.get $sum) (local.get $damping)))
            ;; Store to temp vector at 0x8100 (33024)
            (f32.store (i32.add (i32.const 33024) (i32.shl (local.get $u) (i32.const 2))) (local.get $sum))
            (local.set $norm_sq (f32.add (local.get $norm_sq) (f32.mul (local.get $sum) (local.get $sum))))

            (local.set $u (i32.add (local.get $u) (i32.const 1)))
            (br $u_centrality_loop)
          )
        )

        ;; Normalize
        (local.set $norm (f32.sqrt (local.get $norm_sq)))
        (if (f32.lt (local.get $norm) (f32.const 0.0001))
          (then (local.set $norm (f32.const 1.0)))
        )

        ;; Copy back to 0x8000
        (local.set $u (i32.const 0))
        (block $norm_break
          (loop $norm_loop
            (i32.ge_u (local.get $u) (i32.const 64))
            (br_if $norm_break)
            (local.set $sum (f32.load (i32.add (i32.const 33024) (i32.shl (local.get $u) (i32.const 2)))))
            (f32.store (i32.add (i32.const 32768) (i32.shl (local.get $u) (i32.const 2))) (f32.div (local.get $sum) (local.get $norm)))
            (local.set $u (i32.add (local.get $u) (i32.const 1)))
            (br $norm_loop)
          )
        )

        (local.set $it (i32.add (local.get $it) (i32.const 1)))
        (br $iter_loop)
      )
    )

    (local.get $norm)
  )

  ;; Get Centrality of Concept Node
  (func (export "get_centrality") (param $node i32) (result f32)
    (if (i32.ge_u (local.get $node) (i32.const 64))
      (then (return (f32.const 0.0)))
    )
    (f32.load (i32.add (i32.const 32768) (i32.shl (local.get $node) (i32.const 2))))
  )

  ;; Zeroless S_K Manifold Projection
  ;; Scales raw float projections onto [-24, +24], strictly enforcing zero exclusion invariant
  ;; Writes (x, y, z) as 32-bit signed ints to out_ptr
  (func (export "project_sk_manifold") (param $proj_x f32) (param $proj_y f32) (param $proj_z f32) (param $out_ptr i32)
    (local $x i32)
    (local $y i32)
    (local $z i32)

    ;; Scale by 24.0 and convert to i32
    (local.set $x (i32.trunc_f32_s (f32.mul (local.get $proj_x) (f32.const 24.0))))
    (local.set $y (i32.trunc_f32_s (f32.mul (local.get $proj_y) (f32.const 24.0))))
    (local.set $z (i32.trunc_f32_s (f32.mul (local.get $proj_z) (f32.const 24.0))))

    ;; Canonical Zero Exclusion Invariant
    ;; If x == 0 -> +3 (if proj_x >= 0) else -3
    (if (i32.eq (local.get $x) (i32.const 0))
      (then
        (if (f32.ge (local.get $proj_x) (f32.const 0.0))
          (then (local.set $x (i32.const 3)))
          (else (local.set $x (i32.const -3)))
        )
      )
    )

    ;; If y == 0 -> +6 (if proj_y >= 0) else -6
    (if (i32.eq (local.get $y) (i32.const 0))
      (then
        (if (f32.ge (local.get $proj_y) (f32.const 0.0))
          (then (local.set $y (i32.const 6)))
          (else (local.set $y (i32.const -6)))
        )
      )
    )

    ;; If z == 0 -> +12 (if proj_z >= 0) else -12
    (if (i32.eq (local.get $z) (i32.const 0))
      (then
        (if (f32.ge (local.get $proj_z) (f32.const 0.0))
          (then (local.set $z (i32.const 12)))
          (else (local.set $z (i32.const -12)))
        )
      )
    )

    ;; Store at out_ptr: x at 0, y at 4, z at 8
    (i32.store (local.get $out_ptr) (local.get $x))
    (i32.store (i32.add (local.get $out_ptr) (i32.const 4)) (local.get $y))
    (i32.store (i32.add (local.get $out_ptr) (i32.const 8)) (local.get $z))
  )

  ;; S_K Euclidean Norm: sqrt(x^2 + y^2 + z^2)
  (func (export "calc_sk_norm") (param $x f32) (param $y f32) (param $z f32) (result f32)
    (f32.sqrt
      (f32.add
        (f32.add
          (f32.mul (local.get $x) (local.get $x))
          (f32.mul (local.get $y) (local.get $y))
        )
        (f32.mul (local.get $z) (local.get $z))
      )
    )
  )

  ;; Fast 32-bit FNV-1a Checksum for packets
  (func $fnv1a (param $ptr i32) (param $len i32) (result i32)
    (local $hash i32)
    (local $i i32)
    (local.set $hash (i32.const -2128831035)) ;; 0x811c9dc5
    (local.set $i (i32.const 0))

    (block $fnv_break
      (loop $fnv_loop
        (i32.ge_u (local.get $i) (local.get $len))
        (br_if $fnv_break)

        (local.set $hash (i32.xor (local.get $hash) (i32.load8_u (i32.add (local.get $ptr) (local.get $i)))))
        (local.set $hash (i32.mul (local.get $hash) (i32.const 16777619))) ;; FNV prime 0x01000193

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $fnv_loop)
      )
    )

    (local.get $hash)
  )

  ;; Export FNV1a
  (func (export "compute_fnv1a") (param $ptr i32) (param $len i32) (result i32)
    (call $fnv1a (local.get $ptr) (local.get $len))
  )

  ;; Pack Moebius Wire Packet (168 bytes layout in Wasm Linear Memory)
  ;; Layout:
  ;;  [0..3]:   Opcode 0x00000002
  ;;  [4..11]:  Peer ID (port 4001)
  ;;  [12..19]: TTL 64
  ;;  [20..23]: FNV-1a Checksum
  ;;  [24..31]: View (i64)
  ;;  [32..39]: Sequence ID (i64)
  ;;  [40..47]: Timestamp Nanoseconds (i64)
  ;;  [48..55]: S_K Coordinate X (i64)
  ;;  [56..63]: S_K Coordinate Y (i64)
  ;;  [64..71]: S_K Coordinate Z (i64)
  ;;  [72..103]: Payload Hash (32 bytes)
  ;;  [104..135]: Parent Proof Root (32 bytes)
  ;;  [136..167]: Signature (32 bytes)
  (func (export "pack_moebius_header") 
    (param $out_ptr i32)
    (param $view i64)
    (param $seq i64)
    (param $timestamp_ns i64)
    (param $sk_x i64)
    (param $sk_y i64)
    (param $sk_z i64)
    (result i32)

    ;; 1. Opcode: 0x00000002 (big endian / standard 4 bytes)
    ;; Store 0x00000002 (little-endian store: 0x02, 0x00, 0x00, 0x00, or big-endian)
    (i32.store8 (local.get $out_ptr) (i32.const 0))
    (i32.store8 (i32.add (local.get $out_ptr) (i32.const 1)) (i32.const 0))
    (i32.store8 (i32.add (local.get $out_ptr) (i32.const 2)) (i32.const 0))
    (i32.store8 (i32.add (local.get $out_ptr) (i32.const 3)) (i32.const 2))

    ;; 2. Peer Port (4001): 8 bytes
    (i64.store (i32.add (local.get $out_ptr) (i32.const 4)) (i64.const 4001))

    ;; 3. TTL (64): 8 bytes
    (i64.store (i32.add (local.get $out_ptr) (i32.const 12)) (i64.const 64))

    ;; 4. FNV Checksum placeholder: 4 bytes
    (i32.store (i32.add (local.get $out_ptr) (i32.const 20)) (i32.const -2128831035))

    ;; 5. View, Seq, Timestamp: 3 x 8 bytes
    (i64.store (i32.add (local.get $out_ptr) (i32.const 24)) (local.get $view))
    (i64.store (i32.add (local.get $out_ptr) (i32.const 32)) (local.get $seq))
    (i64.store (i32.add (local.get $out_ptr) (i32.const 40)) (local.get $timestamp_ns))

    ;; 6. S_K Coordinates (x, y, z): 3 x 8 bytes
    (i64.store (i32.add (local.get $out_ptr) (i32.const 48)) (local.get $sk_x))
    (i64.store (i32.add (local.get $out_ptr) (i32.const 56)) (local.get $sk_y))
    (i64.store (i32.add (local.get $out_ptr) (i32.const 64)) (local.get $sk_z))

    ;; Return total header & coordinates length written (72 bytes)
    (i32.const 72)
  )

  ;; Validate Moebius Ingress Packet
  ;; Returns:
  ;;  1 = VALID (168 bytes, correct opcode, zeroless invariant verified)
  ;;  0 = INVALID (Violated size, opcode, or zero coordinate)
  (func (export "validate_moebius_packet") (param $ptr i32) (param $len i32) (result i32)
    (local $opcode_b3 i32)
    (local $sk_x i64)
    (local $sk_y i64)
    (local $sk_z i64)

    ;; 1. Check length == 168
    (if (i32.ne (local.get $len) (i32.const 168))
      (then (return (i32.const 0)))
    )

    ;; 2. Check opcode == 2 (byte 3 in big-endian wire format)
    (local.set $opcode_b3 (i32.load8_u (i32.add (local.get $ptr) (i32.const 3))))
    (if (i32.ne (local.get $opcode_b3) (i32.const 2))
      (then (return (i32.const 0)))
    )

    ;; 3. Check zeroless S_K coordinate invariant
    (local.set $sk_x (i64.load (i32.add (local.get $ptr) (i32.const 48))))
    (local.set $sk_y (i64.load (i32.add (local.get $ptr) (i32.const 56))))
    (local.set $sk_z (i64.load (i32.add (local.get $ptr) (i32.const 64))))

    ;; Bar any zero coordinate
    (if (i64.eq (local.get $sk_x) (i64.const 0))
      (then (return (i32.const 0)))
    )
    (if (i64.eq (local.get $sk_y) (i64.const 0))
      (then (return (i32.const 0)))
    )
    (if (i64.eq (local.get $sk_z) (i64.const 0))
      (then (return (i32.const 0)))
    )

    ;; Valid packet
    (i32.const 1)
  )

  ;; Memory and telemetry query
  ;; Writes [active_nodes, active_edges, memory_pages, kernel_epoch] into out_ptr (16 bytes)
  (func (export "get_kernel_telemetry") (param $out_ptr i32)
    (local $u i32)
    (local $active_nodes i32)
    (local $active_edges i32)
    (local $val f32)

    (local.set $active_nodes (i32.const 0))
    (local.set $active_edges (i32.const 0))

    ;; Count active nodes from 0x8200 table
    (local.set $u (i32.const 0))
    (block $node_break
      (loop $node_loop
        (i32.ge_u (local.get $u) (i32.const 64))
        (br_if $node_break)
        (if (i32.load8_u (i32.add (i32.const 33280) (local.get $u)))
          (then (local.set $active_nodes (i32.add (local.get $active_nodes) (i32.const 1))))
        )
        (local.set $u (i32.add (local.get $u) (i32.const 1)))
        (br $node_loop)
      )
    )

    ;; Count active edges
    (local.set $u (i32.const 0))
    (block $edge_break
      (loop $edge_loop
        (i32.ge_u (local.get $u) (i32.const 16384))
        (br_if $edge_break)
        (local.set $val (f32.load (local.get $u)))
        (if (f32.gt (local.get $val) (f32.const 0.001))
          (then (local.set $active_edges (i32.add (local.get $active_edges) (i32.const 1))))
        )
        (local.set $u (i32.add (local.get $u) (i32.const 4)))
        (br $edge_loop)
      )
    )

    (i32.store (local.get $out_ptr) (local.get $active_nodes))
    (i32.store (i32.add (local.get $out_ptr) (i32.const 4)) (local.get $active_edges))
    (i32.store (i32.add (local.get $out_ptr) (i32.const 8)) (memory.size))
    (i32.store (i32.add (local.get $out_ptr) (i32.const 12)) (i32.const 40)) ;; 40Hz Gamma epoch
  )
)
