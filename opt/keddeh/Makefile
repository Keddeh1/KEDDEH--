CC = gcc
CFLAGS = -std=c11 -O3 -Wall -Wextra -Werror \
         -D_GNU_SOURCE \
         -march=native -mavx2 \
         -fno-strict-aliasing \
         -fomit-frame-pointer \
         -pthread
LDFLAGS = -pthread -lrt

TARGET = bin/keddeh_mesh_runtime

all: $(TARGET)

$(TARGET): src/keddeh_mesh_runtime.c
	@mkdir -p bin
	$(CC) $(CFLAGS) $< -o $@ $(LDFLAGS)
	@echo "[+] keddeh_mesh_runtime compiled successfully with 64B cache line containment."

clean:
	rm -rf bin
	@echo "[*] Workspace cleaned."

.PHONY: all clean
