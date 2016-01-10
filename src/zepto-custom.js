/**
 * Created by emresakarya on 03.01.16.
 */
;(function($){
    $.fn.select = function(){
        var self =this;
        var range = document.createRange();
        range.selectNodeContents(self[0]);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        return self;
    };
})(Zepto);
