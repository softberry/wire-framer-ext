/**
 * Created by es on 28.12.2015.
 */
;
(function ($) {
    'use strict';
    /**
     * Shorhand variables for oft used elements
     * @type {{workspace: {}, panel: {}, toolbox: {}, propsbox: {}, hRuler: {}, vRuler: {}, tools: {}, layersBox: {}, layers: {}, items: {}, propsTable: {x: {}}}}
     */
    var elements = {
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
            propsTable: {
                "x": {}
            }

        },
        /**
         * each element like a line or a square has a uniqueID.
         Automatically increased before a new Item inserted
         * @type {number}
         */
        uniqueID = 0,
        /**
         *  shortcut to current selected Item on the stage
         * @type {null}
         */
        selectedItem = null,
        /**
         * all items that can be resized
         * @type {{object}}
         */
        resizableItems = {},
        /**
         * all items that can be draggable on the stage
         * @type {{object}}
         */
        draggableItems = {},
        itemPrototype = {},
        /**
         * Repeated functions served to WF object
         * @type {{highestIndex: Function, newItem: Function, drawGuide: Function, updateGuide: Function, drawAt: Function, updateProperties: Function, showEditablesOnly: Function, selectTarget: Function, deSelectTarget: Function, draggable: Function, moveOnX: Function, moveOnY: Function, resizeW: Function, resizeH: Function, setProperty: Function, resizable: Function, stickPanel: Function}}
         */
        actions = {
            'highestIndex': function () {
                var i = 999, zIndex;
                $('*').each(function () {
                    zIndex = Number($(this).css('zIndex'));

                    if (zIndex > i) i = zIndex;

                });
                return i;
            },
            /**
             * return a new DIV element,
             * with default properties according to requested type
             * @param type
             * @returns {HTMLElement}
             */
            'newItem': function (type) {
                /*
                Increase ID before each newly created element
                 */
                uniqueID++;
                /**
                 * create label for the element
                 */
                var label = $('<div/>').addClass('label').html(''),
                    color = Math.floor(Math.random() * 16777215).toString(16);  // set a rondom color

                color += String('000000').slice(color.length); // fill unsufficent hexCode with 000000
                var el = $('<' + type + '/>'); //prepare and return requested type of item

                if (itemPrototype[type].properties.backgroundColor != 'transparent') el.css({'background-color': '#' + color});
                if (itemPrototype[type].properties.borderColor) el.css({'border-color': '#' + color});

                el.attr({id: 'item-' + uniqueID, 'data-type': type, 'data-color': color})
                    .addClass('item ' + type)
                    .append(label)
                    .append(itemPrototype[type].target.content(color));
                if (resizableItems[type]) {
                    //if an Item Resizable prepare its resizer handles.
                    actions.resizable.call(el)
                }
                return el;
            },
            /**
             * Draw a preview guide on the stage
             * @param pos
             */
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
            /**
             * Update position and size of the guide on drag
             * @param pos
             */
            'updateGuide': function (pos) {

                var guide = $('guide'),
                    l = guide.attr('data-left'),
                    t = guide.attr('data-top'),
                    w = pos.x - l,
                    h = pos.y - t,
                    type = elements.workspace.data('type');

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
            /**
             * Start drawing at given position
             * @param pos
             */
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
            /**
             * Get current position and size of the Selected and update input values in properties table
             */
            'updateProperties': function () {
                if (selectedItem == null) return;
                var pos = selectedItem.position(),
                    bg = selectedItem.css('background-color').toString(),
                    border = selectedItem.css('border-color').toString();

                elements.propsTable.xPos.val(pos.left);
                elements.propsTable.yPos.val(pos.top);
                elements.propsTable.width.val(selectedItem.width());
                elements.propsTable.height.val(selectedItem.height());
                elements.propsTable.bgColor.val(bg.toHex());
                elements.propsTable.bgColor.parent().css('background-color', bg);
                elements.propsTable.borderColor.val(border.toHex());
                elements.propsTable.borderColor.parent().css('border-color', border);

                if (resizableItems[selectedItem.data('type')]) {
                    /* update positions of handels*/
                    var w = selectedItem.width(), // get container width
                        h = selectedItem.height(),
                        id = selectedItem.attr('id'); // get container height
                    /* prepare handles, set type and class attributes as well as initial positions*/
                    $('#' + id + ' .rs-n').css({left: w / 2 - 5, top: -5});
                        $('#' + id + ' .rs-w').css({left: -5, top: h / 2 - 5});
                        $('#' + id + ' .rs-s').css({left: w / 2 - 5, top: h - 5});
                        $('#' + id + ' .rs-e').css({left: w - 5, top: h / 2 - 5});
                }
            },
            'showEditablesOnly': function () {

                /** TODO
                 *  in props folder create define.js
                 *  set defaults for each property
                 *  return creator function for this property and its control
                 *
                 */

                $('props-tr').remove();
                var propsTable = $('props-table'), propsRow, td, el, ctrl;
                for (var n in itemPrototype[selectedItem.data('type')].properties) {
                    console.log(WF.propertyControls[n]);
                    el = WF.propertyControls[n];
                    propsRow = $('<props-tr/>');
                    propsTable.append(propsRow);

                    if (el.label) {
                        td = $('<props-td/>');
                        td.html(el.label);
                        propsRow.append(td);
                    }
                    for (var c = 0; c < el.control.length; c++) {
                        td = $('<props-td/>');
                            ctrl = $('<input/>');
                        ctrl.attr({'type': el.control[c], 'value': selectedItem.css(el.css)});
                        td.append(ctrl);
                        propsRow.append(td);
                    }
                }


            },
            /**
             * Select and show handles on clicked item (target) on the stage
             * @param target
             */
            'selectTarget': function (target) {

                if (elements.workspace.hasClass('draw')) return;
                event.stopPropagation();
                // if(selectedItem!=null) return actions.deSelectTarget();
                selectedItem = $(target);
                /* Set givenID as selected Item */
                actions.updateProperties();
                /* update properties table*/
                elements.propsbox.show();
                /* show properties table*/
                actions.showEditablesOnly();
                if (resizableItems[selectedItem.data('type')]) {
                    selectedItem.addClass('resizable');

                    var w = selectedItem.width(), // get container width
                        h = selectedItem.height(),
                        id = selectedItem.attr('id'); // get container height
                    /* prepare handles, set type and class attributes as well as initial positions*/
                    $('#' + id + ' .rs-n').css({left: w / 2 - 5, top: -5});
                        $('#' + id + ' .rs-w').css({left: -5, top: h / 2 - 5});
                        $('#' + id + ' .rs-s').css({left: w / 2 - 5, top: h - 5});
                        $('#' + id + ' .rs-e').css({left: w - 5, top: h / 2 - 5});

                }


            },
            /**
             * Finalize selecting
             */
            'deSelectTarget': function () {
                if (selectedItem === null) return;
                selectedItem.removeClass('resizable');
                selectedItem = null;
                /* de-select item*/
                elements.propsbox.hide();
                /*hide Properties table*/

            },
            /**
             * Enable element to be draggable on the stage
             **/
            'draggable': function () {

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
                    elements.workspace.on('mousemove', drag);
                    elements.workspace.one('mouseup', dragEnd);
                };
                /**
                 *
                 * @returns {*}
                 */
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

                /**
                 * Disable draggabilty function
                 */
                function dragEnd() {
                    $('.draggable').removeClass('draggable');
                    elements.workspace.off('mousemove', drag);

                }

                $(self).on('mousedown', dragStart);

            },
            /**
             * use arrow events assigned to window element,
             * when a property (x,y,w,h) changed
             */
            'moveOnX': function () {

                if (event.which == 37 || event.which == 39) {
                    event.stopPropagation();
                }
                /* convert left-right arrows to up-down arrows */
                if (event.which == 38 || event.which == 40) {
                    event.stopPropagation();

                    var e = $.Event('keydown', {which: event.which == 38 ? 39 : 37});
                    $(window).trigger(e);
                }


            },
            /**
             * use arrow events assigned to window element,
             * when a property (x,y,w,h) changed
             */

            'moveOnY': function () {
                if (event.which == 37 || event.which == 39) {
                    // avoid moves on X-axis
                    event.stopPropagation();

                }
                if (event.which == 38 || event.which == 40) {
                    // avoid moves on X-axis
                    event.stopPropagation();
                    var e = $.Event('keydown', {which: event.which});
                    $(window).trigger(e);
                }

            },
            /**
             * Change the width of the element
             */
            'resizeW': function () {
                if (event.which == 37 || event.which == 39) {
                    event.stopPropagation();
                }
                if (event.which == 38 || event.which == 40) {
                    // avoid moves on X and Y-axis
                    // use up-down key to resize width
                    event.stopPropagation();
                    var step = event.shiftKey ? 10 : 1,
                        dir = (event.which == 38) ? 1 : -1,
                        w = $(selectedItem).width();
                    $(selectedItem).width(w + step * dir);
                    actions.updateProperties();
                }
            },
            /**
             * change the Height of the element
             */
            'resizeH': function () {
                if (event.which == 37 || event.which == 39) {
                    event.stopPropagation();
                }
                if (event.which == 38 || event.which == 40) {
                    // avoid moves on X and Y-axis
                    // use up-down key to resize width
                    event.stopPropagation();
                    var step = event.shiftKey ? 10 : 1,
                        dir = (event.which == 38) ? 1 : -1,
                        w = $(selectedItem).height();
                    $(selectedItem).height(w + step * dir);
                    actions.updateProperties();
                }
            },
            /**
             * apply style properties to the element
             */
            'setProperty': function () {
                // change Item X,Y,W,H properties with up-down keys
                if (selectedItem == null) return;
                event.stopPropagation();

                var prop = {
                    'xpos': 'left',
                    'ypos': 'top',
                    'width': 'width',
                    'height': 'height'
                };

                var self = $(this),
                    val = self.val() + 'px',
                    n = prop[self.attr('name')];

                $(selectedItem).css(n, val);
                actions.updateProperties();


            },
            /**
             * set item as resizable
             */
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
                /*Deprecated currently panel sick to only left*/
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
        WF = {};
    /**
     * initaliser of the Top level WF element
     */
    WF.init = function () {
        if ($('wireframer').length == 1) {
            $('wireframer').toggle();
            return;
        }

        var self = this;
        elements.workspace = $('<wireframer/>');
        elements.workspace.attr('id', 'wireframer').css({zIndex: actions.highestIndex()});

        $('body').append(elements.workspace);
        self.preparePanel();
        self._prepareToolBox();
        //  self._addTools();
        self._prepareLayersBox();
        self._preparePropsBox();
        self._assignEvents();
        elements.toolbox.addClass('no-select');
        elements.layersBox.addClass('no-select');
        elements.propsbox.addClass('no-select');
        elements.layersBox.hide();

    };
    /**
     * Prepare control panel that contains controls
     */
    WF.preparePanel = function () {
        elements.panel = $('<panel/>').addClass('no-select')
            .data('type', 'panel');
        var title = $('<title/>');
        title
            .append($('<h1/>').html('Wireframer'))
            .append(
            $('<pin/>')
                .attr('title', 'Lock Panel')
                .on('click', function () {
                    ($(this).hasClass('on')) ?
                        $(this).removeClass('on') :
                        $(this).addClass('on');

                    $(this).attr('title', $(this).hasClass('on') ? 'Unlock Panel' : 'Lock Panel')
                })
        )
            .append($('<minimize/>')
                .html('&lsaquo;')
                .attr('title', 'Minimize Panel')
                .on('click', function () {
                    if ($(this).hasClass('off')) {
                        $(this).removeClass('off')

                            .attr('title', 'Minimize Panel');
                        elements.panel.css({'height': '100%'});
                    } else {

                        $(this).addClass('off')
                            .attr('title', 'Maximize Panel');

                        elements.panel.css({'height': '30px', 'overflow': 'hidden'});
                    }


                })
        );
        elements.panel.append(title);

        elements.workspace.append(elements.panel);
    };
    /**
     * assign required events (click, mousemove, mousedown etc...) to the elements on the stage
     * @private
     */
    WF._assignEvents = function () {
        var self = this;
        $('.toggle').on('click', function () {
            $(this).parent().next().toggle();
            $(this).hasClass('collapsed') ? $(this).removeClass('collapsed') : $(this).addClass('collapsed');
        });
        elements.propsbox.on('click mouseup mousedown keyup keydown', function () {
            /* avoid unwanted deselects on workspace mouseup */
            //event.stopImmediatePropagation();
            event.stopPropagation();
        });
        elements.propsTable.xPos.on('blur', actions.setProperty).on('keydown', function () {
            actions.moveOnX();
        });
        elements.propsTable.yPos.on('blur', actions.setProperty).on('keydown', function () {
            actions.moveOnY();
        });
        elements.propsTable.width.on('blur', actions.setProperty).on('keydown', function () {
            actions.resizeW();
        });
        elements.propsTable.height.on('blur', actions.setProperty).on('keydown', function () {
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
            actions.drawAt.call(self, {x: event.pageX, y: event.pageY});
            if (selectedItem != null && event.toElement != null) {
                // deselect item on outer click
                if ($(event.toElement.id) != selectedItem) actions.deSelectTarget();
                return false;

            }
        });


        elements.workspace.on('contextmenu', function () {
            // disable context menu
            event.preventDefault();

        })
            .on('mousemove', function () {
                if (event.pageX < 20) {
                    elements.panel.css({'transform': 'translateX(0)'});

                    elements.workspace.attr('id', 'wireframer').css({zIndex: actions.highestIndex()});
                }
            });
        elements.panel.on('mouseleave', function () {
            if ($('panel pin').hasClass('on')) return;
            elements.panel.css({'transform': 'translateX(-100%)'});
        });

        $(window).on('keydown', function () {

            var type = selectedItem != null ? selectedItem.data('type') : '',
                pos = selectedItem != null ? selectedItem.position() : {left: 0, top: 0},
                x = pos.left,
                y = pos.top;

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

                event.shiftKey ? y += 5 : y += 1;
                selectedItem.css({
                    top: y
                });
            }
            if (selectedItem != null && event.which == 38) {

                event.preventDefault();
                if (String(draggableItems[type]).toUpperCase().indexOf('Y') < 0) return;

                event.shiftKey ? y -= 5 : y -= 1;
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
            if (selectedItem != null && event.which >= 37 && event.which <= 40) {

                actions.updateProperties();
            }


        });
        $(window).on('resize scroll', function () {
            var w = Math.max($(window).width(), $('html').width(), $('body').width()),
                h = Math.max($(window).height(), $('html').height(), $('body').height());
            elements.workspace.css({width: w});
            elements.workspace.css({height: h});
            $('hline').width(w);
            $('vline').height(h);
        });

        /** Selected Item Background-color**/
        elements.propsTable.bgColor.on('change', function () {

            selectedItem.css({backgroundColor: $(this).val()});
        });
        /** Select Item Border-color**/
        elements.propsTable.borderColor.on('change', function () {
            selectedItem.css({borderColor: $(this).val()});
        });

    };
    /**
     * prepares tools container on the panel
     * @private
     */
    WF._prepareToolBox = function () {
        elements.toolbox = $('<toolbox/>')
            .addClass('toolbox');
        var header = $('<title/>').addClass('no-select')

            .html('<span>Tools</span><div class="toggle">&lsaquo;</div>');
        elements.tools = $('<tools/>')
        elements.toolbox.append(header);
        elements.toolbox.append(elements.tools);
        elements.panel.append(elements.toolbox);

    };
    /**
     * creates new Tool iven as object
     * @param tool
     */
    WF.addTool = function (tool) {
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

        itemPrototype[tool.type] = tool;

        elements.tools.append(button);

    };
    /**
     * prepares layers container on the panel
     * @private
     */
    WF._prepareLayersBox = function () {
        elements.layersBox = $('<layers/>')
            .addClass('layers');
        var header = $('<title/>')

            .html('<span>Items</span><div class="toggle">&lsaquo;</div>');

        elements.layers = $('<div/>');
        elements.layersBox.append(header);
        elements.layersBox.append(elements.layers);
        elements.panel.append(elements.layersBox);

    };
    /**
     * add a layer on the stage
     * @param el
     */
    WF.addLayer = function (el) {
        actions.updateProperties(el);
        el.on('contextmenu', function () {
            event.preventDefault();
        });
        var selectItem = function () {

                var parent = $(this).parent('ul'),
                    targetID = '#' + parent.data('target');

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
    /**
     * Prepares properties container on the panel
     * @private
     */
    WF._preparePropsBox = function () {

        elements.propsbox = $('<props/>')
            .addClass('props');
        var labelID = new Date().getTime(),
            header = $('<title/>')

                .html('<span>Properties</span><div class="toggle">&lsaquo;</div>'),
            table = $('<div/>').html('<props-table>' +
            '<props-tr><props-td colspan="3"></props-td></props-tr>' +
            '<props-tr><props-td>X:</props-td><props-td><input type="text" name="xpos"/></props-td><props-td><input type="range" name="xrange"/></props-td></props-tr>' +
            '<props-tr><props-td>Y:</props-td><props-td><input type="text" name="ypos"/></props-td><props-td><input type="range" name="yrange"/></props-td></props-tr>' +
            '<props-tr><props-td>W:</props-td><props-td><input type="text" name="width"/></props-td><props-td><input type="range" name="wrange"/></props-td></props-tr>' +
            '<props-tr><props-td>H</props-td><props-td><input type="text" name="height"/></props-td><props-td><input type="range" name="hrange"/></props-td></props-tr>' +
            '<props-tr>' +
            '<props-td>Background<label class="color-picker bg" for="bgColor' + labelID + '"><input type="color" name="background" id="bgColor' + labelID + '" title="Pick background Color"/></label></props-td>' +
            '<props-td>Border<label class="color-picker border" for="borderColor' + labelID + '"><input type="color" name="border" id="borderColor' + labelID + '" title="Pick border Color"/></label></props-td>' +
            '</props-tr>' +
            '</props-table>');

        elements.propsbox.append(header);
        elements.propsbox.append(table);
        elements.panel.append(elements.propsbox);
        elements.propsTable.xPos = $('.props input[name=xpos]');
        elements.propsTable.xRange = $('.props input[name=xrange]');
        elements.propsTable.yPos = $('.props input[name=ypos]');
        elements.propsTable.yRange = $('.props input[name=yrange]');
        elements.propsTable.width = $('.props input[name=width]');
        elements.propsTable.wRange = $('.props input[name=wrange]');
        elements.propsTable.height = $('.props input[name=height]');
        elements.propsTable.hRange = $('.props input[name=hrange]');
        elements.propsTable.bgColor = $('.props input[name=background]');
        elements.propsTable.borderColor = $('.props input[name=border]');
        elements.propsbox.hide();

    };
    WF.propertyControls = {
        'width': {
            'label': 'W',
            'css': 'width',
            'min': 0,
            'max': 100,
            'control': ['text', 'range']
        },
        'height': {
            'label': 'H',
            'css': 'height',
            'min': 0,
            'max': 100,
            'control': ['text', 'range']
        },
        'left': {
            'label': 'X',
            'css': 'left',
            'min': 0,
            'max': 100,
            'control': ['text', 'range']
        },
        'top': {
            'label': 'Y',
            'css': 'top',
            'min': 0,
            'max': 100,
            'control': ['text', 'range']
        },
        'backgroundColor': {
            'label': 'Background Color',
            'css': 'background-color',
            'control': ['color']
        },
        'borderColor': {
            'label': 'Border Color',
            'css': 'border-color',
            'control': ['color']
        },
        'borderWidth': {
            'label': 'Border Width',
            'css': 'border-width',
            'min': 1,
            'max': 16,
            'control': ['text', 'range']
        },
        'borderStyle': {
            'label': 'Border Style',
            'css': 'border-style',
            'options': ['solid', 'dashed', 'dotted'],
            'control': ['select']
        },
        'opacity': {
            'label': 'Opacity',
            'css': 'opacity',
            'min': 0,
            'max': 1,
            'control': ['text', 'range']
        }
    };
    window.wireframer = WF;
    WF.init();
})(Zepto);
/** TODO:
 * -- workspace click : deselect item and layer : done
 * -- show only editable properties
 * -- update range min,max and value
 * ---------------------------------------------
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
 *  -
 */
