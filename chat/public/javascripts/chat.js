(function($){
	var oe = {chat:{}}, settings = {};
	$.extend(oe, {
		get: function(k) {
			return settings[k];
		},
		set: function(k, v) {
			settings[k] = v;
		}
	});

	var Friends = function(el) {
		var containerEl = el, friends = [], result = Friends.result;
		if(result) { return result; }
		result = {
			sync: function() {
				$.get('/contacts', function(cs){
					var nowFriends, allFriends, tmpFriends;
					if(cs && cs.success === true) {
						nowFriends = friends;
						allFriends = cs.data;
						tmpFriends = []
						$.each(allFriends, function(_, newc){
							var hasFriend = false;
							$.each(nowFriends, function(__, oldc){
								if(oldc.uid === newc.uid) { hasFriend = true; return false; }
							});
							if(!hasFriend) {
								tmpFriends.push(newc);
							}
						});
						Friends.result.addFriends(tmpFriends);
					}
				});
			},
			upline: function(c) {
				var has = false, el;
				$.each(friends, function(f){
					if(f[0]['uid'] === c.uid) {
						has = true;
						el = f[1];
						return false;
					}
				});
				if(!has) {
					Friends.result.addFriends(c);
					$.each(friends, function(f) {
						if(f[0]['uid'] === c.uid) {
							$(f[1]).addClass('upline');
							return false;
						}
					});
				} else {
					$(el).addClass('upline');
				}
			},
			downline: function(c) {
				$.each(friends, function(f) {
					if(f[0]['uid'] === c.uid) {
						$(f[1]).addClass('downline');
						return false;
					}
				})
			},
			addFriends: function(fs) {
				var doc = document.createDocumentFragment(),
				    nowFriends = friends,
				    newFriends = [];
				if(!$.isArray(fs)) {
					fs = [fs];
				}
				$.each(fs, function(_, f) {
					var isAdd = true;
					$.each(nowFriends, function(__, c2){
						if(c1.uid === c2.uid) {
							isAdd = false;
							return false;
						}
					});
					if(isAdd) {
						newFriends.push(f);
					}
				})
				$.each(newFriends, function(i, f) {
					var $li, li
					li = document.createElement('li');
					li.innerHTML = "<a href='#'></a>";
					$li = $(li);
					$li.dblclick(function(){
						if(oe.get('currentUser').uid !== $(this).data('user').uid) {
							oe.chat.openWindowFor(this);
						}
					});
					$li.data('user', f);
					$(li).children('a').attr('href', 'javascript:void(0)').text(f.name);
					newFriends[i] = [f, li];
					doc.appendChild(li);
				});
				if(doc.childNodes.length) {
					containerEl.appendChild(doc);
					friends = friends.concat(newFriends);
				}
			},
			getUIFor: function(c) {
				var isFound = false, el;
				$.each(friends, function(f){
					if(f[0].uid === c.uid) {
						isFound = true;
						el = f[1];
						return false;
					}
				});
				if(isFound) {
					return el;
				}
			},
			blinkFor: function(c) {
				var isFound = false, el;
				$.each(friends, function(f){
					if(f[0].uid === c.uid) {
						isFound = true;
						el = f[1];
						return false;
					}
				});
				if(isFound) {
					return el;
				}
			},
			getFriendById: function(id) {
				var isFound = false, friend;
				$.each(friends, function(i, f) {
					var o = f[0];
					if(o.uid === id) {
						isFound = true;
						friend = o;
						return false;
					}
				});
				if(isFound) {
					return friend;
				}
			}
		};
		Friends.result = result;
		return result;
	}
	
	function ChatWindow(friend) {
		if(!this instanceof ChatWindow) {
			return new ChatWindow(friend);
		}
		this.friend = friend;
		this.user = $(friend).data('user');
		var el = ChatWindow.createEl();
		el.find('.title').html('<a href="#">' + this.user.name + "</a>");
		document.body.appendChild(el[0]);
		this.el = el;
		el.data('window', this);
		ChatWindow.winList.push(this);
		var me = this;
	}
	ChatWindow.winList = [];
	ChatWindow.createEl = function(){
		var win = $(".window").clone();
		//绑定快捷键
		win.find('.input').keypress(function(e){
			
		}).end().find('.close').click(function(){
			
		}).end() //关闭窗口
		   .find('.go').click(function(){ //发送消息
			   var me = $(this),
			       $win = me.closest('.window'),
			       win = $win.data('window'),
			       input = $win.find('.input'),
			       text = input.val();
			   if(!text) { return; }
			   win.sendMessage(input.val());
			   input.val('');
		   })
		   .siblings('.trigger').click(function(){ //设定快捷键
			   oe.showTrigger(this, document.getElementById('trigger-menu'));
		   });
		return win;
	};
	ChatWindow.syncMessage = function(){
		$.get('/msg', function(data){
			if(!data.success) { return; }
			data.data.forEach(function(msg){
				ChatWindow.addRemoteMessage(msg.text, Friends.result.getFriendById(msg.senderId))
			});
			ChatWindow.syncMessage();
		});
	};
	
	ChatWindow.addRemoteMessage = function(msg, sender){
		var wind, isFound = false;
		$.each(ChatWindow.winList, function(i, win) {
			if(win.user.uid == sender.uid) {
				isFound = true;
				wind = win;
				return false;
			}
		});
		if(isFound) {
			wind.el.find('.message').append(oe.chat.createMessageEl(msg, sender));
		}
	};
	ChatWindow.prototype = {
		constructor: ChatWindow,
		open: function() {
			var w = $(window).width(),
			    h = $(window).height(),
			    we = this.el.width(),
			    he = this.el.height(),
			    pos = {};
			if(w > we) {
				pos.left = Math.floor((w-we)/2);
			} else {
				pos.left = 0;
			}
			if(h > he) {
				pos.top = Math.floor((h-he)/2);
			} else {
				pos.top = 0;
			}
			this.el.css(pos);
			this.el.show();
		},
		hide: function() {
			this.el.hide();
		},
		sendMessage: function(text) {
			var obj = {text: text, receiverId: this.user.uid};
			this.el.find('.message').append(oe.chat.createMessageEl(text, oe.get('currentUser')));
			$.post('/msg', obj, function(data){
				console.log('send message: ' + JSON.stringify(obj) + '; result: ' + JSON.stringify(data));
			});
		},
		syncMessage: function() {
			var me = this;
			$.get('/msg', function(data){
				var msgs;
				if(data.success === true) {
					msgs = data.data;
					if($.isArray(msgs)) {
						$.each(msgs, function(msg) {
							me.addRemoteMessage(msg.text, Friends.getFriendById(msg.senderId));
						})
					}
				}
				me.syncMessage();
			});
		},
		addRemoteMessage: function(msg, sender) {
			sender = sender || this.user;
			wind.el.find('.message').append(oe.chat.createMessageEl(msg, sender));
		},
		destroy: function() {
			this.el.hide();
			this.el.find('.input').unbind('keypress').end()
			    .find('.go').unbind('click').end()
			    .find('.trigger').unbind('click').end()
			    .find('.close').unbind('click');
			this.el.remove();
			$.each(ChatWindow.winList, function(i, win){
				if(win == this) {
					ChatWindow.winList.splice(i, 1);
					return false;
				}
			});
		}
	};
	
	$.extend(oe.chat, {
		openWindowFor: function(el) {
			var $el = $(this), 
			    win = new ChatWindow(el);
			$el.data('window', win);
			win.open();
		},
		showTriggerAt: function(el, triggerEl) {
			var $el = $(el), 
			    pos = $el.position(),
			    h = $el.height();
			$(triggerEl).css({left:pos.left, top: pos.top+h+3});
		},
		createMessageEl: function(text, user) {
			var wrap = document.createElement('div');
			var d = new Date();
			var time = d.getFullYear() + '-' +
					   (d.getMonth() + 1) + '-' +
					   d.getDate() + ' ' +
					   d.getHours() + ':' +
					   d.getMinutes() + ':' +
					   d.getSeconds();
			wrap.innerHTML = '<div class="user">' + user.name + ' ' + time + '</div><div class="content">' + text + '</div>';
	console.log(wrap);
			return wrap;
			
		}
	});

	oe.chat.Friends = Friends;
	oe.chat.ChatWindow = ChatWindow;
	window.oe = oe;
})(jQuery);