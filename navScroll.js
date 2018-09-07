/**
 * 导航滚动插件
 * 功能：滚动页面时导航横向滚动，并且自带手指滑动功能
 * 配置参数：
 * {
 *     mainCell：导航容器节点
 *     ulCell：  列表容器
 *     childCell：列表子节点
 *     placeholderHeight:当导航区固定在顶部的时候屏幕滚动需要减去导航区的高度 
 * }
 * 实例：
 * navScroll({
 *      mainCell: '.mstopnav',
 *      ulCell: '.foreign-navh',
 *      childCell: 'li'
 * })
 * 页面结构：
 * <nav class="mstopnav msovbar bg-wh jepor">
 *     <ul class="f14 foreign-navh">
 *         <li class="on">服饰鞋包</li>
 *         <li class="">家纺</li>            
 *     </ul>
 * </nav>
 * <div class="floor floor0"></div>
 * <div class="floor floor1"></div>
 * 特殊参数说明：
 * needCalcWidth 如果像顶部导航的页面，那么滚动条滚动的时候导航区是不移动的，默认是true 改成 false就是不移动导航区
 * */ 
/**
 * version 2.0
 * 1. 兼容旧版 通过isnew进行判断，但建议使用2.0版
 * 2. 特性：放弃了1.0 版本的通过window.scrollTo进行页面滚动，采用html的scrollIntoView进行类似锚点操作，优点：不用计算页面的高度 ，目前测试兼容ios9以上
 * 3. example:https://www.2beauti.com/wx/njs/plugins/index.js
 * */
