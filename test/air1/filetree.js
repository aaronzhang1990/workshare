(function(){
	var instance;
	air.trace('start exec filetree.js');
	function getFileList(dir) {
		dir = new air.File(dir || air.File.desktopDirectory);
		return dir.getDirectoryListing();
	}
	
	function addEvents(node) {
		node.addEventListener('click', function(e){
			e.stopPropagation();
			var path = this.getAttribute('data-file'),
			    fileobj = new air.File(path),
				openStatus = this.getAttribute('data-open'),
				files, filename, i, len, markup = [], ul, fp, lis;
			if(fileobj.isDirectory) {
				//already opened
				if(openStatus) {
					this.firstElementChild.style.display = openStatus === 'on' ? 'none' : 'block';
					this.setAttribute('data-open', openStatus === 'on' ? 'off' : 'on');
				} else {
					files = fileobj.getDirectoryListing();
					ul = document.createElement('ul');
					for(i=0,len=files.length;i<len;i++) {
						fp = files[i]['nativePath'];
						filename = fp.substring(fp.lastIndexOf(air.File.separator)+1);
						markup.push('<li data-file="' + fp + '">' + filename + '</li>');
					}
					ul.innerHTML = markup.join('');
					this.appendChild(ul);
					this.setAttribute('data-open', 'on');
					lis = ul.getElementsByTagName('li');
					lis = Array.prototype.slice.call(lis);
					for(i=0,len=lis.length;i<len;i++) {
						addEvents(lis[i]);
					}
				}
			}
		});
	}
	
	function createUI(p) {
		var c = document.createElement('div'),
			root = air.File.desktopDirectory.nativePath, li;
		c.className = 'filetree';
		c.innerHTML = '<ul><li data-file="' + root + '">我的桌面</li></ul>';
		li = c.getElementsByTagName('li')[0];
		addEvents(li);
		return c;
	}
	
	instance = true;
	test.addToMenu('filetree', function(){
		test.setComponent(createUI());
	});

	test.filetree = {initialized: true};
})();