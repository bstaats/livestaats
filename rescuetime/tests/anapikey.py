import sys

sys.path.append('../')

from rescuetime.api.service.Service import Service
from rescuetime.api.access.AnalyticApiKey import AnalyticApiKey


def test1():
    s = Service('http://localhost:3000')
    s.debug(s.server_loc)
    k = AnalyticApiKey('B63bQg1ipu37TmXLK4aH3gZgLWFmYJltMb2CBjCs', s)
    s.debug('exists: ' + unicode(k.exists()))


def test2():
    s = Service('http://localhost:3000')
    s.debug(s.server_loc)
    k = AnalyticApiKey('xxx', s)
    k.exists()
    s.debug('exists: ' + unicode(k.exists()))


if __name__ == '__main__':
    test1()
    test2()
