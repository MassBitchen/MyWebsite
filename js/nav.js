//-- site navigation
var new_page = "";
function in_page(str)
{
    str = str.replace('#', '');
    return $.inArray(str, new_page.split('-')) != -1;
}

function PushState(page, reset, replace)
{
    if (new_page != "")
        new_page += "-";
    page = page.replace('#', '');
    new_page += page;
    if (reset)
        new_page = page;
    var _url = "#"+new_page;// ~5663172/
    if (replace)
        window.history.replaceState(page, page, _url);
    else
        window.history.pushState(page, page, _url);
}

// removes one hash layer (allegedly)
function RemoveState()
{
    var path = new_page.split('-');
    var new_path = "";
    for (var i = 0 ; i < path.length - 1; i++)
    {
        if (i > 0)
            new_path += "-";
        new_path+=path[i]
    }
    PushState(new_path, true, true)
}

var ball_popped_index = -1;
var current_layer = 0;
function Home()
{
    var aspect = canvas.width / canvas.height;
    if (current_layer > 1)
    {
        document.body.style.background = "#FFE8B5";
        //-- restore popped balls
        for (var i = 0; i < balls_data.length; i++)
        {
            var xx = balls_data[i].x;
            var yy = (balls_data[i].y) * 0.8 + 0.2;
            if (canvas.width > canvas.height)
            {
                xx = balls_data[i].y / aspect + (aspect - 1) / 4;
                yy = (balls_data[i].x) * 0.8 + 0.2;
            }
            create_ball(balls_data, i, 0, xx, yy, true);
            //create_ball(balls_data, i, 0, Math.random(), Math.random(), true);
        }
        //-- reset layer
        current_layer = 0;
        $("#title").show();
        if (!device_is_mobile)
            $("#footer").show();
    }
}

function Back()
{
    bar_height_spd = -10;
    RemoveState();
    Home();
}