#!/usr/bin/env python
# -*- coding: utf-8 -*-

import urllib2, os, re, time, itertools

ENCODING = 'GBK'
JS_VAR = re.compile(r'^\s*var\s+\w+\s*=')
ALL_ADDRESSES_URL = 'http://g.tbcdn.cn/tb/address/0.2.1/tdist_py.js'
STREET_URL = 'http://lsp.wuliu.taobao.com/locationservice/addr/output_address_town.do'

def fetch_all_address():
    resp = urllib2.urlopen(ALL_ADDRESSES_URL)
    if resp.getcode() == 200:
        addrs = resp.read()
        if JS_VAR.match(addrs):
            addrs = addrs[addrs.find('{'):].replace('\n', '')
            if addrs[-1] == ';':
                addrs = addrs[:-1]
        fn = eval('lambda : ' + addrs)
        return fetch_street(fn())
    else:
        return None

def fetch_street(data):
    if not isinstance(data, dict):
        return None
    def is_county(county_id):
        try:
            city_id = data[county_id][1]
            province_id = data[city_id][1]
            state_id = data[province_id][1]
            if state_id == '1':
                return province_id, city_id, county_id
        except Exception, e:
            pass
        return False
    for x, item in data.items():
        args = is_county(x)
        if args == False:
            continue
        try:
            print 'fetch street:', tuple(itertools.imap(lambda x: data[x][2], args))
            resp = urllib2.urlopen(STREET_URL + ('?l1=%s&l2=%s&l3=%s&callback=get_street_data' % args))
            if resp.getcode() == 200:
                result = resp.read()
                if result.find('success:false') != -1:
                    continue
                result = result.replace('success:true,', '').replace('result:', '"result":')
                if result[-1] == ';':
                    result = result[:-1]
                street = eval(result)
                item.append(street)
                #on_street_load((x, item[0]), street)
        except Exception, e:
            print 'error:', e
            print 'url: ', STREET_URL + ('?l1=%s&l2=%s&l3=%s&callback=get_street_data' % args)
    return data

def get_street_data(rst):
    return rst.get('result')
def on_street_load(p, street):
    print 'street of %s is loaded!' % p[1]
def main():
    data = fetch_all_address()
    open('address.json', 'w').write(str(data))

if __name__ == "__main__":
    main()