(function (window, document, $) {


    function NavScroll(opts) {

        var defaultOpts = {
                mainCell: '.mstopnav',
                ulCell: '.foreign-navh',
                childCell: 'li',
                fixCell:'navfix',
                placeholderHeight:130,
                needCalcWidth:true,
                clickfn:null,
                isNew:false
            };
        this.currentOpts = $.extend(defaultOpts,opts);

        this.speed = 0;
        this.navFixDistance = $(this.currentOpts.ulCell).offset().top;
        this.scrollTopArr = [];
        this.idx = 0;
        this.len = 0;
        this.initDiff = 0;
        this.moveDiff = 0;   
        this.range = 0;
        this.isMoving = true;
        this.getSpeed();
        this.getScrollTopArr();
        this.renderNav(this.idx);

        this.watchScroll();
        this.init();

        this.touchStart();
        this.touchMoving();
        this.touchEnd();

    }

    NavScroll.prototype = {
        init: function () {
            var that = this;

            $(that.currentOpts.ulCell).on('click', that.currentOpts.childCell, function () {
                $(window).off('scroll');
                var idxs = $(this).index();
                var target = that.scrollTopArr[idxs];

                if (target > that.navFixDistance) {
                    $(that.currentOpts.mainCell).addClass(that.currentOpts.fixCell);
                } else {
                    $(that.currentOpts.mainCell).removeClass(that.currentOpts.fixCell);
                }
                if(that.currentOpts.isNew){
                    $('.placeholddom').remove();
                    var placeHtml='<div class="placeholddom" style="width:100%;height:'+that.currentOpts.placeholderHeight+'px"></div>';
                    $('.floor'+idxs).prepend($(placeHtml))
                    document.querySelector('.floor'+idxs).scrollIntoView(true);
                }else{
                    
                    $("html,body").scrollTop(target - that.currentOpts.placeholderHeight);
                }
                // $(window).scrollTop(target - that.currentOpts.placeholderHeight)
                // document.body.scrollTop = ;
                // document.documentElement.scrollTop = target - that.currentOpts.placeholderHeight;
                that.renderNav(idxs);
                var me = that;
                setTimeout(function () {
                    me.watchScroll()
                }, 1000)
                that.currentOpts.clickfn&&that.currentOpts.clickfn()

            })
        },
        getSpeed: function () {
            var that = this,
                totalWidth = 0,
                widthDiff = 0
            heigthDiff = 0;

            $(that.currentOpts.ulCell).find(that.currentOpts.childCell).each(function () {
                totalWidth += $(this).width();
            });
           
            

            widthDiff = totalWidth - $(window).width();
            // 做判断如果导航横向的宽度小于屏幕的宽度
            // 1. 不需要手指滑动
            // 2. 屏幕向下滚动的时候导航不需要滚动
            that.range = widthDiff;
            if(that.currentOpts.needCalcWidth){
                if(that.range <= 0){
                    that.isMoving = false;
                    $(that.currentOpts.ulCell).css('width', $(window).width() + 'px');
                }else{
                    $(that.currentOpts.ulCell).css('width', totalWidth + 'px');
                }
            }
            
            heigthDiff = $(document).height() - $(window).height();
            that.speed = widthDiff / heigthDiff;

            

        },
        getScrollTopArr: function () {
            var that = this;
            that.len = $(that.currentOpts.ulCell).find(that.currentOpts.childCell).length;

            for (var i = 0; i < that.len; i++) {
                var currentDom = '.floor' + i;
                that.scrollTopArr.push($(currentDom).offset().top)
            }
            console.log(that.scrollTopArr)
        },
        renderNav: function (idx) {
            var that = this;
            var items = that.currentOpts.ulCell + ' ' + that.currentOpts.childCell
            $(items).removeClass('on').eq(idx).addClass('on')
        },
        watchScroll: function () {
            var that = this;
            $(window).on('scroll', function () {
                var walker = window.scrollY;
                var target = that.scrollTopArr[that.idx + 1];
                var returnTarget = that.scrollTopArr[that.idx - 1];
                var distance = walker * that.speed;

                // navfix
                if(that.currentOpts.needCalcWidth){
                    if (walker >= that.navFixDistance) {
                        $(that.currentOpts.mainCell).addClass(that.currentOpts.fixCell);
                        if(that.isMoving){
                            $(that.currentOpts.ulCell).css('transform', 'translate3d('+-distance+'px,0,0)');
                        }
                    } else {
                        $(that.currentOpts.mainCell).removeClass(that.currentOpts.fixCell);
                        $(that.currentOpts.ulCell).css('transform', 'translate3d('+0+'px,0,0)');
                        
                    }
                }

                // 
                if (walker > target) {

                    if (that.idx > that.len - 1) {

                        that.idx = that.len - 1;
                    } else {

                        that.idx++;
                        target = that.scrollTopArr[that.idx + 1];
                    }
                };

                if (walker < returnTarget) {
                    if (that.idx < 0) {
                        that.idx = 0;
                    } else {
                        that.idx--;
                        target = that.scrollTopArr[that.idx - 1];
                    }
                };

                that.renderNav(that.idx);
            })


        },
        touchStart:function(){
            var that = this;
            if(!that.isMoving){
                return;
            }
            $(that.currentOpts.ulCell).on('touchstart',function(opts){
                
                var initVal = $(that.currentOpts.ulCell).css('transform').replace('translate3d(', '').replace(')', '').replace(', 0px, 0px', '').replace('px', '');
                that.initDiff = opts.touches[0].clientX - initVal;
                
            })
        },
        touchMoving:function(){
            var that = this;
            if(!that.isMoving){
                return;
            }
            $(that.currentOpts.ulCell).on('touchmove',function(opts){
                
                that.moveDiff = opts.touches[0].clientX - that.initDiff;
                
                $(that.currentOpts.ulCell).css('transform', 'translate3d('+that.moveDiff+'px,0,0)');
                
            })
        },
        touchEnd:function(){
            var that = this;
            if(!that.isMoving){
                return;
            }
            $(that.currentOpts.ulCell).on('touchend',function(opts){
                console.log(opts);
                var endX = opts.changedTouches[0].clientX - that.initDiff;
                console.log(endX);
                if(endX>0){
                    $(that.currentOpts.ulCell).css('transform', 'translate3d('+0+'px,0,0)');
                }else if(-endX >= that.range){
                    $(that.currentOpts.ulCell).css('transform', 'translate3d('+(-that.range)+'px,0,0)');
                }
            })
        }
    }

    function navScroll(opts) {
        return new NavScroll(opts)
    }

    window.navScroll = navScroll


})(window, document, window.$ || $)

