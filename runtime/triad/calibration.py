"""Measured, advisory calibration. No capacity formula is an admission predicate."""
from collections import deque
import math
from pathlib import Path
import threading
import time

class Calibration:
    def __init__(self, window=128, minimum_samples=32, latency_goal_ms=15.0):
        self.window=window;self.minimum_samples=minimum_samples;self.goal=latency_goal_ms
        self.samples=deque(maxlen=window);self.lock=threading.Lock();self.last_disk=None
        self.ema=None;self.observations=0;self.last_snapshot=-1
    def disk_busy(self):
        # Linux io_ticks reports milliseconds doing I/O, not device capacity.
        now=time.monotonic();current={}
        try:
            for line in Path('/proc/diskstats').read_text().splitlines():
                fields=line.split()
                if len(fields)>=14 and not fields[2].startswith(('loop','ram')):
                    current[fields[2]]=int(fields[12])
        except (OSError,ValueError):return None
        with self.lock:
            previous=self.last_disk;self.last_disk=(now,current)
        if not previous or not current:return None
        elapsed=(now-previous[0])*1000
        values=[max(0,min(1,(ticks-previous[1][device])/elapsed)) for device,ticks in current.items() if device in previous[1]]
        return max(values) if values else None
    def observe(self, latency_ms, contention, disk_busy):
        values=[latency_ms,contention]+([] if disk_busy is None else [disk_busy])
        if not all(math.isfinite(x) and x>=0 for x in values) or contention>1 or (disk_busy is not None and disk_busy>1):
            raise ValueError('Invalid observed metrics')
        with self.lock:
            self.samples.append((latency_ms,contention,disk_busy))
            self.observations+=1
    def snapshot(self):
        with self.lock:
            samples=list(self.samples)
            result={'sample_count':len(samples),'thread_pool_saturation':sum(x[1] for x in samples)/len(samples) if samples else 0,
                    'measurement_scope':'signed local UDS round-trip; host disk io_ticks; gRPC active/maximum workers',
                    'calibrated':False,'latency_sla_met':False,'policy_version':'advisory-moving-window-v1'}
            if not samples:return result
            p99=sorted(x[0] for x in samples)[math.ceil(.99*len(samples))-1]
            result['measured_p99_latency_ms']=p99
            if self.last_snapshot!=self.observations:
                alpha=2/(self.window+1)
                self.ema=p99 if self.ema is None else alpha*p99+(1-alpha)*self.ema
                self.last_snapshot=self.observations
            result['p99_latency_ema_ms']=self.ema
            disks=[x[2] for x in samples if x[2] is not None]
            if disks:result['disk_busy_fraction']=sum(disks)/len(disks)
            ready=len(samples)>=self.minimum_samples and bool(disks)
            result['calibrated']=ready
            result['latency_sla_met']=ready and p99<self.goal
            if ready:
                # Explicit policy coefficient; not a measured throughput limit.
                pressure=max(self.ema/self.goal,result['disk_busy_fraction'],result['thread_pool_saturation'])
                result['tolerance_index']=1/(1+pressure)
            return result
