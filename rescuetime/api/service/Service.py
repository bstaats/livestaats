import urllib2
import urllib
import logging
import sys
from rescuetime.api.util.JSONInterface import JSONInterface

class Service(object):
    """The Service class provides an object that mediates access to the RescueTime Data API.
The constructor accepts 2 arguments, a location and an alternate logger.
The default location is the standard for general use. The default logger uses STDOUT
and has the 'rescuetime.api' as its namespace.
"""
    _base = "anapi"
    _hello = "hello"
    _has_key = "has_key"
    _data = "data"
    _logger = logging.getLogger('rescuetime.api')
    _logger.setLevel(logging.DEBUG)
    _fh = logging.StreamHandler(sys.stdout)
    _fh.setFormatter(logging.Formatter("%(asctime)s - %(filename)s %(funcName)s:%(lineno)s - %(levelname)s - %(message)s"))
    _logger.addHandler(_fh)

    def __init__(self, server_loc = 'https://www.rescuetime.com', logger = None):
        self.server_loc = server_loc[0:-1] if server_loc[-1] == '/' else server_loc
        self.logger = self._logger if logger is None else logger

    def to_path(self, *args):
        return "/".join([self.server_loc, self._base] + [x for x in args])

    def hello(self):
        """This function tests connectivity to the service."""
        response = urllib2.urlopen("/".join([self.server_loc, self._hello]))
        return response.read()
        
    def fetch_key(self, key = None):
        """Tests if key is valid."""
        response = urllib2.urlopen(self.to_path(self._has_key), urllib.urlencode({ 'rtapi_key' : key.key_name }))
        return JSONInterface.for_response(response.read()).object

    def fetch_data(self, key = None, parameters = None):
        """Proxy function for fetching data."""
        params = parameters if parameters is not None else {}
        params['rtapi_key'] = key.key_name
        params['via'] = 'pyrt'
        params['format'] = 'json'
        response = urllib2.urlopen(self.to_path(self._data), urllib.urlencode(params))
        
        return JSONInterface.for_response(response.read(), True).object
        

    def debug(self, *args):
        return self.logger.debug(*args)
