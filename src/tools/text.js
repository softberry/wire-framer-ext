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
        "type": "text",
        "draggable": "XY",
        "resizable": true,
        "properties": {
            "top": 0, "width": 0, "height": 0, "backgroundColor": "transparent", "borderColor": "#ff0000", "opacity": 1
        },
        "button": {
            "html": "<tool-icon style='width: 60%; height: 45%; font-size:20px; line-height: 60%;'>T</tool-icon>",
            "tooltip": "Create a Textfield",
            "Name": "Textbox",

            "onclick": function () {
                // custom click event
            }
        },
        "target": {
            "content": function (color) {
                var editableText = $('<div/>')
                    .attr('contentEditable', 'true')
                    .html('Type here')
                    .addClass('editable');

                setTimeout(function () {
                    editableText.focus().select();
                }, 200);
                return editableText;
            }
        }
    };
    wireframer.addTool(line);
})();