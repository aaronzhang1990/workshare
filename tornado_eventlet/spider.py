#!/usr/bin/python
# -*- coding: utf-8 -*-
import eventlet, urllib2
from bs4 import BeautifulSoup

class Spider(object):
	def __init__(self, url):
		self.urls = isinstance(url, list) and url or [url]
	def exact_links(self, data):
		pass
	def start(self, url):
		pool = eventlet.GreenPool()
		for rst in pool.imap(self.fetch, self.urls):
			self.on_data(rst)
	def fetch(self, url):
		data = urllib2.urlopen(url).read()
		self.exact_links(data)
		return data
	def on_data(self, data):
		pass
	def reset(self):
		self.urls = []

class CNBlogSpider(Spider):
	def __init__(self, url, lang, kw):
		Spider.__init__(self, url)
		self.url = '%s/cate/%s' % (url.rstrip('/'), lang)
		if kw:
			self.kw = kw
	def exact_links(self, data):
		pass
	def on_data(self, data):
		pass