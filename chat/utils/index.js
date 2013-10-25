var e = {};
e.merge = function(src) {
	Array.prototype.slice.call(arguments, 1).forEach(function(arg){
		for(var k in arg) {
			src[k] = arg[k];
		}
	});
}

module.exports = e;