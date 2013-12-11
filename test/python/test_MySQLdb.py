#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
reload(sys)
sys.setdefaultencoding('utf-8')
from bs4 import BeautifulSoup
import MySQLdb as mysql
import urllib2, re

def connect(config):
	config = config or {}
	config['user'] =  'root'
	config['passwd'] = 'oseasy_db'
	config['db'] = 'test'
	config['charset'] = 'utf8'
	config['use_unicode'] = True
	return mysql.connect(**config)

class Blog(object):
	def __init__(self):
		self._conn = connect(None)
		self._conn.set_character_set('utf8')
		self._validate_tables()
	def _validate_tables(self):
		cursor = self._conn.cursor()
		cursor.execute('show tables;')
		records = cursor.fetchall()
		isValid = False
		for rc in records:
			if rc[0] == 'blog':
				isValid = True
		if not isValid:
			self._create_tables(cursor)
	def _create_tables(self, cursor):
		sql = '''create table blog(
			id int primary key not null auto_increment,
			title varchar(255) not null,
			content varchar(30000) not null,
			created_at timestamp
		)'''
		cursor.execute(sql)
	def create_blog(self, title, content):
		cursor = self._conn.cursor()
		cursor.execute('insert into blog (title, content) values (%s, %s);', [title, content])
		cursor.fetchall()
	def list_blog(self):
		cursor = self._conn.cursor()
		cursor.execute('select * from blog;')
		return cursor.fetchall()
	def delete_blog(self, id):
		cursor = self._conn.cursor()
		cursor.execute('delete from blog where id=%d', [id])
	def update_blog(self, id, title, content):
		cursor = self._conn.cursor()
		cursor.execute('udpate blog set title=%s, content=%s where id=%d', [title, content, id])
	def sync(self):
		self._conn.commit()

def create_blog_by_url(model, url):
	resp = urllib2.urlopen(url)
	bs = BeautifulSoup(resp.read().decode('utf-8'))
	title = bs.title.text
	content = bs.select('#cnblogs_post_body')
	if not len(content):
		return
	content = content[0].text
	if title and content and isinstance(title, unicode) and isinstance(content, unicode):
		print 'content length: %d' % len(content)
		model.create_blog(title, content)

def main():
	model = Blog()
	url = 'http://www.cnblogs.com'
	resp = urllib2.urlopen(url)
	rawdata = resp.read().decode('utf-8')
	bs = BeautifulSoup(rawdata)
	links = bs.find_all('a')
	doc_re = re.compile(r'http://www\.cnblogs\.com/[-_a-z]+/p/[0-9a-z]+\.html')
	finished = {}
	for lnk in links:
		if not finished.get(lnk['href'], False) and doc_re.match(lnk['href']):
			create_blog_by_url(model, lnk['href'])
			finished[lnk['href']] = True
	model.sync()

if __name__ == "__main__":
	main()
	print 'execute over!'