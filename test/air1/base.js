(function(){
	var test = test || {},
		menu = new air.NativeMenu();
	test.noop = function(){};

	test.addToMenu = function(text, onclick){
		var item;
		if(typeof text == "string") {
			item = new air.NativeMenuItem(text);
			item.addEventListener('select', onclick||test.noop);
			menu.addItem(item);
		} else if (text.addItem) {
			menu.addSubmenu(text);
		} else if (text.label) {
			menu.addItem(text);
			if(onclick) {
				text.addEventListener('select', onclick);
			}
		}
	};

	test.setComponent = function(child){
		var comp;
		if(child && child.nodeType === 1) {
			comp = document.getElementById('component-area');
			comp.innerHTML = '';
			comp.appendChild(child);
		}
	};

	test.onload = function(type, callback) {
		window.addEventListener(type, callback);
	};
	
	test.onload('load', function(){
		air.NativeApplication.nativeApplication.menu = menu;
		document.addEventListener('contextmenu', function(e){
			menu.display(window.nativeWindow.stage, e.pageX, e.pageY);
		});
	});


	window.test = test;
})();