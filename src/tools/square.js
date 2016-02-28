/**
 * Created by emresakarya on 06.01.16.
 */
(function () {

    var square = {
        "type": "square",
        "draggable": "XY",
        "resizable": true,
        "properties": {
            "left":0,"top":0, "width":0, "height":0, "backgroundColor":"transparent","borderColor":"#ff0000", "opacity":1
        },
        "button": {
            "html": "<tool-icon style='display: inline-block; width: 60%; height:40%; border:1px solid;'></tool-icon>",
            "tooltip": "Draw a square",
            "Name": "Square",

            "onclick": function () {
                // custom click event
            }
        },
        "target":{
            "content":function(){}
        }
    };
    wireframer.addTool(square);
})();