import { SoftwarePackage } from '../types';
import { HTML5_APP_TEMPLATES } from './html5Apps';

const BASE_SOFTWARE: SoftwarePackage[] = [
  {
    id: 'pkg-nginx',
    name: 'NGINX High-Perf Reverse Proxy',
    category: 'web',
    version: '1.26.1 LTS',
    description: 'Ultra-low latency HTTP/3 reverse proxy, load balancer, and static file server.',
    longDescription: 'NGINX is designed to deliver low memory usage and high concurrency with asynchronous event-driven I/O. Ideal for routing incoming cluster traffic to local VFS web apps and microservices.',
    icon: 'globe',
    serviceName: 'nginx.service',
    defaultPort: 80,
    protocol: 'HTTP',
    isInstalled: true,
    isRunning: true,
    sizeMb: 42,
    dependencies: ['libpcre2-8', 'zlib1g', 'libssl3'],
    maintainer: 'NGINX Open Source / Debian Core',
    license: '2-Clause BSD',
    installCommand: 'apt-get install -y nginx-full',
    configFile: {
      path: '/etc/nginx/nginx.conf',
      content: `user www-data;\nworker_processes auto;\npid /run/nginx.pid;\nevents {\n  worker_connections 2048;\n  multi_accept on;\n}\nhttp {\n  sendfile on;\n  tcp_nopush on;\n  keepalive_timeout 65;\n  types_hash_max_size 2048;\n\n  server {\n    listen 80 default_server;\n    server_name serverspace.internal;\n\n    location / {\n      proxy_pass http://127.0.0.1:3000;\n      proxy_set_header Host $host;\n      proxy_set_header X-Real-IP $remote_addr;\n    }\n  }\n}`
    }
  },
  {
    id: 'pkg-braink-daemon',
    name: 'A. Keddeh Braink Neural Daemon',
    category: 'ai',
    version: '4.8.0-dalA',
    description: 'Sovereign bio-centric augmented intelligence service with DO-178C DAL-A verified Wasm loops.',
    longDescription: 'Real-time structural operational semantics (SOS) inference engine executing bounded 40Hz gamma resonance cycles with zero-knowledge cryptographic state transitions.',
    icon: 'brain',
    serviceName: 'brainkd.service',
    defaultPort: 4040,
    protocol: 'WS',
    isInstalled: true,
    isRunning: true,
    sizeMb: 58,
    dependencies: ['wasmtime-runtime', 'libsecp256k1-1'],
    maintainer: 'A. Keddeh & SERVERspace Systems',
    license: 'Sovereign Core / Open Research',
    installCommand: 'systemctl enable --now brainkd.service',
    configFile: {
      path: '/etc/braink/substrate.conf',
      content: `# A. Keddeh Braink Augmented Intelligence Daemon\noscillator_frequency_hz = 40.0\nformal_verification_standard = "DO-178C DAL-A"\nabstract_lattice_zero_free = true\nzero_knowledge_proof_rate_per_sec = 60\ntransitive_closure_max_depth = 8\nmemory_alignment_bytes = 131072`
    }
  },
  {
    id: 'pkg-docker',
    name: 'Docker Engine & Containerd',
    category: 'dev',
    version: '27.1.1-ce',
    description: 'Enterprise container runtime for sandboxed microservices and isolated runtimes.',
    longDescription: 'Docker enables lightweight application packaging with containerized namespaces, cgroups resource controls, and overlayfs storage drivers running on top of KEX Linux.',
    icon: 'layers',
    serviceName: 'docker.service',
    defaultPort: 2375,
    protocol: 'TCP',
    isInstalled: true,
    isRunning: true,
    sizeMb: 248,
    dependencies: ['containerd.io', 'iptables', 'libseccomp2'],
    maintainer: 'Docker Community Engine',
    license: 'Apache-2.0',
    installCommand: 'apt-get install -y docker-ce docker-ce-cli containerd.io',
    configFile: {
      path: '/etc/docker/daemon.json',
      content: `{\n  "log-driver": "json-file",\n  "log-opts": {\n    "max-size": "100m",\n    "max-file": "3"\n  },\n  "storage-driver": "overlay2",\n  "default-ulimits": {\n    "nofile": {\n      "Name": "nofile",\n      "Hard": 64000,\n      "Soft": 64000\n    }\n  }\n}`
    }
  },
  {
    id: 'pkg-postgres',
    name: 'PostgreSQL Relational DB',
    category: 'database',
    version: '16.4',
    description: 'ACID-compliant object-relational database with JSONB indexing and streaming replication.',
    longDescription: 'World-renowned SQL engine optimized for analytical and transactional workloads with write-ahead logging (WAL), multi-version concurrency control (MVCC), and pgvector support.',
    icon: 'database',
    serviceName: 'postgresql.service',
    defaultPort: 5432,
    protocol: 'TCP',
    isInstalled: true,
    isRunning: true,
    sizeMb: 185,
    dependencies: ['libpq5', 'postgresql-client-16', 'glibc-locales'],
    maintainer: 'PostgreSQL Global Development Group',
    license: 'PostgreSQL License',
    installCommand: 'apt-get install -y postgresql-16 postgresql-contrib',
    configFile: {
      path: '/etc/postgresql/16/main/postgresql.conf',
      content: `# PostgreSQL 16 Server Configuration\nlisten_addresses = '*'\nport = 5432\nmax_connections = 100\nshared_buffers = 512MB\neffective_cache_size = 2GB\nmaintenance_work_mem = 128MB\ncheckpoint_completion_target = 0.9\nwal_buffers = 16MB\ndefault_statistics_target = 100\nrandom_page_cost = 1.1`
    }
  },
  {
    id: 'pkg-nodejs',
    name: 'Node.js LTS & pnpm Toolchain',
    category: 'dev',
    version: '22.8.0',
    description: 'V8 JavaScript and TypeScript runtime for asynchronous server-side APIs and fullstack apps.',
    longDescription: 'Modern ECMAScript runtime with native WebAssembly support, built-in test runner, fetch API, and high-performance libuv asynchronous event loop.',
    icon: 'cpu',
    serviceName: 'node-app.service',
    defaultPort: 3000,
    protocol: 'HTTP',
    isInstalled: true,
    isRunning: true,
    sizeMb: 94,
    dependencies: ['libc6', 'libstdc++6'],
    maintainer: 'OpenJS Foundation',
    license: 'MIT',
    installCommand: 'curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs',
  },
  {
    id: 'pkg-stratum-miner',
    name: 'Stratum+TCP Core Mining Engine',
    category: 'monitoring',
    version: '2.0.4-keddeh',
    description: 'Enterprise-grade Stratum+TCP mining client with Secure TLS v1.3 Control Centre.',
    longDescription: 'The Stratum Mining Engine is a multi-threaded Python 3.12+ execution environment designed for high-throughput share submission and real-time monotonic telemetry tracking.',
    icon: 'zap',
    serviceName: 'stratum-core.service',
    defaultPort: 8443,
    protocol: 'HTTPS',
    isInstalled: true,
    isRunning: true,
    sizeMb: 12.4,
    dependencies: ['python3.12-venv', 'libssl-dev', 'openssl'],
    maintainer: 'A. Keddeh',
    license: 'Sovereign Core License',
    installCommand: 'chmod +x bootstrap.sh && ./bootstrap.sh',
  }
];

