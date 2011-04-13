import logging
import datetime
from google.appengine.api import memcache
import pytz
from pytz import timezone

UTC = pytz.utc

def est_tz(datetime):
  ''' converts utc timezones coming from ds or now() to eastern'''
  est = getTimezone('US/Eastern')
  return UTC.localize(datetime).astimezone(est)


def getTimezone(tzname):
  try:
    tz = memcache.get("tz:%s" % tzname)
  except:
    tz = None
    logging.debug("timezone get failed: %s" % tzname)
  if tz is None:
    tz = timezone(tzname)
    memcache.add("tz:%s" % tzname, tz, 86400)
    logging.debug("timezone memcache added: %s" % tzname)
  else:
    logging.debug("timezone memcache hit: %s" % tzname)

  return tz


def timeZone():
  ''' THIS DOES NOT WORK ON THE GOOGLE APP ENGINE
      sets system clock to current time zone '''
  os.environ['TZ'] = 'EST+05EDT,M4.1.0,M10.5.0'
  return time.tzset()
