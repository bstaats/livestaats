#!/usr/bin/env python
# encoding: utf-8
"""
DataFetcher.py

Created by Brian Staats on 2011-04-10.
Copyright (c) 2011 Vusion Design Studios. All rights reserved.
"""

import sys
import os
import unittest

from rescuetime.api.service.Service import Service
from rescuetime.api.access.AnalyticApiKey import AnalyticApiKey
from rescuetime.api.model.ResponseData import ResponseData


class DataFetcher:
  def __init__(self):
    pass

  def rescuetime(self, params):
    """docstring for rescuetime"""
    s = Service()
    s.debug(s.server_loc)
    k = AnalyticApiKey('B63mNzrDeMVC_tMEIo5gBxGyf0eYonYTTRFcfR8s', s)
    r = ResponseData(k, params)
    r.sync()
    return r.object

class DataFetcherTests(unittest.TestCase):
  def setUp(self):
    pass


if __name__ == '__main__':
  unittest.main()