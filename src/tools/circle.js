/**
 * Created by emresakarya on 06.01.16.
 */
(function () {

    var circle = {
        "type": "circle",
        "draggable": "XY",
        "resizable": true,
        "properties": {
            "left":0,"top":0, "width":0, "height":0, "backgroundColor":"transparent","borderColor":"#ffff00", "opacity":1
        },
        "button": {
            "html": "<span style='display: inline-block; width: 60%; height:60%; border:1px solid; border-radius: 50%;'></span>",
            "tooltip": "Draw a circle or ellipse",
            "Name": "Circle",

            "onclick": function () {
                // custom click event
            }
        },
        "target":{
            "content":function(){}
        }
    };
    wireframer.addTool(circle);
})();