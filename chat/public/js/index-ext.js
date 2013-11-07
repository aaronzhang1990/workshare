var oe = oe || {};
oe.chat = Ext.merge({
	currentUser: null,
	init: function(){
		Ext.onReady(function(){
			oe.chat.ui.init();
			if(!oe.chat.currentUser) {
				oe.chat.ui.register();
			} else {
				oe.chat.updateContacts()
			}
			oe.chat.MessageBuffer.start();
		});
	}
}, oe.chat || {});
(function(oe){
	var userStore = new Ext.data.TreeStore({
		root: {text: '我的好友', expanded: true, children: []},
		proxy: {
			url: '/contacts',
			type: 'ajax',
			reader: 'json'
		}
	});
	oe.chat.ui = {
		init: function(){
			var uiConfig = {
				layout: 'fit',
				items: [{
					xtype: 'panel',
					layout: 'absolute',
					items: [{
						xtype: 'panel',
						width: 240,
						height: 560,
						x: 10,
						y: 0,
						title: '联系人',
						tbar: ['工具'],
						layout: 'fit',
						items: [{
							xtype: 'treepanel',
							border: false,
							store: userStore,
							listeners: {
								itemdblclick: startChat
							}
						}]
					}]
				}]
			};
			Ext.create('Ext.container.Viewport', uiConfig);
		},
		register: function(){
			var config = {
				title: '请输入你用于聊天的用户名：',
				width: 300,
				layout: 'anchor',
				modal: true,
				items: [{
					xtype: 'textfield',
                    enableKeyEvents: true,
					anchor: '100%',
					margin: '40, 10',
					name: 'username',
					regexp: /[\w\d~!@#\$%\^&\*\(\)_\+-]+/,
					allowBlank: false,
					blankText: '不可为空',
                    listeners: {
                        keyup: function(t, e){
                            if(e.getKey() === e.ENTER) {
                                registerUser(t);
                            }
                        }
                    }
				}],
				buttons: [{
					xtype: 'button',
					text: '确定',
					handler: registerUser
				}]
			};
			Ext.create('Ext.window.Window', config).show();
		}
	};
	
	oe.chat.Session = function(user){
		if(!this instanceof oe.chat.Session) {
			return new oe.chat.Session(user);
		}
		this.user = user;
		oe.chat.MessageBuffer.addMessageListener(this);
		this.init();
	};
	oe.chat.Session.prototype = {
		constructor: oe.chat.Session,
		init: function(){
			var u = this.user, me = this;
			var config = {
				width: 450,
				padding: 10,
				border: false,
				session: this,
				icon: u.icon,
				title: '和 ' + u.name + ' 聊天中',
				defaultType: 'panel',
				layout: 'anchor',
				items: [{
					html: '<div class="chat-body"><ul></ul></div>',
					anchor: '100%'
				}, {
                    xtype: 'panel',
                    anchor: '100%',
                    border: false,
                    tbar: [{
                        xtype: 'form',
                        layout: 'fit',
                        border: false,
                        margin:0,
                        padding:0,
                        items: [{
                            xtype: 'fileuploadfield',
                            name: 'filemsg',
                            buttonOnly: true,
                            buttonConfig: {icon: '/images/sendImg.png',text:''},
                            listeners: {change: function(c, path){
                                if(!/(?:gif|png|bmp|jpg|jpeg)$/i.test(path)) { return; }
                                c.up('form').submit({
                                    url: '/msg',
                                    params: {receiverId: u.uid, mtype: 'image'},
                                    method: 'post',
                                    success: function(_, resp){
                                        if(resp.result.success) {
                                            me.addMessage(resp.result.data, u.name);
                                        }
                                    },
                                    failure: function(){}
                                });
                            }}
                        }]
                    }, ' ', {
                        xtype: 'form',
                        layout: 'fit',
                        border: false,
                        margin:0,
                        padding:0,
                        items: [{
                            xtype: 'fileuploadfield',
                            name: 'filemsg',
                            buttonOnly: true,
                            buttonConfig: {icon: '/images/sendfile.png',text:''},
                            listeners: {change: function(c, path){
                                c.up('form').submit({
                                    url: '/msg',
                                    params: {receiverId: u.uid, mtype: 'file'},
                                    method: 'post',
                                    success: function(_, resp){
                                        if(resp.result.success) {
                                            me.addMessage(resp.result.data, u.name);
                                        }
                                    },
                                    failure: function(){}
                                });
                            }}
                        }]
                    }, ' ', {text: '远程协助', handler: function(){  //status: 1, request remote help; 2, peer say ok; 3, send my vnc info; 4 connect
                        Ext.Ajax.request({
                            url: '/remote',
                            params: {receiverId: u.uid, mtype: 'remote', status: 1},
                            success: function(resp){
                                var data = Ext.JSON.decode(resp.responseText);
                                if(data.success) {
                                    Ext.Ajax.request({
                                        url: '/remote',
                                        params: {receiverId: u.uid, mtype: 'remote', status: 2},
                                        success: function(resp){
                                            var d = Ext.JSON.decode(resp.responseText);
                                            d.success
                                        }
                                    })
                                }
                            }
                        })
                    }}],
                    items: [{
                        xtype: 'textarea',
                        enableKeyEvents: true,
                        width: '100%',
                        height: 130,
                        name: 'input-msg',
                        listeners: {
                            keyup: function(t, e) {
                                if(e.getKey() === e.ENTER) {
                                    e.stopEvent();
                                    var s = t.up('window').session;
                                    s && s.sendMessage();
                                    return false;
                                }
                            }
                        }
                    }]
                }],
				buttons: [{text: '发送', handler: function(b){
					var session = b.up('window').session;
					session && session.sendMessage();
				}}],
				buttonAlign: 'right'
			};
			this.window = Ext.create('Ext.window.Window', config).show();
            oe.chat.MessageBuffer.eachMessage(function(msg){
                if(msg.senderId === u.uid) {
                    me.addMessage(msg.text, u.name);
                }
            });
		},
		onMessage: function(msg) {
			if(msg.senderId !== this.user.uid) {
				return;
			}
			this.addMessage(msg.text, this.user.name);
			return true;
		},
		addMessage: function(msg, username) {
			var li = document.createElement('li'), el;
			li.innerHTML = "<div class='time'>" + username + " " + Ext.Date.format(new Date(), "Y-m-d H:i:s") + "</div><div class='msg'>" + msg + "</div>";
			msglist = this.window.down('panel').getEl().query('ul')[0];
			if(msglist) {
				msglist.appendChild(li);
                el = getComputedStyle(msglist);
                msglist.parentNode.scrollTop = parseInt(el.height);
			}
		},
		sendMessage: function(){
			var win = this.window,
			    textarea = win.down('textarea'),
			    text = Ext.String.trim(textarea.getValue()), msg;
			if(text) {
				msg = {text: text, receiverId: this.user.uid};
				oe.chat.MessageBuffer.enQueue(msg);
				this.addMessage(text, oe.chat.currentUser.name);
			} else {
				Ext.Msg.alert('提示', '无效的信息！');
			}
			textarea.setValue('');
		}
	};
	
	function startChat(view, model){
		var u = model.raw.user, user = oe.chat.currentUser;
		if(u.uid === user.uid && u.name === user.name) {
			return;
		}
		new oe.chat.Session(u);
	}
	
	function registerUser(btn){
		var username = btn.up('window').down('textfield[name=username]').getValue();
		if(username) {
			Ext.Ajax.request({
				url: '/updateUser',
				params: {name: username},
				success: function(resp) {
					var u = Ext.JSON.decode(resp.responseText);
					if(u.success === true) {
						oe.chat.currentUser = u.data;
						oe.chat.updateContacts();
						btn.up('window').destroy();
					} else {
						Ext.Msg.alert('提示', "名字格式错误");
					}
				},
				failure: function(){
					Ext.Msg.alert('提示', '服务器内部错误');
				}
			})
		}
	}
	
	oe.chat.updateContacts = function() {
		Ext.Ajax.request({
			url: '/contacts',
            disableCaching: false,
			success: function(resp) {
				var data = Ext.JSON.decode(resp.responseText);
				if(data.success === true) {
					var users = data.data, newUsers = [], root = userStore.getRootNode();
					Ext.each(users, function(v, i, a) {
						var inLocal = false;
						root.eachChild(function(u){
							var uu = u.raw.user;
							if(uu.uid == v.uid && uu.name == v.name) {
								inLocal = true;
								return false;
							}
						});
						if(!inLocal) {
							newUsers.push(v);
						}
					});
					if(newUsers.length) {
						Ext.each(newUsers, function(u){
							root.appendChild({user: u, text: u.name, leaf: true});
						});
					}
				}

			},
            callback: function(){
                setTimeout(oe.chat.updateContacts, 2000);
            }
		});
	}
})(oe);

	
(function(oe) {
	var sendQueue = [],
	    receivedMsg = [],
	    listeners = [];
	oe.chat.MessageBuffer = {
		addMessageListener: function(listener){
			var inlist = false;
			if(listener.onMessage) {
				Ext.each(listeners, function(lsn){
					if(lsn === listener) { inlist = true; }
				});
				if(!inlist) {
					listeners.push(listener);
				}
				
			}
		},
		enQueue: function(msg, inbuf){
			setTimeout(function(){
				Ext.Ajax.request({
					method: 'post',
					url: '/msg',
					params: msg,
					success: function(resp){
						var data = Ext.JSON.decode(resp.responseText);
						if(data.success !== true) {
							sendQueue.push(msg);
						} else {
							if(inbuf === true) {
								Ext.each(queue, function(m, i){
									if(m.text === msg.text && m.receiverId === msg.receiverId) {
										sendQueue.splice(i, 1);
										return false;
									}
								});
							}
						}
					},
					failure: function(){
						if(!inbuf) {
							sendQueue.push(msg);
						}
					}
				});
			}, 0);
		},
        eachMessage: function(fn){
            if(typeof fn !== "function") {
                return;
            }
            Ext.each(receivedMsg, fn);
        },
		start: function(){
			if(!oe.chat.currentUser) {
				setTimeout(oe.chat.MessageBuffer.start, 100);
				return;
			}
            //ext will set timeout when ajax request start, here hack for clear timeout
			var req = Ext.Ajax.request({
                url: '/msg',
                success: function(resp){
                    var data = Ext.JSON.decode(resp.responseText);
                    if(data.success !== true) { return; }
                    Ext.each(data.data, function(msg){
                        var i, len, ret, result, flag = false, buf = receivedMsg;
                        for(i=0,len=listeners.length;i<len;i++) {
                            ret = listeners[i].onMessage(msg);
                            flag = flag || ret;
                        }
                        if(!flag) {
                            buf.push(msg);
                        }
                    });
			    },
                callback: function(){
                    setTimeout(oe.chat.MessageBuffer.start, 0);
                }
            });
            clearTimeout(req.timeout);
		}
	}

    function RemoteRequest(myId, friendId, options) {
        if(!this instanceof RemoteRequest) {
            return new RemoteRequest(myId, friendId);
        }
        this.myId = myId;
        this.helperId = friendId;
        this.onerror = null;
        this.onsuccess = null;
        Ext.apply(this, {
            myId: myId,
            helperId: friendId,
            onerror: null,
            onsuccess: null
        }, options);
    }
    RemoteRequest.prototype = {
        constructor: RemoteRequest,
        status: 1,
        _requestHelp: function(){
            var me = this;
            Ext.Ajax.request({
                url: this.url,
                params: {receiverId: this.helperId, mtype: 'remote'},
                success: function(resp){
                    var obj = Ext.JSON.decode(resp.responseText);
                    if(obj.success === true) {
                        me.status = 2;

                    } else {
                        me.fire('error');
                    }
                },
                failure: function(){
                    me.fire('error');
                }
            });
        },  //step 1: request,
        _sendinfo: function(){},  //peer say yes, send my vnc info
        _connect: function(){}  //peer say yes again, response yes too
    };

    function RemoteResponse(myId, friendId) {

    }

})(oe);
	
oe.chat.init();