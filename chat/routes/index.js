var EventEmitter = require('events').EventEmitter;
var utils = require('../utils');
var fs = require('fs');
var path = require('path');
var manager = new ContactManager();
var waiters = {};

exports.index = function(req, res){
	var uid = req.session.uid, user;
	if(!uid) {
		uid = (Math.random()*10000 ^ 0) + '$' + new Date().getTime();
		req.session.uid = uid;
	}
	user = manager.getContactById(uid);
    if(user) {
        res.render('index', {haveUser: true, user: JSON.stringify(user)});
    } else {
        res.render('index', {haveUser: false});
    }

};

exports.msgHandler = function(req, resp, next) {
	var receiverId = req.param('receiverId'),
        type = req.param('mtype'),
        me = req.session.uid,
        file = req.files && req.files.filemsg,
	    tag, text, msg, ctype, cbdata = {success: true}, cb;
    cb = function(){ resp.json(cbdata);};

    switch(type) {
        case 'image':
            if(file) {
                ctype = file.headers['content-type'];
                if(/image\/(?:gif|png|jpg|jpeg)$/i.test(ctype)) {
                    tag = '<img src="/upload/' + path.basename(file.path) + '"/>';
                    cbdata.data = tag;
                    msg = new Message(receiverId, tag, me, cb);
                } else {
                    //other actions, for example, cancel upload
                }
            }
            break;
        case 'file':
            if(file) {
                tag = '<a href="/upload/' + path.basename(file.path) + '">' + file.name + '</a>';
                cbdata.data = tag;
                msg = new Message(receiverId, tag, me, cb);
            }
            break;
        default :
            text = req.param('text');
            if(text) {
                msg = new Message(receiverId, text, me, cb)
            }
    }
    if(msg) {
        dispatchMessage(msg);
    } else {
        return next();
    }

};

exports.getMessage = function(req, resp) {
    var uid = req.session.uid, self, msgs;
	self = manager.getContactById(uid);

	if(self) {
		msgs = MessageRouter.getMessageFor(self);
		if(msgs) {
			resp.json({success:true, data:msgs});
		} else {
            waiters[uid] = {user: self, cb: function(msg){
                resp.json({success:true, data:msg});
            }};
        }
        return;
	}
    resp.redirect(302, '/');
};

