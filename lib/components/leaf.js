'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _offsetKey = require('../utils/offset-key');

var _offsetKey2 = _interopRequireDefault(_offsetKey);

var _findDeepestNode = require('../utils/find-deepest-node');

var _findDeepestNode2 = _interopRequireDefault(_findDeepestNode);

var _environment = require('../constants/environment');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Debugger.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:leaf');

/**
 * Leaf.
 *
 * @type {Component}
 */

var Leaf = function (_React$Component) {
  _inherits(Leaf, _React$Component);

  /**
   * Constructor.
   *
   * @param {Object} props
   */

  function Leaf(props) {
    _classCallCheck(this, Leaf);

    var _this = _possibleConstructorReturn(this, (Leaf.__proto__ || Object.getPrototypeOf(Leaf)).call(this, props));

    _this.debug = function (message) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      debug.apply(undefined, [message, _this.props.node.key + '-' + _this.props.index].concat(args));
    };

    _this.tmp = {};
    _this.tmp.renders = 0;
    return _this;
  }

  /**
   * Debug.
   *
   * @param {String} message
   * @param {Mixed} ...args
   */

  /**
   * Property types.
   *
   * @type {Object}
   */

  _createClass(Leaf, [{
    key: 'shouldComponentUpdate',


    /**
     * Should component update?
     *
     * @param {Object} props
     * @return {Boolean}
     */

    value: function shouldComponentUpdate(props) {
      // If any of the regular properties have changed, re-render.
      if (props.index != this.props.index || props.marks != this.props.marks || props.schema != this.props.schema || props.text != this.props.text) {
        return true;
      }

      // If the DOM text does not equal the `text` property, re-render, this can
      // happen because React gets out of sync when previously natively rendered.
      var el = (0, _findDeepestNode2.default)(_reactDom2.default.findDOMNode(this));
      var text = this.renderText(props);
      if (el.textContent != text) return true;

      // Otherwise, don't update.
      return false;
    }

    /**
     * Render the leaf.
     *
     * @return {Element}
     */

  }, {
    key: 'render',
    value: function render() {
      var props = this.props;
      var node = props.node,
          index = props.index;

      var offsetKey = _offsetKey2.default.stringify({
        key: node.key,
        index: index
      });

      // Increment the renders key, which forces a re-render whenever this
      // component is told it should update. This is required because "native"
      // renders where we don't update the leaves cause React's internal state to
      // get out of sync, causing it to not realize the DOM needs updating.
      this.tmp.renders++;

      this.debug('render', { props: props });

      return _react2.default.createElement(
        'span',
        { key: this.tmp.renders, 'data-offset-key': offsetKey },
        this.renderMarks(props)
      );
    }

    /**
     * Render the text content of the leaf, accounting for browsers.
     *
     * @param {Object} props
     * @return {Element}
     */

  }, {
    key: 'renderText',
    value: function renderText(props) {
      var block = props.block,
          node = props.node,
          parent = props.parent,
          text = props.text,
          index = props.index,
          ranges = props.ranges;

      // COMPAT: If the text is empty and it's the only child, we need to render a
      // <br/> to get the block to have the proper height.

      if (text == '' && parent.kind == 'block' && parent.text == '') return _react2.default.createElement('br', null);

      // COMPAT: If the text is empty otherwise, it's because it's on the edge of
      // an inline void node, so we render a zero-width space so that the
      // selection can be inserted next to it still.
      if (text == '') {
        // COMPAT: In Chrome, zero-width space produces graphics glitches, so use
        // hair space in place of it. (2017/02/12)
        var space = _environment.IS_FIREFOX ? '\u200B' : '\u200A';
        return _react2.default.createElement(
          'span',
          { 'data-slate-zero-width': true },
          space
        );
      }

      // COMPAT: Browsers will collapse trailing new lines at the end of blocks,
      // so we need to add an extra trailing new lines to prevent that.
      var lastText = block.getLastText();
      var lastChar = text.charAt(text.length - 1);
      var isLastText = node == lastText;
      var isLastRange = index == ranges.size - 1;
      if (isLastText && isLastRange && lastChar == '\n') return text + '\n';

      // Otherwise, just return the text.
      return text;
    }

    /**
     * Render all of the leaf's mark components.
     *
     * @param {Object} props
     * @return {Element}
     */

  }, {
    key: 'renderMarks',
    value: function renderMarks(props) {
      var marks = props.marks,
          schema = props.schema,
          node = props.node,
          offset = props.offset,
          text = props.text,
          state = props.state,
          editor = props.editor;

      var children = this.renderText(props);

      return marks.reduce(function (memo, mark) {
        var Component = mark.getComponent(schema);
        if (!Component) return memo;
        return _react2.default.createElement(
          Component,
          {
            editor: editor,
            mark: mark,
            marks: marks,
            node: node,
            offset: offset,
            schema: schema,
            state: state,
            text: text
          },
          memo
        );
      }, children);
    }
  }]);

  return Leaf;
}(_react2.default.Component);

/**
 * Export.
 *
 * @type {Component}
 */

Leaf.propTypes = {
  block: _propTypes2.default.object.isRequired,
  editor: _propTypes2.default.object.isRequired,
  index: _propTypes2.default.number.isRequired,
  marks: _propTypes2.default.object.isRequired,
  node: _propTypes2.default.object.isRequired,
  offset: _propTypes2.default.number.isRequired,
  parent: _propTypes2.default.object.isRequired,
  ranges: _propTypes2.default.object.isRequired,
  schema: _propTypes2.default.object.isRequired,
  state: _propTypes2.default.object.isRequired,
  text: _propTypes2.default.string.isRequired
};
exports.default = Leaf;