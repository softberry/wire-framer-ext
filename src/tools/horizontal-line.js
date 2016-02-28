/**
 * Created by emresakarya on 06.01.16.
 */
(function () {
    var line = {
        "type": "hline",
        "draggable": "Y",
        "resizable": false,
        "properties": {
            "top":0, "height":0, "backgroundColor":"#000000", "opacity":1
        },
        "button": {
            "html": "<tool-icon style='width: 60%; height: 1px; background-color: white;'></tool-icon>",
            "tooltip": "Draw a Line",
            "Name": "Horizontal line",

            "onclick": function () {
                // custom click event
            }
        },
        "target": {
            "content": function () {}
        }
    };
    wireframer.addTool(line);
})();