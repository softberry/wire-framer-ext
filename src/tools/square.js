/**
 * Created by emresakarya on 06.01.16.
 */
(function () {
    /**
     *    RULER.addTool = function(tool){
        var button = $("<button/>").
            html(tool.button.text)
            .attr({
                'title' : tool.tooltip
            });
        resizableItems[tool.type] = tool.resizable;
        button.on('click',tool.button.onclick);
    };

     */
    var square = {
        "type": "square",
        "draggable": "XY",
        "resizable": true,
        "properties": {
            "top":0, "width":0, "height":0, "backgroundColor":"transparent","borderColor":"#ff0000", "opacity":1
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