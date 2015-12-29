/**
 * Created by es on 28.12.2015.
 */
/**
 * 1- prepare tools :
 *  -- layer
 *      -- ruler
 *      -- square
 *      -- circle
 *  2-
 *  */

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
            uniqueID: 0,
            propsTable: {}
        },
        actions = {
            'newItem': function (type) {
                //:TODO update label value on move

                elements.uniqueID++;
                var label = $('<div/>').addClass('label').html('50px'),
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
                    .attr({id: 'item-' + elements.uniqueID, 'data-type': type, 'data-color': color})
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
                actions.updatePropetries(target);
                elements.propsbox.show();
            },
            'deSelectTarget': function (target) {
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
                            offsetX:Number(item.attr('data-offset-x')),
                            offsetY:Number( item.attr('data-offset-y'))
                        };
                    switch (type) {
                        case 'vr':
                            self.css({left: pos.x});
                            self.find('.label').html('x:&nbsp;'+pos.x + 'px');
                            break;
                        case 'hr':
                            self.css({top: pos.y});
                            self.find('.label').html('y:&nbsp;'+pos.y + 'px');
                            break;
                        case 'square':
                        case 'circle':
                            var x = pos.x - pos.offsetX, y = pos.y - pos.offsetY;
                            self.css({top: pos.y + pos.offsetY, left: pos.x + pos.offsetX});
                            self.find('.label').html(pos.x + 'px ,' + pos.y + 'px');
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
            }
        },
        RULER = {};
    RULER.init = function () {
        var self = this;
        elements.workspace = $('<div/>').attr('id', 'chrome-ruler');
        $('body').append(elements.workspace);
        self._prepareToolBox();
        self._horizontalRuler();
        self._verticalRuler();
        self._addTools();
        self._prepareLayersBox();
        self._preparePropsBox();
        actions.draggable.call(elements.toolbox);
        actions.draggable.call(elements.layersBox);
        actions.draggable.call(elements.propsbox);
    };
    RULER._prepareToolBox = function () {
        elements.toolbox = $('<div/>')
            .addClass('toolbox');
        var header = $('<h1/>')
            .addClass('header')
            .html('Toolbox');
        elements.tools = $('<div/>')
            .addClass('tools');
        elements.toolbox.append(header);
        elements.toolbox.append(elements.tools);
        elements.workspace.append(elements.toolbox);
        header.on('click', function () {
            $(this).next().toggle();
        });
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
    RULER._horizontalRuler = function () {
        elements.hRuler = $('<div/>')
            .css({
                width: '100%',
                height: 20,
                position: 'absolute',
                left: 0,
                top: 0,
                opacity: '.1',
                backgroundColor: '#ccc'
            });
        elements.workspace.append(elements.hRuler);
    };
    RULER._verticalRuler = function () {
        elements.vRuler = $('<div/>')
            .css({
                width: 20,
                height: '100%',
                position: 'absolute',
                left: 0,
                top: 0,
                opacity: '.1',
                backgroundColor: '#ccc'
            });
        elements.workspace.append(elements.vRuler);
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
            .html('Items');
        elements.layers = $('<div/>');
        elements.layersBox.append(header);
        elements.layersBox.append(elements.layers);
        elements.workspace.append(elements.layersBox);
        header.on('click', function () {
            $(this).next().toggle();
        });
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

        ul.append(visibility);
        ul.append(label);
        ul.append(remove);
        elements.layers.append(ul);
    };
    RULER._preparePropsBox = function () {
        elements.propsbox = $('<div/>')
            .addClass('props');
        var header = $('<h1/>')
                .addClass('header')
                .html('Properties'),
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
        header.on('click', function () {
            $(this).next().toggle();
        });
        elements.propsbox.hide();

    };
    RULER.init();
})(Zepto);