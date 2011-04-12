try:
    from cjson import decode as deserialize
    from cjson import encode as serialize
except ImportError:
    try:
        from django.utils.simplejson import loads as deserialize
        from django.utils.simplejson import dumps as serialize
    except ImportError:
        try:
            from json import read as deserialize
            from json import write as serialize
        except ImportError, e:
            raise ImportError('Could not find a suitable json library: ' + unicode(e))

class JSONInterface(object):
    @classmethod
    def to_json(cls, data):
        return serialize(data)
    @classmethod
    def from_json(cls, json):
        return deserialize(json)

    @classmethod
    def for_response(cls, response = None, raw = False):
        j = cls()
        j._json = response
        j._data = cls.from_json(j._json)
        if raw:
            j.object = j._data
            return j 
        
        # our little envelope
        j.status = j._data['c']
        try:
            j.object = j._data['d']
        except KeyError:
            pass
        if j.status[0] != 0:
            try:
                j.errors = j._data['e']
            except KeyError:
                pass
        return j
