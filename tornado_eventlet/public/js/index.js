(function($){
	var overlay = $('<div style="display:none;position: absolute;left:0;top:0;right:0;bottom:0;background: #888;z-index:9999;"></div>');
	var progress = $('<div class="progress progress-striped active" style="position:absolute;width:400px;height:30px;top:50%;margin-top:-50px;left:50%;margin-left:-200px;display:none;z-index:10000;"><div class="bar" style="width: 0%;"></div></div>');
	var timer, i = 2;
	overlay.css('opacity', 0.8);

	$.showLoading = function(){
		overlay.show();
		progress.show();
		timer = setInterval(function(){
			progress.find('.bar').css('width', i + '%');
			i += 2;
			if(i == 102) { i = 0; }
		}, 100);
	};
	$.hideLoading = function(){
		clearInterval(timer);
		overlay.hide();
		progress.hide();
	};

	$(function(){
		overlay.appendTo(this.body);
		progress.appendTo(this.body);
	});
})(jQuery);

(function($){
	var grid = $('<div class="row"><ul class="nav nav-list blog-list"></ul></div>'),
		ul = grid.find('ul');
	$.grid = {
		appendRow: function(obj){
			var li = document.createElement('li');
			li.innerHTML = '<span>' + obj.title + '</span><div>' + obj.content + '</div>';
			ul.append(li);
		},
		load: function(params) {
			params = params || {};
			$.getJSON('/res', params, function(data){
				if(!data) { return; }
				var i, len;
				for(i=0, len=data.length;i<len;i++) {
					$.grid.appendRow(data[i]);
				}
			});
		}
	};
	
	ul.delegate('li', 'click', function(){
		$(this).children('div').toggle();
	});
	$(function(){
		$('.form-horizontal').after(grid);
	});
})(jQuery);
$(function(){
	$('.form-horizontal').submit(function(e){
		e.preventDefault();
		return false;
	}).find('button').click(function(e){
		var type = this.type;
		if(type == 'button') { this.form.reset(); return; }
		$.showLoading();
	});


});