#!/usr/bin/env python
# -*- coding: utf-8 -*-

#切割图片，这个是在处理网页图标素材时，在网络上找了很久找不到才手动写的
#以前用 java 写过，但是代码丢了，用 python 写竟然so easy 。。。

import Image, sys, os

def main():
	print sys.argv
	src = Image.open(sys.argv[1])

	icon_width = 16
	icon_height = 16
	space_x = 4
	space_y = 4
	
	output_dir = 'D:/myicons'
	if not os.path.exists(output_dir):
		os.mkdir(output_dir)
	for x in range(0, src.size[0]+4, 20):
		for y in range(0, src.size[1]+4, 20):
			print x, y
			region = src.crop((x, y, x + 16, y + 16))
			region.save('%s/%d_%d.gif' % (output_dir, x, y))

if __name__ == "__main__":
	main()