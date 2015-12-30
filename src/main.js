/**
 * Created by es on 28.12.2015.
 */
;
(function ($) {

    var elements = {
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
        uniqueID = 0,
        selectedItem,
        actions = {
            'newItem': function (type) {

                uniqueID++;
                var label = $('<div/>').addClass('label').html(''),
                    style = '', color = Math.floor(Math.random() * 16777215).toString(16);

                color += String('000000').slice(color.length);

                switch (type) {
                    case 'circle':
                    case 'square':
                        style = {'border-color': '#' + color};
                        break;
                    default:
                        style = {'background-color': '#' + color};
                }
                return $('<div/>')
                    .attr({id: 'item-' + uniqueID, 'data-type': type, 'data-color': color})
                    .addClass('item ' + type)
                    .css(style)
                    .append(label);
            },
            'updatePropetries': function (target) {
                var pos = $(target).position();
                elements.propsTable.xpos.val(pos.left);
                elements.propsTable.ypos.val(pos.top);
                elements.propsTable.width.val($(target).width());
                elements.propsTable.height.val($(target).height());
            },
            'selectTarget': function (target) {
                selectedItem = target;
                actions.updatePropetries(target);
                elements.propsbox.show();
            },
            'deSelectTarget': function (target) {
                selectedItem = null;
                elements.propsbox.hide();
            },
            'draggable': function () {
                var self = this;

                function dragStart() {
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
                    var item = $('.draggable'),
                        type = item.attr('data-type'),
                        pos = {
                            x: event.pageX,
                            y: event.pageY,
                            offsetX: Number(item.attr('data-offset-x')),
                            offsetY: Number(item.attr('data-offset-y'))
                        };
                    if(pos.x<0||pos.y<0) return dragEnd(event);
                    switch (type) {
                        case 'vr':
                            self.css({left: pos.x});
                            self.find('.label').html(pos.x);
                            break;
                        case 'hr':
                            self.css({top: pos.y});
                            self.find('.label').html(pos.y);
                            break;
                        case 'square':
                        case 'circle':
                            var x = pos.x - pos.offsetX, y = pos.y - pos.offsetY;
                            self.css({top: pos.y + pos.offsetY, left: pos.x + pos.offsetX});
                            self.find('.label').html(pos.x + ', ' + pos.y);
                            break;
                        default:
                            var x = pos.x - pos.offsetX, y = pos.y - pos.offsetY;
                            self.css({top: pos.y + pos.offsetY, left: pos.x + pos.offsetX});
                    }
                    actions.updatePropetries(self);
                };
                function dragEnd(e) {
                    $('.draggable').removeClass('draggable');
                    $(window).off('mousemove', drag);

                };
                $(self).on('mousedown', dragStart);

                //          $(self).on('mouseup', dragEnd);
            },
            'moveOnX': function () {
                var val = elements.propsTable.xpos.val();
                val = String(val).replace(/[^0-9]/g, '');
                elements.propsTable.xpos.val(val);
                $(selectedItem).css({left: val + 'px'});
            },
            'moveOnY': function () {
                var val = elements.propsTable.ypos.val();
                val = String(val).replace(/[^0-9]/g, '');
                elements.propsTable.ypos.val(val);
                $(selectedItem).css({top: val + 'px'});
            },
            'resizeW': function () {
                var val = elements.propsTable.width.val();
                val = String(val).replace(/[^0-9]/g, '');
                elements.propsTable.width.val(val);
                $(selectedItem).css({width: val + 'px'});
            },
            'resizeH': function () {
                var val = elements.propsTable.height.val();
                val = String(val).replace(/[^0-9]/g, '');
                elements.propsTable.height.val(val);
                $(selectedItem).css({height: val + 'px'});
            },
            'keySetVal': function (cb) {
                var self = $(this),
                    step = event.shiftKey ? 10 : 1;
                console.log(event.which);
                switch (event.which) {
                    case 40: // keyUp
                        break;
                    case 38: //keyDown
                        step *= -1;
                        break;
                    default:
                        event.preventDefault();
                        return;
                }
                self.val(Number(self.val()) - step);
                cb();

            }

        },
        RULER = {};
    RULER.init = function () {
        var self = this;
        elements.workspace = $('<div/>').attr('id', 'chrome-ruler');
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
    };
    RULER._prepareToolBox = function () {
        elements.toolbox = $('<div/>')
            .addClass('toolbox');
        var header = $('<h1/>')
            .addClass('header')
            .html('<span>Tools</span><div class="toggle">&lsaquo;</div>');
        elements.tools = $('<div/>')
            .addClass('tools');
        elements.toolbox.append(header);
        elements.toolbox.append(elements.tools);
        elements.workspace.append(elements.toolbox);

    };
    RULER._toolHorizontalLine = function () {
        var self = this,
            button = $('<button/>');

        return button.on('click', function () {
            var el = actions.newItem('hr');
            elements.workspace.append(el);
            self.addLayer(el);
            actions.draggable.call(el);
        })
            .html('&mdash;').attr({
                title: 'Draw a horizontal line'
            });
    };
    RULER._toolVerticalLine = function () {
        var self = this,
            button = $('<button/>');
        return button.on('click', function () {
            var el = actions.newItem('vr');
            elements.workspace.append(el);
            actions.draggable.call(el);
            self.addLayer(el);
        })
            .html('|').attr({
                title: 'Draw a Vertical line'
            });
    };
    RULER._toolSquare = function () {
        var self = this;
        var button = $('<button/>');
        return button.on('click', function () {
            var el = actions.newItem('square');
            elements.workspace.append(el);
            self.addLayer(el);
            actions.draggable.call(el);
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
        return button.on('click', function () {
            var el = actions.newItem('circle');
            elements.workspace.append(el);
            self.addLayer(el);
            actions.draggable.call(el);
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
    RULER._addTools = function () {
        var self = this;
        elements.tools.append(self._toolHorizontalLine());
        elements.tools.append(self._toolVerticalLine());
        elements.tools.append(self._toolSquare());
        elements.tools.append(self._toolCircle());
    };
    RULER._prepareLayersBox = function () {
        elements.layersBox = $('<div/>')
            .addClass('layers');
        var header = $('<h1/>')
            .addClass('header')
            .html('<span>Items</span><div class="toggle">&lsaquo;</div>');
        ;
        elements.layers = $('<div/>');
        elements.layersBox.append(header);
        elements.layersBox.append(elements.layers);
        elements.workspace.append(elements.layersBox);

        elements.layersBox.css({
            top: elements.toolbox.position().top + elements.toolbox.height() + 20
        });
    };
    RULER.addLayer = function (el) {
        actions.updatePropetries(el);
        var selectItem = function () {

                var parent = $(this).parent('ul'),
                    targetID = '#' + parent.attr('data-target');
                actions.deSelectTarget(targetID);
                if (parent.hasClass('selected')) {
                    parent.removeClass('selected');
                    return;
                }
                $('.layers ul').removeClass('selected');
                parent.addClass('selected');
                //:TODO select target
                actions.selectTarget(targetID);
            },
            removeItem = function () {
                var parent = $(this).parent('ul'),
                    targetID = '#' + parent.attr('data-target');
                parent.remove();
                $(targetID).remove();
                elements.propsbox.hide();
                if (elements.layers.find('ul').length == 0) elements.layersBox.hide();
            },
            hideItem = function () {
                var parent = $(this).parent('ul'),
                    targetID = '#' + parent.attr('data-target');
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
            visibility = $('<li/>').addClass('btn visibility').attr({title: 'Hide'}).on('click', hideItem).css({'background-color': '#' + el.attr('data-color')}),
            label = $('<li/>').addClass('label').html(el.attr('data-type')).on('click', selectItem),
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
        elements.propsbox = $('<div/>')
            .addClass('props');
        var header = $('<h1/>')
                .addClass('header')
                .html('<span>Properties</span><div class="toggle">&lsaquo;</div>'),
            table = $('<div/>').html('<table border="0">' +
            '<tr><td colspan="3"></td></tr>' +
            '<tr><td>Left:</td><td><input type="text" name="xpos"/></td><td>px</td></tr>' +
            '<tr><td>Top:</td><td><input type="text" name="ypos"/></td><td>px</td></tr>' +
            '<tr><td>Width:</td><td><input type="text" name="width"/></td><td>px</td></tr>' +
            '<tr><td>Height</td><td><input type="text" name="height"/></td><td>px</td></tr>' +
            '');
        elements.propsbox.append(header);
        elements.propsbox.append(table);
        elements.workspace.append(elements.propsbox);
        elements.propsTable.xpos = $('.props input[name=xpos]');
        elements.propsTable.ypos = $('.props input[name=ypos]');
        elements.propsTable.width = $('.props input[name=width]');
        elements.propsTable.height = $('.props input[name=height]');

        elements.propsbox.hide();

    };
    RULER.init();
})(Zepto);