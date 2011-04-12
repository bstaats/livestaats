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
from simplejson import dumps

class MainHandler(webapp.RequestHandler):
  def get(self):

    interval = [datetime.date.today().strftime('%Y-%m-%d'),
                (datetime.date.today() + datetime.timedelta(days = 1)).strftime('%Y-%m-%d')]

    df   = DataFetcher()
    data = df.rescuetime({'op': 'select',
                         'vn': 0,
                         'pv': 'interval',
                         'rs': 'hour',
                         'rb': interval[0],
                         're': interval[1],
                         'rk': 'category',
                         'ot': 'hour',
                         })

    temp_values = {'data':dumps(data),'interval':dumps(interval)}
    temp_file   = os.path.join(os.path.dirname(__file__), 'index.html')
    self.response.out.write(template.render(temp_file, temp_values))


def main():
  application = webapp.WSGIApplication([('/', MainHandler)],
                                       debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
