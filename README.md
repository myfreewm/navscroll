
# 滚动定位插件

## 实现功能

1. 控制导航区域的滚动条的滑动
2. 点击导航区自动定位到对应的floor


## 案例

``` html5
<nav class="mstopnav msovbar bg-wh jepor">
    <ul class="f14 foreign-navh">
        <li class="on">服饰鞋包</li>
        <li class="">家纺</li>            
    </ul>
</nav>
<div class="floor floor0"></div>
<div class="floor floor1"></div>

```
``` javascript

navScroll({
    mainCell: '.mstopnav',
    ulCell: '.foreign-navh',
    childCell: 'li'
})

```

## 属性介绍