exports.updateUser = function(req, resp) {
	var name = req.param('name'), user, uid = req.session.uid;
    if(!uid) { resp.redirect(302, '/'); }
	if(/[\w\d~!@#\$%\^&\*\(\)_\+-]+/.test(name)) {
		user = new Contact(req.session.uid);
		user.name = name;
		manager.upline(user);
		resp.json({success:true, data: user});
	} else {
		req.json({success: false});
	}
};

exports.getContacts = function(req, resp){
	var uid = req.session.uid, user, clientDate, serverDate;
    clientDate = req.get('If-Modified-Since');
    serverDate = manager.lastModify;
    if(clientDate && serverDate) {
        clientDate = new Date(clientDate);
        if(clientDate && clientDate.getTime() === serverDate.getTime()) {
            resp.send(304);
            return;
        }
    }
	user = manager.getContactById(uid);
	if(!user) {
		resp.redirect(302, '/');
		return;
	}
    serverDate && resp.set('Last-Modified', serverDate.toGMTString());
	resp.json({success:true,data: manager.getAllContacts()});
};

/* for test only */
exports.messageView = function(req, resp){
    var msgs = MessageRouter.getMessageView(), vs = [], k;
    for(k in msgs) {
        vs.push(msgs[k]);
    }
    resp.json(vs);
};

exports.uploadimg = function(req, resp, next) {
    var msg, localpath, ctype, receiverId = req.param('receiverId');
    if(receiverId && req.files && req.files.filemsg) {
        msg = req.files.filemsg;
        localpath = '<img src="/upload/' + path.basename(msg.path) + '">';
        ctype = msg.headers['content-type'];
        if(ctype && ctype.indexOf('image/') === 0) {
            ctype = ctype.substring(6);
            if(/bmp|gif|png|jpg|jpeg/i.test(ctype)) {
                resp.json({success: true, data: localpath});
                msg = new Message(receiverId, localpath, req.session.uid, function(){
                    resp.send({success:true});
                });
                dispatchMessage(msg);
            }
        }
    }
    return next();
};

exports.removeHelp = function(){};

exports.uploadfile = function(req, resp, next) {
    var msg = req.files && req.files.filemsg, localname;
    if(!msg) { return next(); }
    localname = path.basename(msg.path);
    msg = new Message(receiverId, '<img src="' + localname + '">', req.session.uid, function(){
        resp.send({success: true});
    });
    dispatchMessage(msg);
}

function dispatchMessage(msg) {
    var uid, data, msgs
    msg && MessageRouter.postMessage(msg);
    for(uid in waiters) {
        data = waiters[uid];
        if(data) {
            msgs = MessageRouter.getMessageFor(data.user);
            if(msgs) {
                data.cb(msgs);
                waiters[uid] = null;
            }
        }

    }
}

function Contact(options) {
	if(!this instanceof Contact) {
		return new Contact(options);
	}
	if(typeof options == 'string') {
		options = {uid: options};
	}
	utils.merge(this, {
		icon: null,
		phone: null,
		ip: null,
		name: ('webgroupuser' + (Math.random()*10000 ^ 0)),
		signature: null
	}, options);
	if(!this.uid) {
		throw new Error('contact has no unique identity!')
	}
}

Contact.prototype.toString = function() {
	return JSON.stringify(this);
};

function ContactManager() {
	this._contacts = [];
}

ContactManager.prototype.upline = function(contact){
	if(!contact instanceof Contact) {
		return;
	}
	var isFound = false;
	this._contacts.forEach(function(c){
		if(c.uid === contact.uid) {
			isFound = true;
			return false;
		}
	});
	if(isFound) { return; }
	this._contacts.push(contact);
    this.lastModify = new Date();
	MessageRouter.broadcast(new Message({
		receiverId: '*',
		senderId: '系统',
		text: contact.name + ' 上线了！'
	}));
};

ContactManager.prototype.downline = function(contact){
	if(!contact instanceof Contact) {
		return;
	}
	var cs = this._contacts;
	cs.forEach(function(c, i){
		if(c.uid === contact.uid) {
			cs.splice(i, 1);
			return false;
		}
	});
	MessageRouter.broadcast(new Message({
		receiverId: '*',
		senderId: '系统',
		text: contact.name + ' 下线了！'
	}));
};

ContactManager.prototype.getAllContacts = function(){
	return JSON.parse(JSON.stringify(this._contacts));
};

ContactManager.prototype.getContactById = function(uid){
	var cs = this._contacts, isFound = false, contact;
	cs.forEach(function(c){
		if(c.uid === uid) {
			isFound = true;
			contact = c;
			return false;
		}
	});
	if(isFound) { return contact; }
};

function Message(receiverId, text, senderId, cb) {
	var msg = {};
	if(arguments.length === 1) {
		utils.merge(msg, arguments[0]);
	} else {
		msg.receiverId = receiverId;
		msg.text = text;
		msg.senderId = senderId || "Unknow";
		msg.cb = cb || function(){};
	}
	if(!msg.receiverId) {
		throw new Error('error on Message.constructor: receiverId is ' + receiverId);
	}
	if(!msg.text) {
		throw new Error('error on Message.constructor: text is ' + text);
	}
	utils.merge(this, msg);
}

var MessageRouter = (function(){
	var box = {};
	return {
		postMessage: function(msg) {
			if(!msg instanceof Message) {
				return;
			}
			var rid = msg.receiverId;
			if(!box[rid]) {
				box[rid] = [];
			}
			box[rid].push(msg);
			if(msg.cb) {
				msg.cb();
				msg.cb = null;
			}
		},
		broadcast: function(msg) {
			if(!msg instanceof Message) {
				return;
			}
			for(var k in box) {
				box[k].push(msg);
			}
		},
		getMessageFor: function(contact) {
			if(!contact instanceof Contact) {
				return;
			}
			var uid = contact.uid, msgQueue;
			msgQueue = box[uid];
			if(msgQueue) {
				delete box[uid];
				return msgQueue;
			} else {
				return null;
			}
			return msgQueue;
		},
        getMessageView: function(){
            return box;
        }
	};
})();
