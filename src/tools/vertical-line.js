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
        "type": "vline",
        "draggable": "X",
        "resizable": false,
        "properties": [
            "top", "width", "height", "background-color", "opacity"
        ],
        "button": {
            "html": "<tool-icon style='width:1px; height: 60%; background-color: white;'></tool-icon>",
            "tooltip": "Draw a Horizontal Line",
            "Name": "Horizontal line",

            "onclick": function () {
                // custom click event
            }
        },
        "target":{
            "content":function(color){
                return $('<div/>')
                    .css({
                        'background-color':'#' + color,
                        'width':'100%',
                        'height':'100%'
                    })
            }
        }
    };
    ruler.addTool(line);
})();