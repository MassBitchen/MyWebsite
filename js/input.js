//-- input
var mouse = {x: 0, y: 0, hspd: 0, vspd: 0, down: false};
var dragging = -1;
var tapped_timer = 0;

function mouse_down(x, y)
{
    mouse.x = x;
    mouse.y = y;
    mouse.down = true;

    for (var i = 0; i<ball_num; i++)
    {
        if (distance(mouse.x, mouse.y, balls[i].x, balls[i].y) < balls[i].radius)
        {
            balls[i].start_drag();
            dragging = balls[i];
            break;
        }
    }
    //- stop enhancing
    if (dragging != selection && selection != -1)
    {
        selection.enhanced = false;
        RemoveState();
        //if (selection.parent != -1)
        //    selection.parent.enhanced = false;
        //console.log("Yooo, selection reset boyz.")
        selection = -1;
    }
    if (dragging == -1 && mouse.x < canvas.height * 0.15 / scale && mouse.y < canvas.height * 0.08/ scale)
        Back();
}

function mouse_up()
{
    mouse.down = false;
    if (dragging != -1)
    {
        if (tapped_timer > 0)
            dragging.tapped(dragging.set_page_url);
        dragging.dragged = false;
        dragging = -1;
    }
}

//-- mouse input
$('html').on("mousedown", function(evt) {  
    if (evt.clientY < canvas.height - footer_height)
    {
        evt.preventDefault();   
        mouse_down(evt.clientX / scale, evt.clientY / scale);
    }
});
$('html').on("mouseup", function(evt) {  
    evt.preventDefault();   
    mouse_up();
});

$('html').on("mousemove", function(evt) {
    evt.preventDefault();
    mouse.x = evt.clientX / scale;
    mouse.y = evt.clientY / scale;
});

// touch input
document.addEventListener("touchmove", function(evt) {
    var ts = evt.touches[0];
    evt.preventDefault();
    mouse.x = ts.clientX / scale;
    mouse.y = ts.clientY / scale;
}, {passive: false});

document.addEventListener("touchstart", function(evt) {
    var ts = evt.touches[0];
    if (ts.clientY < canvas.height - footer_height)
    {
        evt.preventDefault();   
    }
    mouse_down(ts.clientX / scale, ts.clientY / scale); 
}, {passive: false});
document.addEventListener("touchend", function(evt) {
    var ts = evt.touches[0];
    if (mouse.y < (canvas.height - footer_height) / scale)
        evt.preventDefault();   
    mouse.x = -100;
    mouse.y = -100;
    mouse_up();
}, {passive: false});