#!/usr/bin/env python
# -*- coding: utf-8 -*-
import MySQLdb as mdb
import uuid, pprint
def generate(data):
	gdata = []
	for grade in range(1,4):
		for clazz in range(1,10):
			if grade != data['grade_number'] and clazz != data['class_number']:
				gdata.append("insert into classes(uuid, grade_number, class_number, school_uuid) values('%s', %d, %d, '%s');" % (unicode(uuid.uuid4()), grade, clazz, data['school_uuid']))
	return gdata

def main():
	config = {'user': 'root', 'passwd': 'oseasy_db', 'db': 'banbantong', 'use_unicode': True, 'charset': 'utf8'}
	conn = mdb.connect(**config)
	if not conn: return
	cursor = conn.cursor()
	cursor.execute('select grade_number, class_number, school_uuid from classes;')
	base = {}
	desc = cursor.description
	data = cursor.fetchone()
	for i, x in enumerate(data):
		base[desc[i][0]] = data[i]
	moreData = generate(base)
	#cursor.executemany('insert into classes(uuid, grade_number, class_number, school_uuid) values(%s, %d, %d, %s)', moreData)
	for sql in moreData:
		cursor.execute(sql)
	conn.commit()
	cursor.close()
	conn.close()

if __name__ == "__main__":
	main()