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
    var line = {
        "type": "square",
        "draggable": "XY",
        "resizable": true,
        "properties": [
            "top", "width", "height", "background-color", "opacity"
        ],
        "button": {
            "html": "<span style='display: inline-block; width: 80%; height:40%; border:1px solid;'></span>",
            "tooltip": "Draw a square",
            "Name": "Square",

            "onclick": function () {
                console.log('additional click events');
            }
        },
        "target":{
            "content":function(){}
        }
    };
    ruler.addTool(line);
})();