from rescuetime.api.util.Syncable import Syncable

## We try to use memcache for local cacheing
try:
    from google.appengine.api import memcache
except ImportError:
    try:
        import memcache
    except ImportError:
        class _memcache(object):
            def set(self, *args, **kws):
                return None
            def get(self, *args, **kws):
                return None
        memcache = _memcache()
import pickle

class ResponseData(Syncable):
    ## maps pretty names to short names to reduce GET size
    HTTP_PARAMS = { "operation"        : "op",
                    "version"          : "vn",
                    "perspective"      : "pv", 
                    "resolution_time"  : "rs", 
                    "restrict_group"   : "rg", 
                    "restrict_user"    : "ru", 
                    "restrict_profile" : "rp", 
                    "restrict_begin"   : "rb",
                    "restrict_end"     : "re",
                    "restrict_project" : "rj", 
                    "restrict_kind"    : "rk", 
                    "restrict_thing"   : "rt", 
                    "restrict_thingy"  : "ry", 
                    "order_time"       : "ot",
                    "order_item_by"    : "ob",
                    "order_item"       : "oi" }
    HTTP_PARAMS_R = {}
    for k in  HTTP_PARAMS:
        HTTP_PARAMS_R[HTTP_PARAMS[k]] = k

    def __init__(self, key = None, **kws):
        super(ResponseData, self).__init__()
        self.key = key
        self._parameters = {}
        self.params(**kws)
        self.cache_expire = 300 # 5 min default
        self._cache_key = None
        self.object = None

    def sync_func(self, *args, **kws):
        ob = memcache.get(self.cache_key())
        if ob is not None:
            self.object = pickle.loads(ob)
        else:
            self.object = self.key.service.fetch_data(self.key, self._parameters)
            memcache.set(self.cache_key(), pickle.dumps(self.object), self.cache_expire)
        return self.object

    def params(self, **kws):
        self._cache_key = None # reset cache key
        self.last_sync = 0 # reset sync delay
        for k in kws:
            try:
                self._parameters[self.HTTP_PARAMS[k]] = kws[k]
            except KeyError:
                try:
                    if self.HTTP_PARAMS[k]: 
                        self._parameters[k] = kws[k]
                except KeyError: # check if key is there else raise
                    if self.HTTP_PARAMS_R[k]:
                        self._parameters[self.HTTP_PARAMS_R[k]] = kws[k]
                    
        return self
    param = params
    p = params
    parameter = params
    parameters = params

    def cache_key(self):
        if self._cache_key == None:
            akey = ["%s-%s" % (unicode(k), unicode(self._parameters[k])) for k in self._parameters]
            akey.append(self.key.key_name)
            self._cache_key = ",".join(akey)
        return self._cache_key
