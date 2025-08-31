'use strict';
var ball_num = 0;  // 球体数量
var balls = []     // 存储所有球体对象的数组
var fps = 60;      // 帧率

var canvas;        // 画布元素
var ctx;           // 画布上下文
var balls_data;    // 球体数据
var videoContainer; // 包含视频及相关信息的对象
var bar_height = 0; // 顶部栏高度
var bar_height_spd = 0; // 顶部栏高度变化速度
var footer_height = 0; // 底部栏高度
var device_is_mobile = false; // 是否为移动设备
var link_image;    // 链接图标
var play_image;    // 播放图标
var paid_image;    // 付费图标

var wobble_t = 0;   // 摇晃计时器
var wobble_ball_index = 0; // 当前摇晃的球体索引
var do_wobbles = true; // 是否启用摇晃效果

var timestamp = 0;

// 绘制背景
function drawRandomBackground() {
    ctx.fillStyle = getRandomColor();
    ctx.fillRect(0, 0, uiCanvas.width, uiCanvas.height);
}

//-- 文档加载事件
$(document).ready(function()
{
    canvas = document.getElementById("uiCanvas");
    ctx = canvas.getContext("2d");

    // 检测移动设备
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        device_is_mobile = true;
    }

    // 如果是移动设备则隐藏页脚
    //if (device_is_mobile)
        $("#footer").hide();
    $("#title").hide();

    //-- 加载链接图标
    link_image = new Image(212, 212);
    link_image.src = "images/link_nice.png";
    link_image.onload = function() {
        ctx.imageSmoothingEnabled = false; // 关键！禁用抗锯齿
        ctx.drawImage(link_image, x, y, width, height);
    };
    //-- 加载播放图标
    play_image = new Image(183, 183);
    play_image.src = "images/play.png";
    play_image.onload = function() {
        ctx.imageSmoothingEnabled = false; // 关键！禁用抗锯齿
        ctx.drawImage(link_image, x, y, width, height);
    };
    //-- 加载付费图标
    paid_image = new Image(180, 180);
    paid_image.src = "images/paid.png";
    paid_image.onload = function() {
        ctx.imageSmoothingEnabled = false; // 关键！禁用抗锯齿
        ctx.drawImage(link_image, x, y, width, height);
    };

    // 设置窗口尺寸
    resize();
    $( window ).resize(function(){resize();});
    window.addEventListener('orientationchange', resize);

    // 设置顶部栏高度
    var text_scale = 0.03;
    var size = text_scale * canvas.width;
    var aspect = canvas.width / canvas.height;
    if (size < 60)
        size = 60;
    bar_height = 3 * size;
    // 加载JSON文件
    $.getJSON("balls.json", function(json) {
        //console.log(json); // 在Firebug控制台显示信息
        balls_data = json;
        for (var i = 0; i < json.length; i++)
        {
            var xx = json[i].x;
            var yy = (json[i].y) * 0.8 + 0.2;
            if (canvas.width > canvas.height)
            {
                xx = balls_data[i].y;// / aspect + (aspect - 1) / 4;
                yy = (balls_data[i].x) * 0.95 + 0.05;
            }
            var b = create_ball(json, i, 0, xx, yy, true);
            b.radius = json[i].radius * 0.66;
        }
        setInterval(function(){loop();}, 1000 / fps);
    });

    // 返回按钮事件
    window.onpopstate = function(event) {
        console.log("> new_page: " + new_page)
        console.log("> event.state: " + event.state)
        location.reload();
    };
    var btn = $("#mc-embedded-subscribe");
    btn.disabled = true;
    btn.css('background-color', '#AAAAAA');
    btn.css('cursor', 'default');
    $("#mce-EMAIL").on('input', function(e){
        var str = $(this).val();
        var pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        if (str.match(pattern))
        {
            btn.disabled = false;
            btn.css('background-color', '#FEAF00');
            btn.css('cursor', 'pointer');
        }
        else
        {
            btn.disabled = true;
            btn.css('background-color', '#AAAAAA');
            btn.css('cursor', 'default');
        }
    });
});

