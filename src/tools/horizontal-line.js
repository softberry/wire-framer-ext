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
        "type": "hline",
        "draggable": "Y",
        "resizable": false,
        "properties": [
            "top", "width", "height", "background-color", "opacity"
        ],
        "button": {
            "html": "&mdash;",
            "tooltip": "Draw a Line",
            "Name": "Horizontal line",

            "onclick": function () {
                console.log('additional click events');
            }
        },
        "target":{
            "content":function(color){
                return $('<div/>')
                    .css({
                        'background-color':'#' + color,
                        'height':'100%'
                    });
            }
        }
    };
    ruler.addTool(line);
})();