#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os, MySQLdb, csv

table_sql = """drop table if exists hotel;
create table hotel(
    id int primary key,
    Name varchar(255),
    CardNo varchar(255),
    Descriot varchar(255),
    CtfTp varchar(255),
    CtfId varchar(255),
    Gender varchar(255),
    Birthday varchar(255),
    Address varchar(255),
    Zip varchar(255),
    Dirty varchar(255),
    District1 varchar(255),
    District2 varchar(255),
    District3 varchar(255),
    District4 varchar(255),
    District5 varchar(255),
    District6 varchar(255),
    FirstNm varchar(255),
    LastNm varchar(255),
    Duty varchar(255),
    Mobile varchar(255),
    Tel varchar(255),
    Fax varchar(255),
    EMail varchar(255),
    Nation varchar(255),
    Taste varchar(255),
    Education varchar(255),
    Company varchar(255),
    CTel varchar(255),
    CAddress varchar(255),
    CZip varchar(255),
    Family varchar(255),
    Version varchar(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;"""

def main():
    db = MySQLdb.connect(user='root', passwd='oseasy_db', db='test', use_unicode=True)
    insert_sql = "insert into hotel('Name', 'CardNo', 'Descriot', 'CtfTp', 'CtfId', 'Gender', 'Birthday', 'Address', 'Zip', 'Dirty', 'District1', 'District2', 'District3', 'District4', 'District5', 'District6', 'FirstNm', 'LastNm', 'Duty', 'Mobile', 'Tel', 'Fax', 'EMail', 'Nation', 'Taste', 'Education', 'Company', 'CTel', 'CAddress', 'CZip', 'Family', 'Version', 'id') values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
    cursor = db.cursor()
    cursor.execute(table_sql)
    #db.commit()
    cursor = db.cursor()
    reader = csv.reader(open('D:\\wanquanban.csv'))
    reader.next() #ignore first row
    for row in reader:
        for i, val in enumerate(row):
            if isinstance(val, basestring):
                row[i] = val.decode('utf-8')
        row[-1] = int(row[-1])
        cursor.execute(insert_sql, row)
    db.commit()
    db.close()
if __name__ == "__main__":
    main()