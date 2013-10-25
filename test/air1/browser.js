(function(){
	function createUI() {
		var c = document.createElement('div');
		c.className = 'browser';
		c.innerHTML = '<p><button type="button">go</button><input type="text"/></p><p><iframe border="0" frameborder="0"></iframe></p>';
		c.getElementsByTagName('input')[0].addEventListener('keydown', function(e){
			var r;
			if(e.keyCode === 13) {
				r = new RegExp("^https?://([\\w\\d-~_]+\\.)+(?:com|cn|net|org)");
				if(r.test(this.value)) {
					this.parentNode.nextSibling.firstChild.src = this.value;
					this.value = "";
				}
			}
		});

		c.getElementsByTagName('button')[0].addEventListener('click', function(e){
			var r = new RegExp("^https?://([\\w\\d-~_]+\\.)+(?:com|cn|net|org)"),
				input = this.prevSibling,
				frame = this.parentNode.nextSibling.firstChild;
			if(r.test(input.value)) {
				frame.src = input.value;
				input.value = "";
			}
		});
		return c;
	}
	
	test.addToMenu('browser', function(){
		test.setComponent(createUI());
	});
	test.browser = {};
})();