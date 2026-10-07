import csv
import os
import time
from datetime import datetime

class RollingCsvLogger:
    def __init__(self, log_dir="/opt/stratum_engine/logs", filename_prefix="stratum_metrics"):
        self.log_dir = log_dir
        self.filename_prefix = filename_prefix
        if not os.path.exists(self.log_dir):
            os.makedirs(self.log_dir)
        
        self.current_filename = self._generate_filename()
        self._init_file()

    def _generate_filename(self):
        date_str = datetime.now().strftime("%Y-%m-%d")
        return os.path.join(self.log_dir, f"{self.filename_prefix}_{date_str}.csv")

    def _init_file(self):
        if not os.path.exists(self.current_filename):
            with open(self.current_filename, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(["timestamp", "state", "difficulty", "shares_accepted", "shares_rejected", "latency_ms", "hashrate_ghs"])

    def log_metrics(self, state, difficulty, accepted, rejected, latency, hashrate):
        # Check if we need a new file (daily rotation)
        new_filename = self._generate_filename()
        if new_filename != self.current_filename:
            self.current_filename = new_filename
            self._init_file()

        with open(self.current_filename, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                datetime.now().isoformat(),
                state,
                difficulty,
                accepted,
                rejected,
                f"{latency:.2f}",
                f"{hashrate:.4f}"
            ])

# This can be integrated into FullyEngineeredStratumClient or run as a side-process
