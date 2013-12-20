/*
 * 消息层，由用户使用，消息则负责与底层消息交互。
 * 消息采用文件保存的方式，每个用户都有一个用户目录，
 * 里面存放该用户所有的消息
 */
var db = require('./db'),
	User = require('./user').User,
	_ = require('underscore');

function Message(receiver, sender, content, time, readed) {
	if(!(this instanceof Message)) {
		return new Message(receiver, sender, content, time, readed);
	}
	if(!(receiver instanceof User) || !(sender instanceof User)) {
		throw new Error('User Object expeted!');
	}
	if(!_.isDate(time)) {
		throw new Error('error object for time, must be Date');
	}
	this.receiver = receiver;
	this.sender = sender;
	this.content = content;
	this.time = time;
	this.readed = !!readed;
}

Message.create(args) {
	if(arguments.length === 1) {
		return new Message(args.receiver, args.sender, args.content, args.time, args.readed);
	} else {
		args = _.toArray(arguments);
		return new Message(args[0], args[1], args[2], args[3], args[4]);
	}
}

var msg = exports = {
	readByRange: function(user, start, stop){},
	readByDate: function(user, date){},
	getUnReadFor: function(user, start, stop){},
	push: function(user, msglist){}
};
