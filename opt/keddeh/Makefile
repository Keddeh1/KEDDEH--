CC = gcc
CFLAGS = -std=c11 -O3 -Wall -Wextra -Werror \
         -D_GNU_SOURCE \
         -march=native -mavx2 \
         -fno-strict-aliasing \
         -fomit-frame-pointer \
         -pthread
LDFLAGS = -pthread -lrt

TARGET = bin/keddeh_mesh_runtime
DAEMON_TARGET = bin/keddeh-mesh-daemon

all: $(TARGET) $(DAEMON_TARGET)

$(TARGET): src/keddeh_mesh_runtime.c
	@mkdir -p bin
	$(CC) $(CFLAGS) $< -o $@ $(LDFLAGS)
	@echo "[+] keddeh_mesh_runtime compiled successfully with 64B cache line containment."

$(DAEMON_TARGET): src/keddeh-mesh-daemon.c
	@mkdir -p bin
	$(CC) $(CFLAGS) $< -o $@ $(LDFLAGS)
	@echo "[+] keddeh-mesh-daemon compiled for configs/keddeh-mesh.service."

clean:
	rm -rf bin
	@echo "[*] Workspace cleaned."

.PHONY: all clean
