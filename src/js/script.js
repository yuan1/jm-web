console.log('Load script.js')

window.onload = function () {
  var indexSwiper = new Swiper('#index-swiper', {
    speed: 1000,
    longSwipes: false,
    loop: true,
    autoplay: {
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    }
  })
}
//顶部隐藏
var new_scroll_position = 0
var last_scroll_position
var header = document.getElementById('header')

//返回顶部
var top_btn = document.getElementById('top-btn')
var top_timer = null
var is_top = true

window.addEventListener('scroll', function (e) {
  last_scroll_position = window.scrollY
  // 向下滚动
  if (new_scroll_position < last_scroll_position && last_scroll_position > 80) {
    header.classList.remove('slide-down')
    header.classList.add('slide-up')

    // 向上滚动
  } else if (new_scroll_position > last_scroll_position) {
    header.classList.remove('slide-up')
    header.classList.add('slide-down')
  }
  new_scroll_position = last_scroll_position
  //返回顶部 在滚动的时候增加判断
  var os_top = document.documentElement.scrollTop || document.body.scrollTop //特别注意这句，忘了的话很容易出错
  if (os_top == 0) {
    top_btn.style.display = 'none'
  } else {
    top_btn.style.display = 'block'
  }
  if (!is_top) {
    clearInterval(timer)
  }
  is_top = false
})
top_btn.onclick = function () {
  //设置定时器
  top_timer = setInterval(function () {
    //获取滚动条距离顶部的高度
    var os_top = document.documentElement.scrollTop || document.body.scrollTop //同时兼容了ie和Chrome浏览器
    //减小的速度
    var isSpeed = Math.floor(-os_top / 6)
    document.documentElement.scrollTop = document.body.scrollTop =
    os_top + isSpeed
    isTop = true
    //判断，然后清除定时器
    if (os_top == 0) {
      clearInterval(top_timer)
    }
  }, 30)
}