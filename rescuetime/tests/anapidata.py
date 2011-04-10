import sys
import datetime

sys.path.append('../')

from rescuetime.api.service.Service import Service
from rescuetime.api.access.AnalyticApiKey import AnalyticApiKey
from rescuetime.api.model.ResponseData import ResponseData

def test1():
    s = Service('http://localhost:3000')
    s.debug(s.server_loc)
    k = AnalyticApiKey('B63C4fZ0bQb6iu1EXYPMhsFLT_VqUhutPiu9fIwP', s)
    s.debug('exists: ' + unicode(k.exists()))
    r = ResponseData(k, {'op': 'select',
                         'vn': 0,
                         'pv': 'rank',
                         'rb': (datetime.date.today() - datetime.timedelta(weeks = 1)).strftime('%Y-%m-%d'),
                         're': datetime.date.today().strftime('%Y-%m-%d'),
                         'rk': 'overview'
                         })
    r.sync()
    s.debug('data object: ' + unicode(r.object))
    s.debug('=============')
    for k in r.object:
        s.debug("\n\tkey: %s\n\tvalue:%s\n-------\n" % (unicode(k), unicode(r.object[k])))
        if k == 'rows':
            for ro in r.object[k]:
                s.debug("\n\t\trow(%d): %s\n-------\n" % (len(ro), unicode(ro)))

def test2():
    s = Service('http://localhost:3000')
    s.debug(s.server_loc)
    k = AnalyticApiKey('B63C4fZ0bQb6iu1EXYPMhsFLT_VqUhutPiu9fIwP', s)
    s.debug('exists: ' + unicode(k.exists()))
    r = ResponseData(k)
    today = datetime.date.today()
    r.params(operation = 'select').params(perspective = 'rank')
    r.params(version = 0,
             restrict_begin = (today - datetime.timedelta(weeks = 1)).strftime('%Y-%m-%d'),
             restrict_end = today.strftime('%Y-%m-%d'),
             restrict_kind = 'overview')

    r.sync()
    s.debug('data object: ' + unicode(r.object))
    s.debug('=============')
    for k in r.object:
        s.debug("\n\tkey: %s\n\tvalue:%s\n-------\n" % (unicode(k), unicode(r.object[k])))
        if k == 'rows':
            for ro in r.object[k]:
                s.debug("\n\t\trow(%d): %s\n-------\n" % (len(ro), unicode(ro)))

if __name__ == '__main__':
    test1()
    test2()
