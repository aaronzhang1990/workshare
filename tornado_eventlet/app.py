#!/usr/bin/python
# -*- coding: utf-8 -*-
from tornado.web import RequestHandler, Application, asynchronous
from tornado.ioloop import IOLoop

class MainHandler(RequestHandler):
	def get(self):
		self.render('index.html')
	def post(self):
		pass

class ResourceHandler(RequestHandler):
	@asynchronous
	def get(self):
		url = self.get_argument('url')
		lang = self.get_argument('lang')
		kw = self.get_argument('kw', '')
	def post(self):
		pass

def main():
	app = Application([
		(r'/', MainHandler),
		(r'/res', ResourceHandler)
	], debug=True, gzip=True, cookie_secret='nice to meet you', template_path='templates', static_path='public', static_url_prefix="/public/");
	app.listen(8000)
	IOLoop.instance().start()

if __name__ == "__main__":
	main()