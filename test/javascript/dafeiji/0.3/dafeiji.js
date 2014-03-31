var utils = {
    merge: function(){
        var src, args, i, len, k;
        if(arguments.length <= 1) {
            return arguments[0];
        }
        src = arguments[0];
        args = [].slice.call(arguments, 1);
        for(i=0, len=args.length;i<len;i++) {
            obj = args[i];
            for(k in obj) {
                src[k] = obj[k];
            }
        }
        return src;
    }
};
Crafty.c('Ball', {
    _ball_defaults: {
        w: 5,
        h: 5,
        speed: 100,
        attack: 1,
        img: 'ball.png',
        enabled: true
    },
    hitTarget: 'Enemy',
    flyDir: 'n',
    init: function(){
        this.requires('2D, Canvas, Image');
        this.bind('EnterFrame', function(){
            var w = Crafty.viewport.width,
                h = Crafty.viewport.height;
            
            this.move2next();
            if(!this.within(0, 0, w, h)) {
                this.trigger('onBeforeDestroy');
                this.destroy();
            }
            this.trigger('onEnterFrame');
        });
        this.trigger('onAfterInit');
    },
    move2next: function(){
        this.move(this.flyDir, this.speed);
    },
    ball: function(options){
        options = options || {};
        utils.merge(this, this._ball_defaults, options);
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
        this.onHit(this.hitTarget, function(nm){
            var a, b;
            for(a=0,b=nm.length;a<b;a++) {
                this.owner.onFireEnemy(nm[a].obj);
                nm[a].obj.hited(this.attack);
            }
            this.trigger('onBeforeDestroy');
            this.destroy();
        });
    },
    disable: function(){
        this.removeComponent('Collision');
    },
    test: function(){
        this.bind('EnterFrame', function(){
            //console.log(this.getId(), this.x, this.y);
        })
    }
});

Crafty.c('FunctionBall', {
    init: function(){
        var oldref;
        if(this.move2next) {
            if(this._old_move2next) {
                oldref = this._old_move2next;
            }
            this._old_move2next = this.move2next;
            oldref && (this._old_move2next._old_move2next = oldref);
            delete this.move2next
        }
    },
    remove: function(){
        if(this._old_move2next) {
            this.move2next = this._old_move2next;
            this._old_move2next = this._old_move2next._old_move2next;
        }
    },
    fx: function(options){
        if(typeof options == "function") {
            this._func = options;
        } else if(typeof options == "object") {
            this._func = options.func;
            delete options.func;
            utils.merge(this, options);
        }
        this._origin_pos = [this.x, this.y];
        this.move2next = function(){
            var xy = this._func(this.speed, this.x, this.y, this._origin_pos);
            if(xy === false) { return; }
            this.attr({x: xy[0], y: xy[1]});
        };
        this.ball();
        return this;
    }
});

Crafty.c('SBall', {
    init: function(){
        var me = this, i, len, angles = [15, 30, -30, -15], ball;
        me.requires('Ball');
        me._other_balls = [];
        for(i=0,len=angles.length;i<=len;i++) {
            ball = Crafty.e('Ball, FunctionBall');
            ball.angle = angles[i];
            me._other_balls.push(ball);
        }
        me.bind('EnterFrame', function(){
            var i, len, c = this._other_balls,
                x = this.x, y = this.y, o = this._origin_pos,
                x0, y0, r = Math.abs(o[1] - y);
            for(i=0,len=c.length;i<len;i++) {
                x0 = x + Math.sin(c[i].angle*Math.PI/180) * r;
                y0 = o[1] - Math.cos(c[i].angle*Math.PI/180) * r;
                c[i].attr({x: x0, y: y0});
            }
        });
        me.bind('onBeforeDestroy', function(){
            var i, len, c = this._other_balls;
            for(i=0,len=c.length;i<len;i++) {
                c[i].destroy();
            }
        });
    },
    S: function(options){
        var i = 0, c = this._other_balls, len = c.length;
        options = options || {};
        utils.merge(this, options);
        for(;i<len;i++) {
            c[i].fx({
                x: this.x,
                y: this.y,
                z: this.z,
                w: this.w,
                h: this.h,
                func: function(){ return false; },
                owner: this.owner
            });
        }
        this._origin_pos = [this.x, this.y];
        this.ball({speed: 200});
    }
});

Crafty.c('Hidden', {
    init: function(){
        this.opacity = 0.3;
    },
    hideConst: function(n){
        if(n > 0 && n < 1) {
            this.opacity = n;
        }
    }
});

Crafty.c('Time', {
    _default_seconds: 10,
    _timer_obj: null,
    start: function(){
        var me = this, cb = function(){
            if(me.currentSecond !== 0) {
                me.currentSecond--;
                me._timer_obj = setTimeout(cb, 1000);
            } else {
                me.trigger('TimeEnd');
            }
        };
        if(_default_seconds === 0) {
            return;
        }
        this._timer_obj = setTimeout(cb, 1000);
        me.currentSecond = me._default_seconds;
        me.trigger('TimeStart');
    },
    reget: function(){
        this.currentSecond = this._default_seconds;
    },
    setDefault: function(num){
        this._default_seconds = num;
    }
});

