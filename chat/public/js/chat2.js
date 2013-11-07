(function(global, $){
    var non = global.non || {};
    non.zy = {};
    function Window(options) {
        this.init(options);
        non.zy.WindowStatusBar.registerWindow(this);
    }
    Window.czIndex = 100;
    Window.prototype = {
        template: '<div class="panel panel-success" style="position:absolute;">' +
                  '    <div class="panel-heading">' +
                  '        <div class="pull-right clearfix">' +
                  '            <a href="javascript:void(0);" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-minus"></span></a>' +
                  '            <a href="javascript:void(0);" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-fullscreen"></span></a>' +
                  '            <a href="javascript:void(0);" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-remove"></span></a>' +
                  '        </div>' +
                  '        <h3 class="panel-title"></h3>' +
                  '    </div>' +
                  '    <div class="panel-body"></div>' +
                  '    <div class="panel-footer"><div class="pull-right">' +
                  '        <div class="btn-group">' +
                  '            <button type="button" class="btn btn-success btn-sm">发送</button>' +
                  '            <button type="button" class="btn btn-success btn-sm dropdown-toggle" data-toggle="dropdown">' +
                  '                <span class="caret"></span>' +
                  '            </button>' +
                  '            <ul class="dropdown-menu" role="menu">' +
                  '                <li><a href="#">按 Enter 发送消息</a></li>' +
                  '                <li><a href="#">按 Ctrl + Enter 发送消息</a></li>' +
                  '            </ul>' +
                  '         </div>' +
                  '    </div><div class="clearfix"></div></div>' +
                  '</div>',
        init: function(options){
            var me = this, el, clz, header;
            me.render();
            el = me.el;
            options = options || {}
            opts = $.extend({}, Window.defaults, options);
            //setting properties
            me.toTop();
            header = el.children('.panel-heading');
            header.children('.panel-title').text(opts.title);
            el.css('width', opts.width);
            el.css('height', opts.height);
            me.updateSize();
            el.data('size-mode', 'normal');
            //bind events
            el.draggable({handle: '.panel-heading', cursor: "move", containment: 'document'});
            clz = /glyphicon\-(minus|fullscreen|remove)/;
            header.children('.pull-right').children('a').each(function(){
                var className = $(this).children('span').attr('class');
                switch(clz.exec(className)[1]) {
                    case 'minus':
                        $(this).click(function(){ me.minSize(); });
                        break;
                    case 'fullscreen':
                        $(this).click(function(){
                            var sizeMode = el.data('size-mode');
                            if(sizeMode == 'normal') {
                                me.maxSize()
                            } else if(sizeMode == 'max') {
                                me.normalSize();
                            }
                        });
                        break;
                    case 'remove':
                        $(this).click(function(){ me.x(); });
                        break;
                }
            });
            
            $(window).resize(function(){
                if(el.data('size-mode') == 'max') {
                    me.maxSize();
                }
            });
            el.mousedown(function(){
                var zIndex = el.css('z-index');
                if(zIndex !== Window.czIndex) {
                    me.toTop();
                }
            }).resize(function(){
                var data = el.data('old-size');
                if(data) {
                    el.data('old-size', $.extend({width: el.width(), height: el.height()}, el.position()));
                }
            });
            header.dblclick(function(){
                var mode = el.data('size-mode');
                if(mode == 'normal') {
                    me.maxSize();
                } else {
                    me.normalSize();
                }
            });
        },
        updateSize: function(){
            var el, header, body, footer, height, bodyHeight;
            el = this.el;
            header = el.children('.panel-heading');
            body = el.children('.panel-body');
            footer = el.children('.panel-footer');
            height = parseInt(el.css('height'));

            bodyHeight = height - parseInt(el.css('borderTopWidth')) - parseInt(el.css('borderBottomWidth')) - header.outerHeight() - footer.outerHeight();
            body.css('height', bodyHeight);
        },
        render: function() {
            var el = $(this.template);
            el.appendTo(document.body);
            this.el = el;

        },
        getTitle: function() {
            return $.trim(this.el.children('.panel-heading').text());
        },
        getEl: function(){
            return this.el;
        },
        x: function(){
            this.el.trigger('beforeremove');
            this.el.remove();
            this.el = null;
        },
        minSize: function(){
            this.el.hide();
        },
        normalSize: function(){
            var el = this.el, data = el.data('old-size');
            if(data) {
                el.css(data);
                this.updateSize();
                el.data('size-mode', 'normal');
            }
        },
        maxSize: function(){
            var el = this.el, prevData = el.data('old-size');
            if(!prevData) {
                el.data('old-size', $.extend({width: el.width(), height: el.height()}, el.position()));
            }
            el.css({
                top: 0,
                left: 0,
                width: $(window).width(),
                height: $(window).height() - non.zy.WindowStatusBar.getHeight()
            });
            this.updateSize();
            el.data('size-mode', 'max');
        },
        toTop: function(){
            Window.czIndex += 1;
            this.el.css('z-index', Window.czIndex);
        },
        toBottom: function(){
            this.el.css('z-index', Window.czIndex - 1);
        }
    };
    Window.defaults = {
        width: 450,
        height: 450,
        title: '和{0}聊天中'
    };
    function MessageWindow() {}
    (function(){
        var messages = {}, getMsgUrl = '/msg';
        function syncMessage() {
            var req = $.get(getMsgUrl, function(data){
                if(data.success !== true) { return; }

            });
        }
    })();
    function MessageManager() {
        var messages = {}, //all message received, if message is read, mark it
        request;
    return {
    
    };
    }
    function FriendWindow() {}
    (function(){
        var tmpl = '<div style="position:absolute;bottom:0;left:0;right:0;z-index: 100000;height: 40px;border-top:1px solid #555;background-color: #d6e9c6;"><ul style="margin-bottom:0;border-top:1px solid #FFF;height:38px;list-style: none;"></ul></div>';
        var itemTmpl = '<li style="display:block;border-top:0;float:left;margin-right:5px;margin-bottom:1px;height: 38px;line-height:37px;"></li>';
        var isReady = false, inited = false, readyList = [], el;
        var statusbar = {
            init: function() {
                if(inited) { return; }
                $(function(){
                    el = $(tmpl);
                    el.css('opacity', 0.8);
                    el.appendTo(document.body);
                    isReady = true;
                    $.each(readyList, function(_, win){
                        addWindow(win);
                    });
                });
                inited = true;
            },
            registerWindow: function(win) {
                if(!win instanceof Window) {
                    return;
                }
                if(!isReady) {
                    readyList.push(win);
                } else {
                    addWindow(win);
                }
                
            },
            getHeight: function() {
                return el.outerHeight();
            }
        };
        function addWindow(win) {
            var title = win.getTitle(), item;
            item = $(itemTmpl);
            item.html('<button class="btn btn-default" type="button">' + title + '</button>');
            item.data('target', win);
            //add events for  hide and show
            item.click(function(){
                var el = win.getEl();
                if(el.filter(':visible').length) {
                    el.hide();
                } else {
                    el.show();
                }
            });
            item.appendTo(el.children('ul'));
            win.getEl().bind('beforeremove', function(){
                item.unbind('click').remove();
            });
        }
        statusbar.init();
        non.zy.WindowStatusBar = statusbar;
    })();
    non.zy.Window = Window;
    global.non = non;
})(this, jQuery);
