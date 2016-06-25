/*
jquery ScrollChecker v0.31(20160512)
2016 telime(atali)
MIT License
*/
(function($){
    var evScrollPassing = $.Event("scScrollPassing");
    var evScrollCenter = $.Event("scScrollCenter");
    var evScrollInpage = $.Event("scScrollInpage");
    var evScrollOutpage = $.Event("scScrollOutpage");
    
    var ScrollChecker = (function($target, options){
        this.$checker = ($target.length > 0)? $target : $(options.checker) ;
        this.debug = options.debug || false;
        this.idcheck = options.idcheck;
        
        this.$html = $('html');
        this.$win = $(window);
        this.$scroller = (typeof options.scroller === 'object')? options.scroller : $(window);
        
        this.wh = this.$win.height();
        this.ww = this.$win.width();
        
        this._checkers = [];
        this.Scrolled = options.scrolled || false;
        
        this.eventEntry();
    });

    ScrollChecker.prototype.eventEntry = (function(){
        var _self = this;
        this.$scroller.on('scroll.scrollchecker', function(e){
            _self.scroll(e);
        });
        this.$win.on('resize.scrollchecker',  function(e){
            _self.resize(e);
        });
        this.$win.on('load.scrollchecker',  function(e){
            _self.load(e);
        });
    });

    ScrollChecker.prototype.remove = (function(){
        var _self = this;
        this.$win.off('scroll.scrollchecker');
        this.$win.off('resize.scrollchecker');
        this.$win.off('load.scrollchecker');
        
        this._checkers.forEach(function(_self){
            _self.el.removeData('scroll-percentage');
        });
        
        if(self.$checker.length > 0) {
            self.$checker.removeClass('passed pass-center inpage');
        }
    });

    ScrollChecker.prototype.reinit = (function($target, options){
        this.remove();
        var sc = new ScrollChecker($target, options);
        return sc;
    });

    ScrollChecker.prototype.scroll = (function(e){
        var self = this;
        var lastId = '';
        var _wh = self.wh;
        
        var _top = self.$scroller.scrollTop();
        var _bottom = _top + _wh;
        var _middle = _top + Math.ceil(_wh / 2);
        
        if(self.debug) console.log(_top + 'px/' + _bottom + 'px');
        
        this._checkers.forEach(function(_self){
            var _id = _self.el.data('scroll-id');
            
            //要素が画面に表示されてから画面外に出るまでのパーセンテージを求める
            var _p = Math.floor(((_bottom - _self.start) / (_self.end - _self.start + _wh)) * 100);
            _self.el.data('scroll-percentage', _p);
            if(self.debug) console.log('id:' + _id, _p);
            
            //要素の状態をクラスに反映
            if(_top > _self.start){
                if(!_self.el.hasClass('passed')){
                    _self.el.addClass('passed').trigger(evScrollPassing);
                }
                if((typeof _id !== 'undefined') && (self.idcheck === 'top')) lastId = _id;
            } else {
                _self.el.removeClass('passed');
            }
            
            if(_middle > _self.start){
                if(!_self.el.hasClass('pass-center')){
                    _self.el.addClass('pass-center').trigger(evScrollCenter);
                }
                if((typeof _id !== 'undefined') && (self.idcheck === 'center')) lastId = _id;
            } else {
                _self.el.removeClass('pass-center');
            }
            
            if((0 < _p) && (_p < 100)){
                if(!_self.el.hasClass('inpage')){
                    _self.el.addClass('inpage').trigger(evScrollInpage);
                }
            } else {
                if(_self.el.hasClass('inpage')){
                    _self.el.removeClass('inpage').trigger(evScrollOutpage);
                }
            }
            
            if(_self.stopEl.length > 0) {
                var content_long = _self.stopEl.offset().top - _self.el.height();
                if(_top > content_long) {
                    _self.el.addClass('fit-bottom');
                } else {
                    _self.el.removeClass('fit-bottom');
                }
            }
            
        });
        
        if(typeof this.Scrolled === 'function') this.Scrolled(_top, lastId, this._checkers, this);
        
        if(self.debug) console.log('scroll', lastId);
        
    });

    ScrollChecker.prototype.resize = (function(e){
        var self = this;
        
        self.wh = self.$win.height();
        self.ww = self.$win.width();
        
        self._checkers = [];
        if(self.$checker.length < 1){
            self.scroll(e);
            return;
        }
        
        self.$checker.removeClass('passed pass-center inpage fit-bottom');
        
        //window以外の子要素の場合、scrollerのscrollTopを基準位置に加算する必要がある。
        var _scrollOffset = (self.$scroller.is(self.$win))? 0 : self.$scroller.scrollTop();
        
        self.$checker.each(function(){
            var $t = $(this);
            var _offset_top = $t.data('scroll-offset-top') || 0;
            var _offset_bottom = $t.data('scroll-offset-bottom') || 0;
            
            var _scroll_bottom = $t.data('scroll-bottom') || '.js-scroll-bottom';
            
            self._checkers.push({
                el: $t,
                stopEl: $(_scroll_bottom),
                start: ($t.offset().top - _offset_top) + _scrollOffset,
                end: $t.offset().top + ($t.height() + _offset_bottom) + _scrollOffset
            });
        });
        
        self.scroll(e);
        
    });

    ScrollChecker.prototype.load = (function(e){
        var self = this;
        self.resize(e);
    });

    $.fn.scrollChecker = function(config){
        'use strict';
        
        var defaults={
            checker: '.js-scroll-check',
            idcheck: 'center',
            scroller: undefined,
            scrolled: false,
            debug: false
        }
        var options=$.extend(defaults, config);
        
        var $target = $(this);
        var sc = new ScrollChecker($target, options);
        
        return sc;
    };
})(jQuery);