Crafty.c('MyPlane', {
    life: 5,
    hitTarget: 'Enemy',
    ballName: 'SBall',
    init: function(){
        this.requires('2D, Canvas, Image, Collision, Draggable, Fourway');
    },
    fire: function(){
        var me = this;
        me.collision(new Crafty.polygon([20, 0], [40, 26], [20, 40], [0, 26]));
        me.image('plain.png', 'no-repeat');
        me.attr({x: (Crafty.viewport.width-40)/2, y: Crafty.viewport.height-40, w: 40, h: 40});
        me.fourway(5);
        me.onHit(me.hitTarget, function() {
            //Crafty.scene('end');
        });
        this._shoot();
    },
    _shoot: function(){
        var me = this, cb = function(){
            var ball = Crafty.e(me.ballName), props;
            ball.owner = me;
            ball.hitTarget = "Enemy";
            props = {
                x: me.x+(me.w-5)/2,
                y: me.y - 3,
                w: 5,
                h: 5
            };
            switch(me.ballName) {
                case 'Ball':
                    ball.ball(props);
                    break;
                case 'SBall':
                    ball.S(props);
                    break;
            }
        };
        this._ball_timer = setInterval(cb, 200);
    },
    hited: function(num){
        this.life -= num;
        if(this.life <= 0) {
            Crafty.e('GameOver');
            Crafty.pause();
        }
    },
    onFireEnemy: function(){}
});

Crafty.c('Enemy', {
    life: 1,
    speed: 100,
    attack: 1,
    boss: false,
    init: function(){
        this.requires('2D, Canvas, Image, Collision');
        this.collision(new Crafty.polygon([[13, 0], [26, 17], [13, 26], [0, 17]]));
        this.image('enemy.png', "no-repeat");
    },
    move2next: function(){
        this.move('s', this.speed);
    },
    hited: function(n){
        this.life -= n;
        if(this.life <= 0) {
            this.destroy();
        }
    },
    go: function(){
        this.speed = this.speed / Crafty.timer.FPS();
        this.bind('EnterFrame', function(){
            var w = Crafty.viewport.width,
                h = Crafty.viewport.height;
            
            this.move2next();
            if(!this.boss && !this.within(0, 0, w, h)) {
                this.trigger('onBeforeDestroy');
                this.destroy();
            }
        });
        return this;
    }
});

//敌人，匀速前行，速度一般
Crafty.c('Enemy1', {
    init: function(){
        this.requires('Enemy');
        this.speed = 100;
    }
});

//敌人，匀速前行，速度较快
Crafty.c('Enemy2', {
    init: function(){
        this.requires('Enemy');
        this.speed = 200;
    }
});

//敌人，匀速前行，速度快
Crafty.c('Enemy3', {
    init: function(){
        this.requires('Enemy');
        this.speed = 300;
    }
});

//敌人，匀速前行，速度飞快
Crafty.c('Enemy4', {
    init: function(){
        this.requires('Enemy');
        this.speed = 400;
    }
});


Crafty.c('BOSS', {
    init: function(){
        var mv = this.move2next;
        this.requires('Enemy');
        this.move2next = mv;
        this.boss = true;
        this.life = 100;
        this._move_dir = "left";
    },
    fire: function(){
        var me = this;
        me._ball_timer = setInterval(function(){
            var b = Crafty.e('Ball');
            b.hitTarget = 'MyPlane';
            b.flyDir = 's';
            b.ball({
                x: me.x + (me.w-b.w)/2,
                y: me.y + me.h + 1
            });
            b.owner = me;
        }, 300);
    },
    move2next: function(){
        var x = this.x, y = this.y;
        if(this._move_dir == "left") {
            if(x <= 0) {
                this._move_dir = "right";
            } else {
                this.attr({x: x - 2});
            }
            
        } else if(this._move_dir == "right") {
            if(x + this.w >= Crafty.viewport.width) {
                this._move_dir = "left";
            } else {
                this.attr({x: x + 2});
            }
        }
        if(y < 0) {
            this.attr({y: y + 1});
        }
    },
    onFireEnemy: function(){}
});

Crafty.c('GameOver', {
    init: function(){
        this.requires('2D, Canvas, Tint, Color');
        this.color('#786cd8').tint('#99cc66', 0.4);
        this.attr({
            x: 0,
            y: 0,
            w: Crafty.viewport.width,
            h: Crafty.viewport.height
        });
        Crafty.e('2D, Canvas, Text').attr({
            x: 100,
            y: 200
        }).text('game over!').textFont({
            family: '微软雅黑',
            size: '35px'
        });
    }
});
