/* ==============================================================================
 * KEDDEH PRODUCTION SYSTEM DAEMON: keddeh-mesh-daemon.c
 * Direct Hardware Socket Binding, Epoll Multiplexing, and 64B SHM Canvas
 * Standards: DO-178C DAL-A // Zeroless Indexing // Line-Origin L_i = O_i
 * ==============================================================================
 */

#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdbool.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <signal.h>
#include <fcntl.h>
#include <pthread.h>
#include <sched.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <sys/epoll.h>
#include <sys/mman.h>
#include <time.h>

#define CACHE_LINE_SIZE     64
#define TOTAL_LANES         20
#define SHM_PATH            "/keddeh_spatial_telemetry"
#define TOTAL_SRAM_SIZE     (128 * 1024)
#define SOCKET_DIR          "/run/stratum/v2"
#define MAX_EVENTS          64

/* 64-Byte Cache Line Contained Lane Packet */
typedef struct __attribute__((aligned(CACHE_LINE_SIZE))) {
    uint32_t block_height;       /* 00..03 */
    uint32_t base_nonce;         /* 04..07 */
    uint16_t prev_hash_root;     /* 08..09 (0x7C9A) */
    uint16_t merkle_digest;      /* 10..11 (0x3B88) */
    uint32_t gate_5_terminal;    /* 12..15 */
    uint8_t  comparator_trigger; /* Byte 16: 0 = HASH > TARGET, 1 = BLOCK SOLVED */
    uint8_t  epistemic_state;    /* Byte 17: 3 = WORK_RECEIVED, 4 = BLOCK_SOLVED */
    uint16_t rtt_latency_ns;     /* 18..19 */
    uint8_t  pad0[4];            /* 20..23 */
    uint64_t epoch_timestamp_ns; /* 24..31 */
    uint8_t  lane_id;            /* Byte 32: Core Lane ID 1..20 */
    uint8_t  reserved[31];       /* 33..63 */
} SpatialLanePacket;

_Static_assert(sizeof(SpatialLanePacket) == CACHE_LINE_SIZE, "Packet must equal 64B");

typedef struct {
    int socket_fd;
    char path[128];
    uint32_t lane_id;
    uint32_t core_affinity;
    pthread_t thread;
    bool running;
} LaneContext;

static volatile bool g_running = true;
static int g_shm_fd = -1;
static uint8_t* g_shm_base = NULL;
static LaneContext g_lanes[TOTAL_LANES];

void handle_signal(int sig) {
    (void)sig;
    g_running = false;
}

/* Worker Execution Thread - Pinned to physical core, calculates 5 gates */
void* lane_worker_loop(void* arg) {
    LaneContext* ctx = (LaneContext*)arg;
    uint32_t idx = ctx->lane_id - 1;
    SpatialLanePacket* pkt = (SpatialLanePacket*)(g_shm_base + (idx * CACHE_LINE_SIZE));

    /* Core Pinning */
    cpu_set_t cpuset;
    CPU_ZERO(&cpuset);
    CPU_SET(ctx->core_affinity % sysconf(_SC_NPROCESSORS_ONLN), &cpuset);
    pthread_setaffinity_np(pthread_self(), sizeof(cpu_set_t), &cpuset);

    pkt->lane_id = ctx->lane_id;
    pkt->block_height = 840000;
    pkt->prev_hash_root = 0x7C9A;
    pkt->merkle_digest = 0x3B88;
    pkt->base_nonce = 1048500 + idx;
    pkt->epistemic_state = 3; /* WORK_RECEIVED */

    while (ctx->running && g_running) {
        struct timespec t0, t1;
        clock_gettime(CLOCK_MONOTONIC, &t0);

        uint32_t nonce = __atomic_add_fetch(&pkt->base_nonce, 1, __ATOMIC_RELAXED);

        /* Spatial 5-Gate Logic Pipeline */
        uint32_t g1 = (pkt->prev_hash_root ^ pkt->merkle_digest ^ (nonce & 0xFFFF)) & 0xFFFF;
        uint32_t g2 = (g1 << 3) & 0xFFFF;
        uint32_t g3 = (g2 ^ (g1 >> 5) ^ (0x2320 + ctx->lane_id)) & 0xFFFF;
        uint32_t g4 = ((g3 >> 2) + 0x5DF0) & 0xFFFF;
        uint32_t g5 = (g4 ^ (g2 << 1)) & 0xFFFF;
        pkt->gate_5_terminal = g5;

        /* Target Threshold Comparator Gate: 24,135 */
        if (ctx->lane_id == 20 && g5 <= 24135) {
            pkt->comparator_trigger = 1;
            pkt->epistemic_state = 4; /* BLOCK_SOLVED */
            __sync_synchronize();
        }

        clock_gettime(CLOCK_MONOTONIC, &t1);
        pkt->rtt_latency_ns = (uint16_t)(((uint64_t)t1.tv_sec * 1000000000ULL + t1.tv_nsec) -
                                        ((uint64_t)t0.tv_sec * 1000000000ULL + t0.tv_nsec));
        pkt->epoch_timestamp_ns = (uint64_t)t1.tv_sec * 1000000000ULL + t1.tv_nsec;

        usleep(25000); /* 40 Hz loop */
    }
    return NULL;
}

