Crafty.c('Ball', {
    _ball_defaults: {
        speed: 10,
        attack: 1,
        img: 'ball.png'
    },
    init: function(){
        this.requires('2D, Canvas, Image, Collision');
        this.bind('EnterFrame', function(){
            var w = Crafty.viewport.width,
                h = Crafty.viewport.height;
            
            this.move('n', this.speed);
            if(!this.within(0, 0, w, h)) {
                this.trigger('onBeforeDestroy');
                this.destroy();
            }
            this.trigger('onEnterFrame');
        });
        this.trigger('onAfterInit');
    },
    ball: function(options){
        options = options || {};
        Crafty.extend(this, this._ball_defaults, options);
        if(this.img) {
            this.image(this.img, 'no-repeat');
        }
        if(this.enabled){
            this.enable();
        }
        this.speed = this.speed / Crafty.timer.FPS();
    },
    enable: function(){
        this.addComponent('Collision');
        this.onHit('Enemy', function(nm){
            var a, b;
            for(a=0,b=nm.length;a<b;a++) {
                this.owner.onFireEnemy(nm[i]);
                nm[a].kill(this.attack);
            }
            this.destroy();
        });
    },
    disable: function(){
        this.removeComponent('Collision');
    }
});

Crafty.c('SBall', {
    init: function(){
        var me = this, start = -450, end = 450, step = 225, ball, c = 0;
        me.requires('2D, Canvas');
        for(;start<=end;start+=step) {
            ball = Crafty.e('Ball');
            ball.attr({
                x: me.x,
                y: me.y,
                w: me.w,
                h: me.h,
                rotation: start/10
            });
            ball.bind('Remove', function(){
                c--;
                if(c === 0) {
                    me.destroy();
                }
            });
            me.attach(ball);
            c++;
        }
    },
    S: function(){
        var i = 0, c = this._children, len = c.length;
        for(;i<len;i++) {
            c[i].ball();
        }
    }
});
Crafty.c('FunctionBall', {
    init: function(){},
    fx: function(){}
});


/*

function FunctionBall() {
    Ball.apply(this, arguments);
    if(!this.fx) { throw new Error('FunctionBall must provide a fx function'); }
}

FunctionBall.prototype = new Ball();
FunctionBall.prototype.constructor = FunctionBall;
FunctionBall.prototype.initialize = function(){
    this.bind('onEnterFrame', function(){
        var next = this.fx(this.x, this.y), xd, yd;
        xd = next[0] - this.x;
        yd = next[1] - this.y;
        if(xd > 0) {
            this.move('e', xd);
        } else {
            this.move('w', -1 * xd);
        }
        if(yd > 0) {
            this.move('s', yd);
        } else {
            this.move('n', -1 * yd);
        }
    });
};

*/