/* 读写数据的核心部分，可以像滚动日志一样，当一个日志文件大小达到最大值的时候，增加新文件，继续写入 */
var fs = require('fs'),
	path = require('path');
var dataDir = path.join(__dirname, '../data');
var MAX_MSG_SIZE = 1024 * 1024 * 10;

if(fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir);
}

function getUserHome(user) {
	var id = user.id;
	return path.join(dataDir, id+'');
}

function getLatest(home) {
	var files = fs.readdirSync(home),
		max = 0, no,
		nameRe = /^msg_(\d+)\.file$/;
	_.each(files, function(name){
		if(nameRe.test(name)) {
			no = parseInt(nameRe.exec(name)[1]);
			max = max > no ? max : no;
		}
	});
	return path.join(base, 'msg_' + max + '.file');
}

function str2Msg() {}
function msg2Str() {}

exports.writeMsg = function(user, msg, cb) {};
exports.readMsg = function(user, cb){};