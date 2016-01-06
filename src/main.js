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
        uniqueID = 0, /* each elements like lines and squares has a uniqueID.
     Automatically increased before a new Item inserted */
        selectedItem = null, // shortcut to current selected Item on the stage
        resizableItems = {},
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
                switch (type) {
                    case 'circle':
                    case 'square': // surfaces has border color only
                        el.css({
                            'border-color': '#' + color,
                            left: elements.workspace.width() / 2,
                            top: elements.workspace.height() / 2
                        });
                        break;
                    case 'text':
                        var editableText = $('<div/>')
                            .attr('contentEditable', 'true')
                            .html('Type here')
                            .addClass('editable');
                        el
                            .css({
                                'border-color': '#' + color,
                                left: elements.workspace.width() / 2,
                                top: elements.workspace.height() / 2
                            })
                            .append(editableText);
                        setTimeout(function(){editableText.focus().select();},200);
                       // el.trigger('click');

                        break;
                    default: // lines has backgroundcolor only
                        el.css({'background-color': '#' + color});
                }

                el.attr({id: 'item-' + uniqueID, 'data-type': type, 'data-color': color})
                    .addClass('item ' + type)
                    .append(label);
                if (resizableItems[type]) {
                    //if an Item Resizable prepare its resizer handles.
                    actions.resizable.call(el)
                }
                return el;
            },
            'drawAt':function(pos){
                var self=this;

                    if(!elements.workspace.hasClass('draw')) return;
                var  type =elements.workspace.data('type'),
                    el = actions.newItem(type);
                elements.workspace.append(el);
                self.addLayer(el);
                actions.draggable.call(el);
                switch(type){
                    case 'hline':
                        el.css({top:pos.y});
                        break;
                    case 'vline':
                        el.css({left:pos.x});
                        break;
                    case 'square':
                    case 'circle':
                    case 'text' :
                        el.css({left: pos.x - el.width() / 2 , top:pos.y - el.height()/2});
                        break;
                    default:
                }
                elements.workspace.removeClass('draw');

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
                var val = elements.propsTable.xpos.val();
                val = String(val).replace(/[^0-9\-]/g, '');
                elements.propsTable.xpos.val(val);
                $(selectedItem).css({left: val + 'px'});
            },
            'moveOnY': function () {
                // Change Y position of an element  allow negative numbers too
                var val = elements.propsTable.ypos.val();
                val = String(val).replace(/[^0-9\-]/g, '');
                elements.propsTable.ypos.val(val);
                $(selectedItem).css({top: val + 'px'});
            },
            'resizeW': function () {
                // Change Width  of an element DONOT allow negative numbers
                var val = elements.propsTable.width.val();
                val = String(val).replace(/[^0-9]/g, '');
                elements.propsTable.width.val(val);
                $(selectedItem).css({width: val + 'px'});
                actions.updateProperties();
            },
            'resizeH': function () {
                // Change height of an element DONOT allow negative numbers
                var val = elements.propsTable.height.val();
                val = String(val).replace(/[^0-9]/g, '');
                elements.propsTable.height.val(val);
                $(selectedItem).css({height: val + 'px'});
                actions.updateProperties();
            },
            'keySetVal': function (cb) {
                // change Item X,Y,W,H properties with up-down keys
                var self = $(this),
                    step = event.shiftKey ? 10 : 1;

                switch (event.which) {
                    case 40: //keyDown
                        event.preventDefault();
                        self.val(Number(self.val()) - step);
                        cb();
                        break;
                    case 38: // keyUp
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
        console.log('create Workspace. Body : ', $('body'));
        $('body').append(elements.workspace);
        self._prepareToolBox();
        self._addTools();
        self._prepareLayersBox();
        self._preparePropsBox();
        self._assignEvents();
        actions.draggable.call(elements.toolbox);
        actions.draggable.call(elements.layersBox);
        actions.draggable.call(elements.propsbox);

        elements.layersBox.hide();

    };
    RULER._assignEvents = function () {
        var self=this;
        $('.toggle').on('click', function () {
            $(this).parent().next().toggle();
            $(this).hasClass('collapsed') ? $(this).removeClass('collapsed') : $(this).addClass('collapsed');
        });

        elements.propsTable.xpos.on('blur', actions.moveOnX).on('keydown', function () {
            actions.keySetVal.call(this, actions.moveOnX)
        });
        elements.propsTable.ypos.on('blur', actions.moveOnY).on('keydown', function () {
            actions.keySetVal.call(this, actions.moveOnY)
        });
        elements.propsTable.width.on('blur', actions.resizeW).on('keydown', function () {
            actions.keySetVal.call(this, actions.resizeW)
        });
        elements.propsTable.height.on('blur', actions.resizeH).on('keydown', function () {
            actions.keySetVal.call(this, actions.resizeH)
        });
        elements.workspace.on('click',function(){actions.drawAt.call(self,{x:event.pageX,y:event.pageY})});
        $('chrome-ruler').on('contextmenu', function () {
            // disable context menu
            event.preventDefault();

        });
        $(window).on('keyup', function () {
            if (selectedItem != null && event.which == 27) {
                //deselect on ESC
                actions.deSelectTarget();
            }
            if(event.ctrlKey && event.which == 83){
                event.preventDefault();
            /* show save as dialog*/
            };

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
        elements.workspace.append(elements.toolbox);

    };
    RULER._toolHorizontalLine = function () {
        var self = this,
            button = $('<button/>');
        resizableItems.hline = false; // Register As not resizable
        return button.on('click', function () {
            event.stopPropagation();
            elements.workspace.addClass('draw').data('type','hline');
           })
            .html('&mdash;').attr({
                title: 'Draw a horizontal line'
            });
    };
    RULER._toolVerticalLine = function () {
        var self = this,
            button = $('<button/>');
        resizableItems.hline = false; // Register As not resizable
        return button.on('click', function () {
            event.stopPropagation();
            elements.workspace.addClass('draw').data('type','vline');
           })
            .html('|').attr({
                title: 'Draw a Vertical line'
            });
    };
    RULER._toolSquare = function () {
        var self = this,
            button = $('<button/>');
        resizableItems.square = true; // Register As  resizable
        return button.on('click', function () {
            event.stopPropagation();
            elements.workspace.addClass('draw').data('type','square');
        })
            .append($('<div/>').css({
                border: '1px solid',
                display: 'inline-block',
                width: '80%',
                height: '40%'
            })).attr({
                title: 'Draw a Square'
            });
    };
    RULER._toolCircle = function () {
        var self = this;
        var button = $('<button/>');
        resizableItems.circle = true; // Register As  resizable
        return button.on('click', function () {
            event.stopPropagation();
            elements.workspace.addClass('draw').data('type','circle');

        })
            .append($('<div/>').css({
                border: '1px solid',
                display: 'inline-block',
                width: '16px',
                height: '16px',
                borderRadius: '50%'
            }))
            .attr({
                title: 'Draw a Circle'
            });
    };
    RULER._toolText = function () {
        var self = this;
        var button = $('<button/>');
        resizableItems.text = true; // Register As  resizable
        return button.on('click', function () {
            event.stopPropagation();
            elements.workspace.addClass('draw').data('type','text');
        })
            .append($('<div/>').css({
                display: 'inline-block'
            })
                .html('T'))
            .attr({
                title: 'Create Textfield'
            });
    };
    RULER._addTools = function () {
        var self = this;
        elements.tools.append(self._toolHorizontalLine());
        elements.tools.append(self._toolVerticalLine());
        elements.tools.append(self._toolSquare());
        elements.tools.append(self._toolCircle());
        elements.tools.append(self._toolText());
    };
    RULER._prepareLayersBox = function () {
        elements.layersBox = $('<layers/>')
            .addClass('layers');
        var header = $('<title/>')

            .html('<span>Items</span><div class="toggle">&lsaquo;</div>');

        elements.layers = $('<div/>');
        elements.layersBox.append(header);
        elements.layersBox.append(elements.layers);
        elements.workspace.append(elements.layersBox);

        elements.layersBox.css({
            top: 0,
            left: elements.toolbox.position().left + elements.toolbox.width() + 20
        });
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
            '<props-tr><props-td>Left:</props-td><props-td><input type="text" name="xpos"/></props-td><props-td>px</props-td></props-tr>' +
            '<props-tr><props-td>Top:</props-td><props-td><input type="text" name="ypos"/></props-td><props-td>px</props-td></props-tr>' +
            '<props-tr><props-td>Width:</props-td><props-td><input type="text" name="width"/></props-td><props-td>px</props-td></props-tr>' +
            '<props-tr><props-td>Height</props-td><props-td><input type="text" name="height"/></props-td><props-td>px</props-td></props-tr>' +
            '</props-table>');

        elements.propsbox.append(header);
        elements.propsbox.append(table);
        elements.workspace.append(elements.propsbox);
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
