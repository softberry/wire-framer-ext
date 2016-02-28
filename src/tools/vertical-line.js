/**
 * Created by emresakarya on 06.01.16.
 */
(function () {
    var line = {
        "type": "vline",
        "draggable": "X",
        "resizable": false,
        "properties": {
                "left":0, "width":0,  "backgroundColor":"#000000", "opacity":1
            },
        "button": {
            "html": "<tool-icon style='width:1px; height: 60%; background-color: white;'></tool-icon>",
            "tooltip": "Draw a Horizontal Line",
            "Name": "Horizontal line",

            "onclick": function () {
                // custom click event
            }
        },
        "target":{
            "content":function(){}
        }
    };
    wireframer.addTool(line);
})();