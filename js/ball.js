function Ball(name, title, json_index, layer, image_url, video_url, video_loop, video_autoplay, color, bar_color, radius, enhance_fac, clip, text_scale, x, y, children, pops, show_name, url, text_color, text, paid, framenum)
{
    //-- load image
    this.image = undefined;
    // if (image_url != undefined)
    // {
    //     this.image = new Image(radius, radius);
    //     this.image.src = image_url;
    // }

    // 新增精灵相关属性
    // 多帧精灵堆叠相关属性
    this.sprites = [];
    this.frameCount = framenum;
    this.frameOffset = 2; // 每帧之间的垂直偏移量
    
    // 加载多帧图像
    if (image_url != undefined) {
        const img = new Image();
        img.src = image_url;
        img.onload = () => {
            for (let i = 0; i < this.frameCount; i++) {
                const sprite = new Sprite(img, this.frameCount, i);
                sprite.scale = 2;
                this.sprites.push(sprite);
            }
        };
    }

    this.color = "#000000";
    if (color != undefined)
        this.color = color;

    this.bar_color = "#000000";
    if (bar_color != undefined)
        this.bar_color = bar_color;

    this.text_color = "#FFFFFF";
    if (text_color != undefined)
        this.text_color = text_color;
    this.ball_index = ball_num;
    this.json_index = json_index;
    ball_num++;


    //-- video
    this.video = undefined;
    this.video_ready = false;
    this.video_autoplay = false;
    if (video_url != undefined)
    {
        this.video = document.createElement("video"); // create a video element
        this.video.src = video_url; 
        this.video.playsinline = true;
        this.video.playsInline = true;
        this.video.playsInLine = true;
        this.video.currentTime = 1;
        this.video.loop = false;
        if (video_loop != undefined)
        {
            this.video.loop = video_loop;
        }
        if (video_autoplay != undefined)
        {
            this.video_autoplay = video_autoplay
            this.video.muted = true;
            this.video.autoplay = true;
            this.video.load();
        }
        //console.log(this.video);
        var ba = this;
        this.video.oncanplay = function() {
            ba.video_ready = true;
            if (ba.video_autoplay)
            {
                ba.video.play();
            }
        };
    }

    this.title = "";
    if (title != undefined)
        this.title = title;
    
    this.paid = false;
    if (paid != undefined)
        this.paid = paid;

    this.url = "";
    this.set_page_url = true;
    if (url != undefined)
    {
        this.url = url;
        this.set_page_url = false;
    }
    this.name = name;
    this.show_name = true;
    this.always_show_name = false;
    if (show_name != undefined)
    {
        this.show_name = show_name;
        if (show_name == "always")
        {
            this.always_show_name= true;
            this.show_name = true;
        }
    }
    this.text_t = 0;
    this.text_scale = 1;
    this.layer = layer;
    if (text_scale != undefined)
        this.text_scale = text_scale;
    this.text = "";

    //this.text_image = undefined;
    //this.text_image_res = 1000;
    if (text != undefined)
    {
        this.text = text.split('#');
        
        //this.text_image = ctx.createImageData(radius * this.text_image_res, radius * this.text_image_res);
    }
    //-- relations
    this.parent = -1;

    //-- children
    this.children = []
    if (children != undefined)
        this.children = children;
    this.pops = this.children.length > 0;
    
    //-- physics stuff
    this.hspd = 0;
    this.vspd = 0;
    this.x = x;
    this.y = y;
    this.fric = 0.95;
    this.mouse_xoff = 0;
    this.mouse_yoff = 0;
    this.dragged = false;

    //-- radius stuff
    this.radius = 0;//radius / 2;
    this.radius_normal = radius;
    if (this.radius_normal == undefined)
        this.radius_normal = 0.2;
    this.radius_enhanced = this.radius_normal;
    if (enhance_fac != undefined)
        this.radius_enhanced *= enhance_fac;
    else
        this.radius_enhanced *= 1.5;
    this.clipping = 0;
    if (clip != undefined)
        this.clipping = clip;
    this.radius_target = this.radius_normal;
    this.enhanced = false;
    this.rspd = 0;
    this.wobble = 0;
    this.wobblerot = Math.random(360);

    this.deleting = false;
    
    this.mass = this.radius * this.radius * 3.1415;

    this.step = function()
    {
        //-- stop p;aying video if not enhanced
        if (this.video != undefined && this.video.paused == false && this.enhanced == false && !this.video_autoplay)
            this.video.pause();

        // no wobbles when video is playing
        if (this.video != undefined && this.video.paused == false && !this.video_autoplay)
            do_wobbles = false;

        //-- move to correct page
        var hash = window.location.href.split('#')[1];
        if (hash != undefined && selection != this &&  $.inArray(this.name.replace('#', ''), hash.split('-')) != -1)
        {
            new_page = hash;
            this.tapped(false);
        }
        if (current_layer != this.layer)
            this.delete();
        // draw clear
        var clear_r = this.radius;
        if (clear_r < this.radius_normal)
            clear_r = this.radius_normal;
        ctx.clearRect((this.x - clear_r) * scale - 1, (this.y - clear_r) * scale - 1, clear_r * scale * 2 + 2, clear_r * scale * 2 + 2);

        //-- physics
        if (this.dragged)
        {
            var old_x = this.x;
            var old_y = this.y;
            this.x = mouse.x + this.xoff; 
            this.y = mouse.y + this.yoff; 
            this.hspd = (this.hspd + this.x - old_x) / 2;
            this.vspd = (this.vspd + this.y - old_y) / 2;
            tapped_timer -= distance(0, 0, this.hspd, this.vspd)  * scale;
        }
        else
        {
            this.hspd *= this.fric;
            this.vspd *= this.fric;
            this.x += this.hspd;
            this.y += this.vspd;
        }

        //-- parent
        this.mass = this.radius * this.radius * 3.1415;
       
        //-- collision
        if (!this.deleting)
            for (var i = 0; i < ball_num; i++)
            {
                if (i != this.ball_index && balls[i].deleting == false)
                    ball_ball_collision(this, balls[i]);
            }
        collision_counter--;

        //-- collide met muren
        this.collide_with_walls();

         //-- radius movement
        var rfac = 1;
        var video_cancel =  (this.video == undefined || this.video.paused) && (this.video_autoplay == undefined || !this.video_autoplay)
        if (distance(mouse.x, mouse.y, this.x, this.y) <  this.radius)
        {
            cursor = 'pointer';
            rfac = 1.1;
            var nam = name;
            if (name == "home")
                nam = "到#LOAD#GAME";
            if (this.text_t < nam.length && this.show_name && (!device_is_mobile || video_cancel))
                this.text_t += 0.25;
            if (this.pops)
            {
                this.wobble = Math.max(this.wobble, 0.5);
                do_wobbles = false;
            }
        }
        else
        if ((device_is_mobile && video_cancel) || (this.always_show_name && video_cancel))
        {
            if (this.text_t < name.length && this.show_name)
                this.text_t += 0.2;
        }
        else
            this.text_t = 0;
        
        if (this.deleting)
            this.text_t = 0;
        
        if (this.dragged)
            rfac = 0.95;
        
        this.radius_target = this.radius_normal * (1 - this.enhanced) + this.radius_enhanced * this.enhanced;
        this.wobble *= 0.93;
        this.wobblerot += 8 * this.wobble + 6;
        this.radius_target += Math.cos(3.14159 * this.wobblerot / 180) * this.wobble * 0.05;

        if (this.deleting)
        {
            this.rspd -= 0.001;
            this.radius_target = 0;
        }
        this.rspd += (this.radius_target * rfac - this.radius) * (0.025 + this.dragged * 0.1 + this.deleting * 0.1);
        this.rspd *= 0.6 + this.enhanced * 0.1;
        this.radius += this.rspd;

        //- clamp radius
        if (this.radius < 0)//this.radius_target * 0.5)
        {
            if (this.deleting)
                this.destroy();
            this.radius = 0;//this.radius_target * 0.5;
        }

    }
    this.loop = function(){
        this.sprites.forEach(sprite => {
            sprite.update();
        });
    }

    this.draw = function()
    {
        ctx.save();
        var xx = this.x * scale;
        var yy = this.y * scale;
        var rr = this.radius * scale;
        ctx.beginPath();
        ctx.arc(xx, yy, rr, 0, Math.PI*2, true); 
        ctx.closePath();
        ctx.clip();
        // 绘制正方形裁剪区域
        // ctx.beginPath();
        // ctx.rect(xx - rr, yy - rr, rr * 2, rr * 2); 
        // ctx.closePath();
        // ctx.clip();

        // if (this.name == "link" || (this.image == undefined && (this.video==undefined || !this.video_ready)))
        // {
        //     ctx.fillStyle = this.color;
        //     ctx.fillRect(xx - rr, yy - rr, rr * 2, rr * 2);
        // }

        if (this.name == "link" || (this.image == undefined && (this.video==undefined || !this.video_ready)))
        {
            ctx.save(); // 保存当前绘图状态
            ctx.globalAlpha = 0.2; // 设置透明度为50%
            ctx.fillStyle = this.color;
            ctx.fillRect(xx - rr, yy - rr, rr * 2, rr * 2);
            ctx.restore(); // 恢复之前的绘图状态
        }

        // draw the image
        // rr = (this.radius_normal * this.clipping + this.radius * (1 - this.clipping)) * scale * (1 + this.clipping);
        // if (this.image != undefined)
        // {
        //     ctx.drawImage(this.image, xx - rr, yy - rr, rr * 2, rr * 2);
        // }
        // 绘制所有帧的堆叠效果
        
        if (this.sprites.length > 0) {
            // 计算缩放比例，使精灵适应正方形
            const baseScale = (rr * 2) / this.sprites[0].frameWidth / 1.4;
            
            // 临时关闭 clip 以允许 Sprite 绘制
            ctx.restore();
            
            // 绘制所有帧，每帧有轻微偏移

            for (let i = 0; i < this.sprites.length; i++) {
                const sprite = this.sprites[i];
                sprite.position = { 
                    x: xx, 
                    y: yy + 16 - i * this.frameOffset * 2
                };
                sprite.scale = baseScale;
                sprite.draw(ctx);
            }

            ctx.save();
            
            // 重新应用 clip
            ctx.beginPath();
            ctx.rect(xx - rr, yy - rr, rr * 2, rr * 2); 
            ctx.closePath();
            ctx.clip();
        }
        //-- draw video
        if (this.video != undefined && this.video_ready)
        {
            var s = this.video.videoWidth / this.video.videoHeight;
            ctx.drawImage(this.video, xx - rr * s, yy - rr, rr * 2 * s, rr * 2);
        }

        ctx.restore();

        // draw name
        if (this.text_t > 0)
        {
            var size = (this.radius * 1 + this.radius_normal * 0) * this.text_scale * scale * 0.5;
            ctx.font = size + "px VonwaonBitmap";
            ctx.textAlign = "center";
            ctx.textBaseline="middle"; 

            var nam = name;
            if (name == "home")
                nam = "到#LOAD#GAME";
            var str = nam.replace(/_/g, ' ');
            str = str.substr(0, this.text_t);
            str = str.split('#');
            var yplus = -(str.length - 1) * size / 2;
            for (var i = 0; i < str.length; i++)
            {
                ctx.fillStyle = "#000000";
                ctx.fillText(str[i], xx, yy + yplus);
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(str[i], xx - 4, yy - 2 + yplus);
                yplus += size;
            }
        }

        // draw text

        rr = this.radius * scale;
        if (this.text != "" || this.title != "")
        {
            var size = (this.radius_normal * this.clipping + this.radius * (1 - this.clipping)) * this.text_scale * scale * 0.165;
            ctx.textAlign = "center";
            ctx.textBaseline= "top"; 
            ctx.fillStyle = this.text_color;

            var yplus = size / this.text_scale;
            if (this.title != "")
            {
                var title_lines = this.title.split('#');
                ctx.font = size * 2 + "px Vonwaon";
                for (var i = 0; i < title_lines.length; i++)
                {
                    ctx.fillText(title_lines[i], xx, yy - rr + yplus);
                    yplus += size * 1.5;
                }
                yplus += size * 0.75;
            }
            ctx.font = size + "px Vonwaon";
            for (var i = 0; i < this.text.length; i++)
            {
                ctx.fillText(this.text[i], xx, yy - rr + yplus);
                yplus += size;
            }
        }

        // draw link image
        if (this.url != "" && link_image != undefined)
        {
            ctx.drawImage(link_image, xx+rr * 0.3, yy - rr, rr * 0.6, rr * 0.6);
        }
        // draw play image
        if (this.video != undefined && play_image != undefined && this.video.paused)
        {
            ctx.drawImage(play_image, xx+rr * 0.3, yy - rr, rr * 0.6, rr * 0.6);
        }
        // draw paid image
        if (this.paid)
        {
            ctx.drawImage(paid_image, xx+rr * 0.3, yy - rr, rr * 0.6, rr * 0.6);
        }
    }

    this.delete = function()
    {
        this.deleting = true;
        if (this.video != undefined)// && !this.video_autoplay)
            this.video.pause();
    }

    this.destroy = function()
    {
        balls.splice(this.ball_index, 1);
        ctx.clearRect((this.x - this.radius) * scale - 1, (this.y - this.radius) * scale - 1, this.radius * scale * 2 + 2, this.radius * scale * 2 + 2);
        ball_num--;
    }

    this.pop = function()
    {
        if (current_layer == 0)
            $("#title").show();
        else
            $("#title").hide();
        current_layer++;
        document.body.style.background = this.color;
        current_background_color = this.color;
        current_bar_color = this.bar_color;

        // maak middelste
        var child = create_ball(this.children, 0, this.layer + 1, this.x, this.y, false);
        // maak rest
        var dr = 0;
        for (var i = 1; i < this.children.length; i++)
        {
            var b = this.children[i];
            var xx = this.x + (this.radius + 1) * Math.cos(dr) * 0.05;
            var yy = this.y + (this.radius + 1) * Math.sin(dr) * 0.05;
            var child = create_ball(this.children, i, this.layer + 1, xx, yy, false);
            dr += 2 * 3.1415 / (this.children.length - 1);
        }
        this.destroy();
        selection = -1;
    }

    this.pop_up = function()
    {
        if (selection != -1)
        {
            selection.enhanced = false;
            RemoveState();
        }
        selection = this;
        if (selection.video != undefined)
            selection.video.play();
        this.enhanced = true;
    }

    this.tapped = function(set_url)
    {
        var set = selection != this;
        if (!set && this.video != undefined && this.video_ready && !this.video_autoplay)
        {
            if (this.video.paused)
                this.video.play();
            else
                this.video.pause();
        }

        if (this.url != "")
        {
            window.location.href = this.url;
            $("#title").hide();
            $("#footer").hide();
            linked = true;
            for (var i = 0; i < ball_num; i++)
                balls[i].delete();
            set = false;
        }
        if (set_url && set)
            PushState(this.name, false, !this.pops);
        
        if (!this.pops && set)
            this.pop_up();
        else
        if (set)
        {
            if (set_url)
                bar_height_spd = 10;
            this.pop();
        }
    }

    this.start_drag = function()
    {
        tapped_timer = 12;
        this.dragged = true;
        this.xoff = this.x - mouse.x; 
        this.yoff = this.y - mouse.y; 
    }

    // 修改 collide_with_walls 方法中的圆形碰撞检测为矩形碰撞检测
    this.collide_with_walls = function() {    
        var bounce_f = 0.2;
        var halfSize = this.radius;
        
        // 左边界碰撞
        if (this.x - halfSize < 0) {
            if (this.hspd < 0) {
                this.hspd *= -bounce_f;
            }
            this.x = halfSize;
        }
        
        // 上边界碰撞
        if (this.y - halfSize < bar_height / scale) {
            if (this.vspd < 0) {
                this.vspd *= -bounce_f;
            }
            this.y = halfSize + bar_height / scale;
        }
        
        // 右边界碰撞
        if (this.x + halfSize > canvas.width / scale) {
            if (this.hspd > 0) {
                this.hspd *= -bounce_f;
            }
            this.x = canvas.width / scale - halfSize;
        }
        
        // 下边界碰撞
        if (this.y + halfSize > (canvas.height - footer_height) / scale) {
            if (this.vspd > 0) {
                this.vspd *= -bounce_f;
            }
            this.y = (canvas.height - footer_height) / scale - halfSize;
        }

        // 拖动释放逻辑保持不变
        if (this.dragged && ((this.y - this.radius_targ * 0.66 < 0) ||
                            (this.x - this.radius_targ * 0.66 < 0) ||
                            (this.x + this.radius_targ * 0.66 > canvas.width / scale))) {
            dragging = -1;
            this.dragged = false;
        }
    }

    // this.collide_with_walls = function()
    // {    
    //     var text_scale = 0.03;
        

    //     var bounce_f = 0.2;
    //     //- links
    //     if (this.x - this.radius < 0)
    //     {
    //         if (this.hspd < 0)
    //         {
    //             this.hspd *= -bounce_f;
    //             //this.rspd -= this.hspd;
    //         }
    //         this.x = this.radius;
    //     }
    //         //- top
    //     if (this.y - this.radius < bar_height / scale)
    //     {
    //         if (this.vspd < 0)
    //         {
    //             this.vspd *= -bounce_f;
    //             //this.rspd -= this.vspd * 0.5;
    //         }
    //         this.y = this.radius + bar_height / scale;
    //     }
    //         //- rechts
    //     if (this.x + this.radius > canvas.width / scale)
    //     {
    //         if (this.hspd > 0)
    //         {
    //             this.hspd *= -bounce_f;
    //             //this.rspd += this.hspd * 0.5;
    //         }
    //         this.x = canvas.width / scale - this.radius;
    //     }
    //         //- bottom
    //     if (this.y + this.radius > (canvas.height - footer_height) / scale)
    //     {
    //         if (this.vspd > 0)
    //         {
    //             this.vspd *= -bounce_f;
    //             //this.rspd += this.vspd * 0.5;
    //         }
    //         this.y = (canvas.height - footer_height) / scale - this.radius;
    //     }

    //         //- laat los met draggen
    //     if (this.dragged && ((this.y - this.radius_targ * 0.66 < 0) ||
    //                          (this.x - this.radius_targ * 0.66 < 0) ||
    //                         (this.x + this.radius_targ * 0.66 > canvas.width / scale)))
    //     {
    //         dragging = -1;
    //         this.dragged = false;
    //     }
    // }
}