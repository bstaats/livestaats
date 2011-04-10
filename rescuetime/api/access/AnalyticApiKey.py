
from rescuetime.api.util.Syncable import Syncable

class AnalyticApiKey(Syncable):
    def __init__(self, key_name = None, service = None):
        super(AnalyticApiKey, self).__init__()
        self.key_name = key_name
        self.short_name = "k" + key_name[3:6]
        self.service = service
        self.attributes = None

    def for_service(self, service = None):
        self.service = service
        return self.service

    def active(self):
        pass

    def exists(self):
        self.sync()        
        return (self.attributes is not None)

    def sync_func(self,*args, **kws):
        self.attributes = self.service.fetch_key(self)
        self.service.debug('attrs: ' + unicode(self.attributes))

