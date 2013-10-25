
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({uploadDir: './public/upload'}));
app.use(express.methodOverride());
app.use(express.cookieParser('my name is zhangyao'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/msg', routes.msgHandler);
app.get('/msg', routes.getMessage);
app.get('/contacts', routes.getContacts);
app.get('/users', user.list);
app.post('/updateUser', routes.updateUser);
app.get('/msg/view', routes.messageView);
app.post('/msg/img', routes.uploadimg);
app.post('/msg/file', routes.uploadfile);

app.on('serverstart', function(){
    var uploaddir = path.join(__dirname, 'upload');
    if(!fs.existsSync(uploaddir)) {
        fs.mkdirSync(uploaddir);
        return;
    }
    fs.readdir(uploaddir, function(e, files){
        if(e) return;
        files.forEach(function(fn){
            fs.unlink(path.join(uploaddir, fn));
            console.log('delete upload file: ' + path.join(uploaddir, fn));
        });
    })
});
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
    app.emit('serverstart');
});
