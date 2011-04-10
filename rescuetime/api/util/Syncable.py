from time import time as now
from threading import RLock

class Syncable(object):
    _default_delay = 60
    
    def __init__(self, *args, **kwargs):
        self.last_sync = 0
        self.delay = self._default_delay
        self._sync_lock = RLock()

    def sync(self, *args, **kwargs):
        result = None
        mome = now()
        self._sync_lock.acquire()
        if (self.last_sync + self.delay) < mome:
            result = self.sync_func(*args, **kwargs)
            self.last_sync = mome
        self._sync_lock.release()
        return result

    def sync_func(self, *args, **kwargs):
        return self
