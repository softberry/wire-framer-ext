/**
 * Created by es on 28.12.2015.
 */
;
(function ($) {
    'use strict';

    var elements = {
            /*
             All DOM Elements used as containers.
             Shorthand variables for re-usability
             */

            workspace: {},
            panel: {},
            toolbox: {},
            propsbox: {},
            hRuler: {},
            vRuler: {},
            tools: {},
            layersBox: {},
            layers: {},
            items: {},
            propsTable: {}

        },
        uniqueID = 0, /* each element like a line or a square has a uniqueID.
     Automatically increased before a new Item inserted */
        selectedItem = null, // shortcut to current selected Item on the stage
        resizableItems = {},
        draggableItems = {},
        actions = {
            // Repeated functions served to RULER object
            'highestIndex': function () {
                var i = 999, zIndex;
                $('*').each(function () {
                    zIndex = Number($(this).css('zIndex'));

                    if (zIndex > i) i = zIndex;

                });
                return i;
            },
            'createElementOnSTage': {},
            'newItem': function (type) {
                /*
                 * return a new DIV element,
                 * with default properties according to requested type
                 * */


                uniqueID++; // Increase ID
                var label = $('<div/>').addClass('label').html(''),                         //create label for the element
                    color = Math.floor(Math.random() * 16777215).toString(16);  // set a rondom color

                color += String('000000').slice(color.length); // fill unsufficent hexCode with 000000
                var el = $('<' + type + '/>'); //prepare and return requested type of item
                el.append(actions.createElementOnSTage[type](color));

                el.attr({id: 'item-' + uniqueID, 'data-type': type, 'data-color': color})
                    .addClass('item ' + type)
                    .append(label);
                if (resizableItems[type]) {
                    //if an Item Resizable prepare its resizer handles.
                    actions.resizable.call(el)
                }
                return el;
            },
            'drawGuide': function (pos) {

                if (!elements.workspace.hasClass('draw')) return;
                elements.panel.css({
                    opacity: .1
                });
                var type = elements.workspace.data('type'),
                    el = $('<guide/>')
                        .addClass(type);
                elements.workspace.append(el);
                el
                    .attr({"data-left": pos.x, "data-top": pos.y})
                    .css({left: pos.x, top: pos.y});

            },
            'updateGuide': function (pos) {

                var guide = $('guide'),
                    l = guide.attr('data-left'),
                    t = guide.attr('data-top'),
                    w = pos.x - l,
                    h = pos.y - t,
                    type = elements.workspace.data('type');
                /**
                 * update guide position on the stage according to its type
                 */
                switch (type) {
                    case 'hline':
                        $(guide).css({top: pos.y, left: 0});
                        break;
                    case 'vline':
                        guide.css({left: pos.x, top: 0});
                        break;
                    case 'square':
                    case 'circle':
                    case 'text' :
                        //el.css({left: pos.x - el.width() / 2, top: pos.y - el.height() / 2});
                        guide.css({
                            width: Math.abs(w),
                            height: Math.abs(h),
                            left: pos.x < l ? pos.x : l,
                            top: pos.y < t ? pos.y : t
                        });
                        break;
                    default:
                }

            },
            'drawAt': function (pos) {
                var self = this,
                    guide = $('guide');

                if (!elements.workspace.hasClass('draw')) return;
                var type = elements.workspace.data('type'),
                    el = actions.newItem(type);
                elements.workspace.append(el);
                self.addLayer(el);
                actions.draggable.call(el);
                switch (type) {
                    case 'hline':
                        el.css({top: pos.y});
                        break;
                    case 'vline':
                        el.css({left: pos.x});
                        break;
                    case 'square':
                    case 'circle':
                    case 'text' :
                        //el.css({left: pos.x - el.width() / 2, top: pos.y - el.height() / 2});
                        el.css({
                            left: guide.css('left'),
                            top: guide.css('top'),
                            width: guide.css('width'),
                            height: guide.css('height')
                        });
                        break;
                    default:
                }
                guide.remove();
                elements.panel.css({
                    opacity: 1
                });
            },
            'updateProperties': function () {
                /*
                 Get current position and size of the
                 Selected and update input values in
                 properties table
                 */

                if (selectedItem == null) return;
                var pos = selectedItem.position();
                elements.propsTable.xpos.val(pos.left);
                elements.propsTable.ypos.val(pos.top);
                elements.propsTable.width.val(selectedItem.width());
                elements.propsTable.height.val(selectedItem.height());
                if (resizableItems[selectedItem.data('type')]) {
                    /* update positions of handels*/
                    var w = selectedItem.width(), // get container width
                        h = selectedItem.height(),
                        id = selectedItem.attr('id'); // get container height
                    /* prepare handles, set type and class attributes as well as initial positions*/
                    $('#' + id + ' .rs-n').css({left: w / 2 - 5, top: -5}),
                        $('#' + id + ' .rs-w').css({left: -5, top: h / 2 - 5}),
                        $('#' + id + ' .rs-s').css({left: w / 2 - 5, top: h - 5}),
                        $('#' + id + ' .rs-e').css({left: w - 5, top: h / 2 - 5});
                }
            },
            'selectTarget': function (target) {
                if (elements.workspace.hasClass('draw')) return;
                selectedItem = $(target);
                /* Set givenID as selected Item */
                actions.updateProperties();
                /* update properties table*/
                elements.propsbox.show();
                /* show properties table*/
                if (resizableItems[selectedItem.data('type')]) {
                    selectedItem.addClass('resizable');

                    var w = selectedItem.width(), // get container width
                        h = selectedItem.height(),
                        id = selectedItem.attr('id'); // get container height
                    /* prepare handles, set type and class attributes as well as initial positions*/
                    $('#' + id + ' .rs-n').css({left: w / 2 - 5, top: -5}),
                        $('#' + id + ' .rs-w').css({left: -5, top: h / 2 - 5}),
                        $('#' + id + ' .rs-s').css({left: w / 2 - 5, top: h - 5}),
                        $('#' + id + ' .rs-e').css({left: w - 5, top: h / 2 - 5});

                }


            },
            'deSelectTarget': function (target) {
                if (selectedItem === null) return;
                selectedItem.removeClass('resizable');
                selectedItem = null;
                /* de-select item*/
                elements.propsbox.hide();
                /*hide Properties table*/

            },
            'draggable': function () {
                /* Enable element to be draggable on the stage

                 */

                var self = this;
                $('.draggable').removeClass('draggable');
                function dragStart() {
                    // if draw pen is active do not drag any element on workspace
                    if (elements.workspace.hasClass('draw')) return;
                    // draggable element on mousedown function
                    event.stopPropagation();
                    var self = $(this),
                        pos = {
                            x: event.pageX,
                            y: event.pageY
                        };
                    self.addClass('draggable')
                        .attr({
                            'data-offset-x': self.position().left - pos.x,
                            'data-offset-y': self.position().top - pos.y
                        });
                    $(window).on('mousemove', drag);
                    $(window).one('mouseup', dragEnd);
                };
                function drag() {
                    // dragging Function

                    var item = $('.draggable'),
                        type = item.data('type'),
                        pos = {
                            x: event.pageX,
                            y: event.pageY,
                            offsetX: Number(item.data('offset-x')),
                            offsetY: Number(item.data('offset-y'))
                        }, x, y, handleX, handleY, itemW, itemH;
                    if (pos.x < 0 || pos.y < 0) return dragEnd(event);

                    switch (type) {
                        case 'vline':
                            self.css({left: pos.x});
                            self.find('.label').html(pos.x);
                            break;
                        case 'hline':
                            self.css({top: pos.y});
                            self.find('.label').html(pos.y);
                            break;
                        case 'square':
                        case 'circle':
                        case 'text':
                            x = pos.x + pos.offsetX;
                            y = pos.y + pos.offsetY;
                            self.css({top: y, left: x});
                            self.find('.label').html(x + ', ' + y);
                            break;
                        case 'handle-n':
                            handleY = pos.y - selectedItem.position().top + 5,
                                itemH = selectedItem.height() - handleY;
                            if (itemH < 11) return;
                            selectedItem.css({
                                top: pos.y + 5,
                                height: itemH
                            });
                            break;
                        case 'handle-w':
                            handleX = pos.x - selectedItem.position().left + 5,
                                itemW = selectedItem.width() - handleX;
                            if (itemW < 11) return;
                            selectedItem.css({
                                left: pos.x + 5,
                                width: itemW
                            });
                            break;
                        case 'handle-s':
                            handleY = pos.y - selectedItem.position().top ,
                                itemH = handleY + 5;
                            if (itemH < 11) return;
                            selectedItem.css({
                                height: itemH
                            });

                            break;
                        case 'handle-e':
                            handleX = pos.x - selectedItem.position().left ,
                                itemW = handleX + 5;

                            if (itemW < 11) return;
                            selectedItem.css({
                                width: itemW
                            });


                            break;
                        default:
                            x = pos.x + pos.offsetX;
                            y = pos.y + pos.offsetY;
                            self.css({top: y, left: x});

                    }

                    actions.updateProperties();
                }

                function dragEnd() {
                    // Disable draggabilty function
                    $('.draggable').removeClass('draggable');
                    $(window).off('mousemove', drag);

                }

                $(self).on('mousedown', dragStart);

            },
            'moveOnX': function () {
                // Change X position of an element allow negative numbers too
                //var val = elements.propsTable.xpos.val();
                //val = String(val).replace(/[^0-9\-]/g, '');
                //elements.propsTable.xpos.val(val);
                // $(selectedItem).css({left: val + 'px'});

                /**
                 * use arrow events assigned to window element,
                 * when a property (x,y,w,h) changed
                 *
                 */

        if(event.which == 37 || event.which == 39 ) {
            event.stopPropagation();
        }
                /* convert left-right arrows to up-down arrows */
                if(event.which == 38 || event.which == 40 ) {
                    event.stopPropagation();
                   // console.log(event.which);
                   var e= $.Event('keydown',{which:event.which==38?39:37}) ;
                    $(window).trigger(e);
                }


            },
            'moveOnY': function () {
                // Change Y position of an element  allow negative numbers too
               // var val = elements.propsTable.ypos.val();
                //val = String(val).replace(/[^0-9\-]/g, '');
                //elements.propsTable.ypos.val(val);
                //$(selectedItem).css({top: val + 'px'});
                if(event.which == 37 || event.which == 39 ) {
                    // avoid moves on X-axis
                    event.stopPropagation();
                }

            },
            'resizeW': function () {
                // Change Width  of an element DONOT allow negative numbers
               // var val = elements.propsTable.width.val();
               // val = String(val).replace(/[^0-9]/g, '');
               // elements.propsTable.width.val(val);
              //  $(selectedItem).css({width: val + 'px'});
              //  actions.updateProperties();
                if(event.which == 37 || event.which == 39 ) {
                    event.stopPropagation();
                }
                if(event.which == 38 || event.which == 40 ) {
                    // avoid moves on X and Y-axis
                    // use up-down key to resize width
                    event.stopPropagation();
                    var step = event.shiftKey ? 10 : 1,
                        dir =(event.which ==38) ? 1: -1,
                        w = $(selectedItem).width() ;
                    $(selectedItem).width( w + step * dir );
                    actions.updateProperties();
                }
            },
            'resizeH': function () {
                // Change height of an element DONOT allow negative numbers
              //  var val = elements.propsTable.height.val();
              //  val = String(val).replace(/[^0-9]/g, '');
              //  elements.propsTable.height.val(val);
              //  $(selectedItem).css({height: val + 'px'});
              //  actions.updateProperties();
                if(event.which == 37 || event.which == 39 ) {
                    event.stopPropagation();
                }
                if(event.which == 38 || event.which == 40 ) {
                    // avoid moves on X and Y-axis
                    // use up-down key to resize width
                    event.stopPropagation();
                    var step = event.shiftKey ? 10 : 1,
                        dir =(event.which ==38) ? 1: -1,
                        w = $(selectedItem).height() ;
                    $(selectedItem).height( w + step * dir );
                    actions.updateProperties();
                }
            },
            'keySetVal': function (cb) {
                // change Item X,Y,W,H properties with up-down keys
                var self = $(this),
                    step = event.shiftKey ? 10 : 1;

                switch (event.which) {
                    case 40: //arrowDown
                        event.preventDefault();
                        self.val(Number(self.val()) - step);
                        cb();
                        break;
                    case 38: // arrowUp
                        event.preventDefault();
                        self.val(Number(self.val()) + step);
                        cb();
                        break;

                    default:
                }


            },
            'resizable': function () {
                var self = this;

                var w = self.width(), // get container width
                    h = self.height(), // get container height
                /* prepare handles, set type and class attributes as well as initial positions*/
                    up = $('<handle/>').addClass('rs-n').data('type', 'handle-n'),
                    right = $('<handle/>').addClass('rs-w').data('type', 'handle-w'),
                    bottom = $('<handle/>').addClass('rs-s').data('type', 'handle-s'),
                    left = $('<handle/>').addClass('rs-e').data('type', 'handle-e');
                actions.draggable.call(up);
                actions.draggable.call(right);
                actions.draggable.call(bottom);
                actions.draggable.call(left);
                self.append(up);
                self.append(right);
                self.append(bottom);
                self.append(left);
            },
            'stickPanel': function (stickTo) {
                if ($(this).hasClass('selected')) return;

                $('sticky').removeClass('selected');

                $(event.target).addClass('selected');
                var w, h, l, t, r, b;
                if (stickTo == 'left' || stickTo == 'right') {
                    w = 200;
                    h = '100%';
                }
                if (stickTo == 'top' || stickTo == 'bottom') {
                    w = '100%';
                    h = 200;
                }
                if (stickTo == 'right') {
                    r = 0;
                    l = 'auto';
                } else {
                    r = 'auto';
                    l = 0;
                }
                if (stickTo == 'bottom') {
                    b = 0;
                    t = 'auto';
                } else {
                    b = 'auto';
                    t = 0;
                }
                elements.panel.css(
                    {
                        width: w,
                        height: h,
                        left: l,
                        top: t,
                        right: r,
                        bottom: b
                    }
                )
            }
        },
        RULER = {};

    RULER.init = function () {
        if ($('chrome-ruler').length == 1) {
            $('chrome-ruler').toggle();
            return;
        }

        var self = this;
        elements.workspace = $('<chrome-ruler/>');
        elements.workspace.attr('id', 'chrome-ruler').css({zIndex: actions.highestIndex()});

        $('body').append(elements.workspace);
        self.preparePanel();
        self._prepareToolBox();
        //  self._addTools();
        self._prepareLayersBox();
        self._preparePropsBox();
        self._assignEvents();
        // actions.draggable.call(elements.toolbox);
        //  actions.draggable.call(elements.layersBox);
        //  actions.draggable.call(elements.propsbox);

        elements.layersBox.hide();

    };
    RULER.preparePanel = function () {
        elements.panel = $('<panel/>')
            .data('type', 'panel');
        var title = $('<title/>');
        title
            .append($('<h1/>').html('Wireframer'))
            .append(
            $('<pin/>').on('click', function () {
                ($(this).hasClass('on')) ?
                    $(this).removeClass('on') :
                    $(this).addClass('on');
            })
        );
        elements.panel.append(title);

        elements.workspace.append(elements.panel);
    };
    RULER._assignEvents = function () {
        var self = this;
        $('.toggle').on('click', function () {
            $(this).parent().next().toggle();
            $(this).hasClass('collapsed') ? $(this).removeClass('collapsed') : $(this).addClass('collapsed');
        });

        elements.propsTable.xpos.on('blur', actions.moveOnX).on('keydown', function () {
           // actions.keySetVal.call(this, actions.moveOnX)
            actions.moveOnX();
        });
        elements.propsTable.ypos.on('blur', actions.moveOnY).on('keydown', function () {
           // actions.keySetVal.call(this, actions.moveOnY)
            actions.moveOnY();
        });
        elements.propsTable.width.on('blur', actions.resizeW).on('keydown', function () {
          //  actions.keySetVal.call(this, actions.resizeW)
            actions.resizeW();
        });
        elements.propsTable.height.on('blur', actions.resizeH).on('keydown', function () {
        //    actions.keySetVal.call(this, actions.resizeH)
            actions.resizeH();
        });
        elements.workspace.on('click', function () {
            //   actions.drawAt.call(self, {x: event.pageX, y: event.pageY})
        });
        elements.workspace.on('mousedown', function () {
            //   actions.drawAt.call(self, {x: event.pageX, y: event.pageY})
            actions.drawGuide.call(self, {x: event.pageX, y: event.pageY});
        });
        elements.workspace.on('mousemove', function () {
            //   actions.drawAt.call(self, {x: event.pageX, y: event.pageY})
            actions.updateGuide.call(self, {x: event.pageX, y: event.pageY});
        });
        elements.workspace.on('mouseup', function () {
            actions.drawAt.call(self, {x: event.pageX, y: event.pageY})
        });


        elements.workspace.on('contextmenu', function () {
            // disable context menu
            event.preventDefault();

        })
            .on('mousemove', function () {
                if (event.pageX < 10) {
                    elements.panel.css({'transform': 'translateX(0)'});
                }
            });
        elements.panel.on('mouseleave', function () {
            if ($('panel pin').hasClass('on')) return;
            elements.panel.css({'transform': 'translateX(-100%)'});
        });

        $(window).on('keydown', function () {

            var type = selectedItem != null ? selectedItem.data('type') : '',
                x = selectedItem != null ? selectedItem.position().left :0,
                y = selectedItem != null ? selectedItem.position().top:0;

            console.log(event.which);
            if (event.which == 27) {
                if (selectedItem != null) {
                    //deselect on ESC
                    actions.deSelectTarget();
                }
                if (elements.workspace.hasClass('draw')) {
                    // remove draw-pen on ESC
                    elements.workspace.removeClass('draw');
                }
            }
            if (event.ctrlKey && event.which == 83) {
                event.preventDefault();
                console.log('show save as...');
                /* show save as dialog*/
            }
            if (selectedItem != null && event.which == 40) {
                event.preventDefault();
                if (String(draggableItems[type]).toUpperCase().indexOf('Y') < 0) return;

                event.shiftKey ? y += 5 : y++;
                selectedItem.css({
                    top: y
                });
            }
            if (selectedItem != null && event.which == 38) {

                event.preventDefault();
                if (String(draggableItems[type]).toUpperCase().indexOf('Y') < 0) return;

                event.shiftKey ? y -= 5 : y--;
                selectedItem.css({
                    top: y
                });
            }

            if (selectedItem != null && event.which == 37) {
                event.preventDefault();
                if (String(draggableItems[type]).toUpperCase().indexOf('X') < 0) return;

                event.shiftKey ? x -= 5 : x--;
                selectedItem.css({
                    left: x
                });
            }
            if (selectedItem != null && event.which == 39) {
                event.preventDefault();
                if (String(draggableItems[type]).toUpperCase().indexOf('X') < 0) return;

                event.shiftKey ? x += 5 : x++;
                selectedItem.css({
                    left: x
                });
            }

            actions.updateProperties();

        });
        $(window).on('resize scroll', function () {
            var w = Math.max($(window).width(), $('html').width(), $('body').width()),
                h = Math.max($(window).height(), $('html').height(), $('body').height());
            elements.workspace.css({width: w});
            elements.workspace.css({height: h});
            $('hline').width(w);
            $('vline').height(h);
        });

    };
    RULER._prepareToolBox = function () {
        elements.toolbox = $('<toolbox/>')
            .addClass('toolbox');
        var header = $('<title/>')

            .html('<span>Tools</span><div class="toggle">&lsaquo;</div>');
        elements.tools = $('<tools/>')
        elements.toolbox.append(header);
        elements.toolbox.append(elements.tools);
        elements.panel.append(elements.toolbox);

    };
    RULER.addTool = function (tool) {
        resizableItems[tool.type] = tool.resizable;
        draggableItems[tool.type] = tool.draggable;
        var button = $('<tool-button/>');
        button
            .on('mousedown', function () {
                event.stopPropagation();
                elements.workspace.removeClass('draw').data('type', '');
            })
            .on('click', function () {
                event.stopPropagation();
                elements.workspace.addClass('draw').data('type', tool.type);
            })
            .on('click', tool.button.onclick)
            .html(tool.button.html)
            .attr({
                title: tool.button.tooltip
            });


        actions.createElementOnSTage[tool.type] = tool.target.content;
        elements.tools.append(button);

    };
    RULER._prepareLayersBox = function () {
        elements.layersBox = $('<layers/>')
            .addClass('layers');
        var header = $('<title/>')

            .html('<span>Items</span><div class="toggle">&lsaquo;</div>');

        elements.layers = $('<div/>');
        elements.layersBox.append(header);
        elements.layersBox.append(elements.layers);
        elements.panel.append(elements.layersBox);

    };
    RULER.addLayer = function (el) {
        actions.updateProperties(el);
        el.on('contextmenu', function () {
            event.preventDefault();
        });
        var selectItem = function () {

                var parent = $(this).parent('ul'),
                    targetID = '#' + parent.data('target');
                actions.deSelectTarget(targetID);
                if (parent.hasClass('selected')) {
                    parent.removeClass('selected');
                    return;
                }
                $('.layers ul').removeClass('selected');
                parent.addClass('selected');

                actions.selectTarget(targetID);
            },
            removeItem = function () {
                var parent = $(this).parent('ul'),
                    targetID = '#' + parent.data('target');
                parent.remove();
                $(targetID).remove();
                elements.propsbox.hide();
                if (elements.layers.find('ul').length == 0) elements.layersBox.hide();
            },
            hideItem = function () {
                var parent = $(this).parent('ul'),
                    targetID = '#' + parent.data('target');
                if ($(this).hasClass('off')) {
                    $(this).removeClass('off');
                    $(targetID).show();
                }
                else {
                    $(this).addClass('off');
                    $(targetID).hide();
                }
            };
        var ul = $('<ul/>').attr({'data-target': el.attr('id')}),
            visibility = $('<li/>').addClass('btn visibility').attr({title: 'Hide'}).on('click', hideItem).css({'background-color': '#' + el.data('color')}),
            label = $('<li/>').addClass('label').html(el.data('type')).on('click', selectItem).attr('contenteditable', 'true').on('keydown', function () {
                if (event.which == 13) {
                    event.preventDefault();
                    $(this).blur();
                    return false;
                }
            }),
            remove = $('<li/>').addClass('btn remove').html('&times;').attr({title: 'Remove'}).on('click', removeItem);

        el.on('click', function () {
            var layerLabel = '[data-target=' + $(this).attr('id') + '] li.label';

            $(layerLabel).trigger('click');

        });

        ul.append(visibility);
        ul.append(label);
        ul.append(remove);
        elements.layers.append(ul);
        elements.layersBox.show();
    };
    RULER._preparePropsBox = function () {
        elements.propsbox = $('<props/>')
            .addClass('props');
        var header = $('<title/>')

                .html('<span>Properties</span><div class="toggle">&lsaquo;</div>'),
            table = $('<div/>').html('<props-table>' +
            '<props-tr><props-td colspan="3"></props-td></props-tr>' +
            '<props-tr><props-td>X:</props-td><props-td><input type="text" name="xpos"/></props-td><props-td><input type="range"/></props-td></props-tr>' +
            '<props-tr><props-td>Y:</props-td><props-td><input type="text" name="ypos"/></props-td><props-td><input type="range"/></props-td></props-tr>' +
            '<props-tr><props-td>W:</props-td><props-td><input type="text" name="width"/></props-td><props-td><input type="range"/></props-td></props-tr>' +
            '<props-tr><props-td>H</props-td><props-td><input type="text" name="height"/></props-td><props-td><input type="range"/></props-td></props-tr>' +
            '<props-tr><props-td>Color</props-td><props-td><input type="color" name="border-color" onchange="console.log($(this).val())"/></props-td><props-td><input type="color"/></props-td></props-tr>' +
            '</props-table>');

        elements.propsbox.append(header);
        elements.propsbox.append(table);
        elements.panel.append(elements.propsbox);
        elements.propsTable.xpos = $('.props input[name=xpos]');
        elements.propsTable.ypos = $('.props input[name=ypos]');
        elements.propsTable.width = $('.props input[name=width]');
        elements.propsTable.height = $('.props input[name=height]');
        elements.propsbox.hide();
    };
    window.ruler = RULER;
    RULER.init();
})(Zepto);
/** TODO:
 * 1- set selected item as resizable : done
 * 2- resize with up-down, right-left keys
 * 3- resize with drag-helpers : done
 * 4- Convertable to Canvas
 * 5- Printable
 * 6- extend Properties :
 *  - line style : dotted-dashed
 *  - line-widths
 * 7- Screen-Shot
 * 8- Send as email
 * 9- Additional Tools:
 *  -html form elements : checkbox,radio,input etc....
 *  -screenshot
 */
