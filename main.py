#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import os
import datetime

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template

from dataservices.DataFetcher import DataFetcher
from simplejson import dumps, loads
#from utils import getTimezone, UTC
from tz_helper import timezone

class DataHandler(webapp.RequestHandler):
  """docstring for DataHandler"""
  def get(self):
    #utc_dt = datetime(2002, 10, 27, 6, 0, 0, tzinfo=utc)
    #loc_dt = utc_dt.astimezone(eastern)
    
    now = datetime.datetime.now(timezone('UTC')).astimezone(timezone('US/Eastern'))

    interval = [now.strftime('%Y-%m-%d'),
                (now + datetime.timedelta(days = 1)).strftime('%Y-%m-%d')]

    params   = {
               'pv': 'interval',
               'rs': 'hour',
               'rb': interval[0],
               're': interval[1],
               'rk': 'category'
               }

    df   = DataFetcher()
    data = df.rescuetime(params)

    if data and not data['rows']:
      interval[0] = (now - datetime.timedelta(days = 6)).strftime('%Y-%m-%d')

      params['rs'] = 'hours'
      params['rb'] = interval[0]
      params['re'] = interval[1]

      data = df.rescuetime(params)

    self.response.out.write(dumps({'data':data,'interval':interval}))


class MainHandler(webapp.RequestHandler):
  def get(self):
    temp_values = {}
    temp_file   = os.path.join(os.path.dirname(__file__), 'index.html')
    self.response.out.write(template.render(temp_file, temp_values))


def main():
  application = webapp.WSGIApplication([('/', MainHandler),
                                        ('/data', DataHandler)
                                       ],
                                       debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
