$.fn.draggable = function(){
	this.each(function(){
		var me = $(this);
		
		me.mousedown(function(e){
			var p = me.position();
			me.data('drag', {canDrag: true, x:p.left, y:p.top, refX: e.pageX, refY:e.pageY});
			e.stopPropagation();
		});
		$(document).mousemove(function(e){
			var data = me.data('drag') || {}, pos, w, h;
			if(data.canDrag) {
				w = me.width(), h = me.height();
				pos = {left: data.x + e.pageX - data.refX, top: data.y + e.pageY - data.refY};
				if(pos.left < 0) { pos.left = 0; }
				if(pos.left + w > $(window).width()) { pos.left = $(window).width() - w; }
				if(pos.top < 0) { pos.top = 0; }
				if(pos.top + h > $(window).height()) { pos.top = $(window).height() - h; }
				me.css(pos);
			}
		});
		$(document).mouseup(function(){
			me.data('drag', null);
		});
	});
};
$(function(){
	oe.set('currentUser', window.currentUser);
	
	$(".trigger-menu").delegate('li', 'click', function(){
		var me = $(this),
		    type = me.attr('data-type');
		me.addClass('active');
		me.siblings('.active').removeClass('active');
		if(type === "enter") {
			oe.set('send-shortcuts', "enter");
		} else {
			oe.set('send-shortcuts', 'c-enter');
		}
	}).find('li[data-type="' + (oe.get('send-shortcuts') || "c-enter") + '"]').addClass('active');
	
	var fs = oe.chat.Friends(document.getElementById('contacts'));
	
	if(window.friends) {
		fs.addFriends(friends);
	}
	
	oe.chat.ChatWindow.syncMessage();
});