//-- 初始化球体实例
function create_ball(ball_list, index, layer, x, y, offset_xy)
{
    var b = ball_list[index];
    var xx = x;
    var yy = y;
    if (xx == -1)
        xx = b.x;
    if (yy == -1)
        yy = b.y;
    if (offset_xy)
    {
        xx += 0.5 * canvas.width / scale - 0.5;
        yy += 0.5 * canvas.height / scale - 0.5;
    }
    var ball = new Ball(b.name, b.title, index, layer, b.image, b.video, b.video_loop, b.video_autoplay, b.color, b.bar_color, b.radius, b.enhance_factor, b.clip, b.textscale, xx, yy, b.children, b.pops, b.show_name, b.url, b.text_color, b.text, b.paid, b.frame);
    balls.push(ball);
    return ball;
}

//-- 调整尺寸
var scale = 1;
function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    scale = canvas.width;
    if (canvas.height < canvas.width)
        scale = canvas.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


var cursors = {
    default: "url('images/mouse.png'), auto",
    pointer: "url('images/hand.png'), auto",
    // 可以添加更多状态
};

//-- 主循环
var collision_counter;
var cursor = "default";
var cursor_prev = cursor;
var selection = -1;
var linked = false;
function loop()
{
    //-- 点击计时器
    if (tapped_timer > 0)
        tapped_timer--;
    
    //-- 设置光标样式
    // if (cursor != cursor_prev)
    //     $('canvas').css('cursor', cursor);
    // cursor_prev = cursor;
    // cursor = "default";

    // 更新光标
    if (cursor != cursor_prev) {
        $('canvas').css('cursor', cursors[cursor] || cursors.default);
    }
    cursor_prev = cursor;
    cursor = "default";
    
    // 返回按钮区域检测
    if (mouse.x < canvas.height * 0.15 / scale && mouse.y < canvas.height * 0.08/ scale) {
        cursor = 'pointer';
    }

    //-- 更新步骤
    var text_scale = 0.03;
    var size = text_scale * canvas.width;
    if (size < 60)
        size = 60;

    collision_counter = ball_num;
    for (var i = 0; i<ball_num; i++)
    {
        balls[i].ball_index = i;
        balls[i].step();
    }

    draw_site_url(canvas.height * 0.065);
    // 返回按钮
    // if (mouse.x < canvas.height * 0.15 / scale && mouse.y < canvas.height * 0.08/ scale)
    //     cursor = 'pointer';

    //-- 摇晃父球体
    if (!do_wobbles)
    {
        wobble_t = 0;
        wobble_ball_index = 0;
    }
    do_wobbles = true;
    wobble_t += 0.05;
    if (wobble_t >= 1 && ball_num > 0)
    {
        wobble_t-=0.5;

        // 选择下一个有子元素的球体
        var start_i = wobble_ball_index;
        while(wobble_ball_index == start_i || !balls[wobble_ball_index].pops)
        {
            wobble_ball_index++;
            if (wobble_ball_index >= ball_num)
            {
                wobble_ball_index = -1;
                wobble_t-=4;
                break;
            }
        }
        var ball = balls[wobble_ball_index];
        // 摇晃球体（如果有）
        if (wobble_t > 0)
        {
            ball.wobble = 3;
            ball.wobblerot = 90;
        }
    }

    //-- 绘制球体
    for (var i = 0; i<ball_num; i++){
        balls[i].draw();
        balls[i].loop();
    }
}


