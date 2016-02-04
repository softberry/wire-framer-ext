/**
 * Created by emresakarya on 03.01.16.
 */
;
(function ($) {
    $.fn.select = function () {
        var self = this;
        var range = document.createRange();
        range.selectNodeContents(self[0]);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        return self;
    };

})(Zepto);
String.prototype.toHex = function () {

    var self = this,
        hex, regex = /\(([^)]+)\)/,
        rgb = regex.exec(self)[1].split(','),
        red = parseInt(rgb[0]), // skip rgba(
        green = parseInt(rgb[1]), // this is just g
        blue = parseInt(rgb[2]); // parseInt scraps trailing )
    function toHEX(r, g, b) {
        //console.log(r,g,b);
        r = r.toString(16).length ==1 ? r.toString(16)+r.toString(16):r.toString(16);
        g = g.toString(16).length ==1 ? g.toString(16)+g.toString(16):g.toString(16);
        b = b.toString(16).length ==1 ? b.toString(16)+b.toString(16):b.toString(16);

        return "#".concat(r,g,b);
    }
    return toHEX(red,green,blue);
};