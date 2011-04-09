#!/usr/bin/env python
# encoding: utf-8
"""
convert_to_text.py

Created by Brian Staats on 2011-04-05.
Copyright (c) 2011 Vusion Design Studios. All rights reserved.
"""

import sys,csv,urllib
import getopt, simplejson as json

HEADER = []

def option_parser():
  import optparse
  usage = 'Usage: %prog [options] table'

  parser = optparse.OptionParser(usage=usage)

  parser.add_option('-o', '--output', dest='output', metavar='FILE', default='-',
                    help='Output results (default is "-" for standard out)')
  parser.add_option('-f', '--format', dest='format', default='csv',
                    help='Output results format (default is csv)')

  return parser

def getdata(param):
  """docstring for getdata"""
  kwargs = {
      'sessionToken': param,
      'format': 'f'
  }
  url = BASE_URL + '?' + urllib.urlencode(kwargs)
  return json.load(urllib.urlopen(url))
  
def loadinput(filestring):
  """docstring for loadinput"""
  return csv.reader(open(filestring, 'rb'))

def parse(filereader):
  """docstring for parse"""
  HEADER = filereader.next()
  for row in filereader:
    yield row[3]

def main():
  parser = option_parser()
  options,args = parser.parse_args()

  if len(args) != 1:
    parser.print_help(sys.stderr)
    sys.exit(2)

  out   = open(options.output, 'w')

  prev = None
  for item in parse(loadinput(args[0])):
    if prev:
      out.write(prev.replace(' ','')+' and '+item.replace(' ','')+', ')
    prev = item

if __name__ == "__main__":
  main()
