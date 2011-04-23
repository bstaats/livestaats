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
from datetime import datetime,timedelta
import logging

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template

from dataservices.DataFetcher import DataFetcher
from simplejson import dumps, loads
from tz_helper import timezone


class DataHandler(webapp.RequestHandler):
  def get(self):
    days = int(self.request.get('days'))
    if not days:
      days = 0

    unit = 'hour'
    if days>6:
      unit = 'day'

    now      = datetime.now(timezone('UTC')).astimezone(timezone('US/Eastern'))
    interval = [(now - timedelta(days = days)).replace(hour=0,minute=0,second=0), now.replace(hour=23,minute=0,second=0)]
    params   = {
               'pv': 'interval',
               'rs': unit,
               'rb': interval[0].strftime('%Y/%m/%d'),
               're': (interval[1] + timedelta(days = 1)).strftime('%Y/%m/%d'),
               'rk': 'category'
               }

    df       = DataFetcher()
    data     = df.rescuetime(params)

    for d in data['rows']:
      d[0] = datetime.strptime(d[0],'%Y-%m-%dT%H:%M:%S').strftime('%Y/%m/%d %H:%M:%S')

    self.response.out.write(dumps({'data':data,'interval':[i.strftime('%Y/%m/%d %H:%M:%S') for i in interval]}))


class MainHandler(webapp.RequestHandler):
  def get(self):
    temp_values = {}
    temp_file   = os.path.join(os.path.dirname(__file__), 'index.html')
    self.response.out.write(template.render(temp_file, temp_values))


def main():
  application = webapp.WSGIApplication([('/', MainHandler),
                                        ('/data',  DataHandler)
                                       ],
                                       debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
