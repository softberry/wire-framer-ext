/**
 * Created by emresakarya on 06.01.16.
 */
(function () {

    var line = {
        "type": "circle",
        "draggable": "XY",
        "resizable": true,
        "properties": [
            "top", "width", "height", "background-color", "opacity"
        ],
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
    ruler.addTool(line);
})();