var current_background_color;
var current_bar_color = "#cca69fff";
var url_t = 0;
var subtitle_string = "Loading....";
var vgc_t = -10;
function draw_site_url(size)
{
    // 清除顶部和底部栏
    bar_height_spd *= 0.85;
    bar_height += bar_height_spd;
    ctx.clearRect(0, 0, canvas.width, size * 3.5);
    ctx.clearRect(0, canvas.height - size * 2.2, canvas.width, canvas.height);

    // 绘制URL栏
    ctx.fillStyle = current_bar_color;//"#DBD28E";
        ctx.clearRect(0, 0, canvas.width, size * 5);
    if (current_layer == 0)
    {
        bar_height = -size * 0.2;
        bar_height_spd += (-size * 0.2 - bar_height) * 0.05;
    }
    else
    if (current_layer > 1 || linked)
    {
        bar_height_spd += (size * 1.5 - bar_height) * 0.05;
        vgc_t = -10;
        footer_height += (-size * 0.2 - footer_height) * 0.2;
    }
    else
    if (current_layer == 1)
    {
        bar_height_spd += (size * 3.3 - bar_height) * 0.2;
        bar_height_spd *= 0.5;
        /*if (!device_is_mobile)
            footer_height += (size * 2 - footer_height) * 0.2;
        else*/
            footer_height += (-size * 0.2 - footer_height) * 0.2;
        current_bar_color = "#00695C";
        current_bar_color = "#8D6E63";

        if (vgc_t <= subtitle_string.length)
        {
            vgc_t += 0.5;
            $("#vgc").html(subtitle_string.substr(0, vgc_t));
        }
    }
    ctx.fillRect(0, 0, canvas.width, bar_height);
    ctx.fillStyle = "#FFD88C";

    ctx.fillRect(0, canvas.height - footer_height, canvas.width, canvas.height);

    //-- 绘制URL文本
    ctx.globalAlpha = 0.5;
    ctx.font = size + "px VonwaonBitmap";
    ctx.textAlign = "left";
    ctx.textBaseline="middle"; 

    // 设置文本颜色
    ctx.fillStyle = "#000000";
    if (true || current_background_color == "#000000")
    {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#FFFFFF";
    }
    var str = new_page.replace('_', ' ');
    str = str.replace("-", "/");
    str = str.replace("-", "/");
    str = str.replace("LOAD GAME/", '');
    var arrow = String.fromCharCode(0x2190);
    if (current_layer>1)
        str = " " + arrow + " */" + str;
    else
        str = "";//" */" + str;
    if (linked)
        str = "  跳转中....."
    if (url_t < str.length)
        url_t += 0.5;
    if (url_t > str.length)
        url_t -= 0.5;
    ctx.fillText(str.substr(0, url_t), 0, bar_height / 2);// - this.radius * scale * 1.25);
    ctx.globalAlpha = 1;
}













//-- 辅助函数
var a, b;
function distance(x1, y1, x2, y2)
{
    a = (x1 - x2);
    b = (y1 - y2);

    return Math.sqrt( a*a + b*b );
}

// 球体碰撞检测变量
var dst = 0;
var xoff, yoff;
var diff = 0;
var m1, r1, r2;
function ball_ball_collision(a, b)
{
    dst = a.radius + b.radius;
        
    xoff = a.x - b.x;
    yoff = a.y - b.y;

    //-- 优化
    if (xoff > dst || -xoff > dst || yoff > dst || -yoff > dst)
        return;

    diff = xoff * xoff + yoff * yoff;
    if (diff < dst * dst)
    {
        diff = Math.sqrt(diff) - dst; 
        dst = 1 / dst;
        xoff *= diff * dst;
        yoff *= diff * dst;
        
        m1 = 1 / (b.mass+a.mass)
        r1=b.mass * m1;
        r2=a.mass * m1;
        a.hspd -= xoff * r1;
        a.vspd -= yoff * r1;
        a.rspd += diff * r1 * 0.5;
        b.hspd += xoff * r2;
        b.vspd += yoff * r2;
        b.rspd += diff * r2 * 0.5;
    }
}

function readyToPlayVideo(event)
{ 
    // 视频尺寸可能与画布不匹配，因此找到合适的缩放比例
    videoContainer.scale = Math.min(
                         canvas.width / this.videoWidth, 
                         canvas.height / this.videoHeight); 
    videoContainer.ready = true;
    // 视频可以播放，交给显示函数处理
    requestAnimationFrame(updateCanvas);
}