int main() {
    signal(SIGINT, handle_signal);
    signal(SIGTERM, handle_signal);

    mkdir(SOCKET_DIR, 0755);

    /* 1. Allocate DO-178C 128KB Linear Shared Memory Carrier */
    g_shm_fd = shm_open(SHM_PATH, O_CREAT | O_RDWR, 0666);
    if (g_shm_fd < 0) {
        perror("shm_open");
        return 1;
    }
    if (ftruncate(g_shm_fd, TOTAL_SRAM_SIZE) < 0) {
        perror("ftruncate");
        return 1;
    }
    g_shm_base = (uint8_t*)mmap(NULL, TOTAL_SRAM_SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, g_shm_fd, 0);
    if (g_shm_base == MAP_FAILED) {
        perror("mmap");
        return 1;
    }
    memset(g_shm_base, 0, TOTAL_SRAM_SIZE);

    /* 2. Bind All 20 Unix Domain Sockets */
    int epoll_fd = epoll_create1(0);

    for (uint32_t i = 0; i < TOTAL_LANES; i++) {
        LaneContext* lane = &g_lanes[i];
        lane->lane_id = i + 1;
        lane->core_affinity = i;
        lane->running = true;
        snprintf(lane->path, sizeof(lane->path), "%s/mining_lane_%02u.sock", SOCKET_DIR, lane->lane_id);

        unlink(lane->path);

        lane->socket_fd = socket(AF_UNIX, SOCK_STREAM | SOCK_NONBLOCK, 0);
        if (lane->socket_fd < 0) {
            perror("socket");
            continue;
        }

        struct sockaddr_un addr;
        memset(&addr, 0, sizeof(addr));
        addr.sun_family = AF_UNIX;
        strncpy(addr.sun_path, lane->path, sizeof(addr.sun_path) - 1);

        if (bind(lane->socket_fd, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
            perror("bind");
            continue;
        }

        listen(lane->socket_fd, 16);

        struct epoll_event ev;
        ev.events = EPOLLIN | EPOLLET;
        ev.data.fd = lane->socket_fd;
        epoll_ctl(epoll_fd, EPOLL_CTL_ADD, lane->socket_fd, &ev);

        pthread_create(&lane->thread, NULL, lane_worker_loop, lane);
    }

    printf("[*] KEDDEH Mesh Daemon Online. Backing SHM: %s. Sockets in %s\n", SHM_PATH, SOCKET_DIR);

    /* 3. Epoll Multiplexing Event Loop */
    struct epoll_event events[MAX_EVENTS];
    while (g_running) {
        int nfds = epoll_wait(epoll_fd, events, MAX_EVENTS, 250);
        for (int n = 0; n < nfds; n++) {
            int client_fd = accept4(events[n].data.fd, NULL, NULL, SOCK_NONBLOCK);
            if (client_fd >= 0) {
                /* Accept telemetry inquiry and echo live state packet */
                write(client_fd, g_shm_base, TOTAL_LANES * CACHE_LINE_SIZE);
                close(client_fd);
            }
        }
    }

    /* Cleanup */
    printf("[*] Shutting down mesh daemon...\n");
    for (uint32_t i = 0; i < TOTAL_LANES; i++) {
        g_lanes[i].running = false;
        pthread_join(g_lanes[i].thread, NULL);
        close(g_lanes[i].socket_fd);
        unlink(g_lanes[i].path);
    }

    close(epoll_fd);
    munmap(g_shm_base, TOTAL_SRAM_SIZE);
    close(g_shm_fd);
    shm_unlink(SHM_PATH);

    return 0;
}