export const INITIAL_SOFTWARE_PACKAGES: SoftwarePackage[] = [
  ...BASE_SOFTWARE,
  ...HTML5_APP_TEMPLATES.map(app => ({
    id: `app-${app.id}`,
    name: app.title,
    category: app.id.includes('os') || app.id.includes('boot') ? 'dev' : app.category.split(' ')[0].toLowerCase() as any,
    version: '1.0.0-stable',
    description: app.description,
    longDescription: `Full-fidelity HTML5 application conforming to A. Keddeh Technology Standards. Deploys as an executable binary in /bin/${app.id}.html with direct kernel syscall access.`,
    icon: 'file-code',
    serviceName: `${app.id}.app`,
    isInstalled: app.id === 'kex-bootchain' || app.id === 'kex-linux-terminal',
    isRunning: false,
    sizeMb: Math.round(app.code.length / 1024 / 10.24) / 10, // KB to MB approximation
    dependencies: app.id.includes('kex') ? ['pkg-braink-daemon', 'pkg-nodejs'] : ['pkg-nodejs'],
    maintainer: 'A. Keddeh Sovereign Labs',
    license: 'Proprietary / Sovereign',
    installCommand: `kex-pkg install /repo/apps/${app.id}.html`,
    configFile: {
      path: `/etc/apps/${app.id}.json`,
      content: `{\n  "app_id": "${app.id}",\n  "permissions": ["vfs_read", "kernel_telemetry"],\n  "membrane_isolation": true\n}`
    }
  }))
];
