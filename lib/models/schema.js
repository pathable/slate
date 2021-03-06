'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _isReactComponent = require('../utils/is-react-component');

var _isReactComponent2 = _interopRequireDefault(_isReactComponent);

var _typeOf = require('type-of');

var _typeOf2 = _interopRequireDefault(_typeOf);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  rules: []
};

/**
 * Schema.
 *
 * @type {Schema}
 */

var Schema = function (_ref) {
  _inherits(Schema, _ref);

  function Schema() {
    _classCallCheck(this, Schema);

    return _possibleConstructorReturn(this, (Schema.__proto__ || Object.getPrototypeOf(Schema)).apply(this, arguments));
  }

  _createClass(Schema, [{
    key: '__getComponent',


    /**
     * Return the renderer for an `object`.
     *
     * This method is private, because it should always be called on one of the
     * often-changing immutable objects instead, since it will be memoized for
     * much better performance.
     *
     * @param {Mixed} object
     * @return {Component|Void}
     */

    value: function __getComponent(object) {
      var match = this.rules.find(function (rule) {
        return rule.render && rule.match(object);
      });
      if (!match) return;
      return match.render;
    }

    /**
     * Return the decorators for an `object`.
     *
     * This method is private, because it should always be called on one of the
     * often-changing immutable objects instead, since it will be memoized for
     * much better performance.
     *
     * @param {Mixed} object
     * @return {Array}
     */

  }, {
    key: '__getDecorators',
    value: function __getDecorators(object) {
      return this.rules.filter(function (rule) {
        return rule.decorate && rule.match(object);
      }).map(function (rule) {
        return function (text) {
          return rule.decorate(text, object);
        };
      });
    }

    /**
     * Validate an `object` against the schema, returning the failing rule and
     * value if the object is invalid, or void if it's valid.
     *
     * This method is private, because it should always be called on one of the
     * often-changing immutable objects instead, since it will be memoized for
     * much better performance.
     *
     * @param {Mixed} object
     * @return {Object|Void}
     */

  }, {
    key: '__validate',
    value: function __validate(object) {
      var value = void 0;

      var match = this.rules.find(function (rule) {
        if (!rule.validate) return;
        if (!rule.match(object)) return;

        value = rule.validate(object);
        return value;
      });

      if (!value) return;

      return {
        rule: match,
        value: value
      };
    }
  }, {
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'schema';
    }

    /**
     * Return true if one rule can normalize the document
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasValidators',
    get: function get() {
      var rules = this.rules;

      return rules.some(function (rule) {
        return rule.validate;
      });
    }

    /**
     * Return true if one rule can decorate text nodes
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasDecorators',
    get: function get() {
      var rules = this.rules;

      return rules.some(function (rule) {
        return rule.decorate;
      });
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Schema` with `properties`.
     *
     * @param {Object|Schema} properties
     * @return {Schema}
     */

    value: function create() {
      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (properties instanceof Schema) return properties;
      return new Schema(normalizeProperties(properties));
    }
  }]);

  return Schema;
}(new _immutable.Record(DEFAULTS));

/**
 * Normalize the `properties` of a schema.
 *
 * @param {Object} properties
 * @return {Object}
 */

function normalizeProperties(properties) {
  var _properties$rules = properties.rules,
      rules = _properties$rules === undefined ? [] : _properties$rules,
      nodes = properties.nodes,
      marks = properties.marks;


  if (nodes) {
    var array = normalizeNodes(nodes);
    rules = rules.concat(array);
  }

  if (marks) {
    var _array = normalizeMarks(marks);
    rules = rules.concat(_array);
  }

  return { rules: rules };
}

/**
 * Normalize a `nodes` shorthand argument.
 *
 * @param {Object} nodes
 * @return {Array}
 */

function normalizeNodes(nodes) {
  var rules = [];

  var _loop = function _loop(key) {
    var rule = nodes[key];

    if ((0, _typeOf2.default)(rule) == 'function' || (0, _isReactComponent2.default)(rule)) {
      rule = { render: rule };
    }

    rule.match = function (object) {
      return (object.kind == 'block' || object.kind == 'inline') && object.type == key;
    };

    rules.push(rule);
  };

  for (var key in nodes) {
    _loop(key);
  }

  return rules;
}

/**
 * Normalize a `marks` shorthand argument.
 *
 * @param {Object} marks
 * @return {Array}
 */

function normalizeMarks(marks) {
  var rules = [];

  var _loop2 = function _loop2(key) {
    var rule = marks[key];

    if (!rule.render && !rule.decorator && !rule.validate) {
      rule = { render: rule };
    }

    rule.render = normalizeMarkComponent(rule.render);
    rule.match = function (object) {
      return object.kind == 'mark' && object.type == key;
    };
    rules.push(rule);
  };

  for (var key in marks) {
    _loop2(key);
  }

  return rules;
}

/**
 * Normalize a mark `render` property.
 *
 * @param {Component|Function|Object|String} render
 * @return {Component}
 */

function normalizeMarkComponent(render) {
  if ((0, _isReactComponent2.default)(render)) return render;

  switch ((0, _typeOf2.default)(render)) {
    case 'function':
      return render;
    case 'object':
      return function (props) {
        return _react2.default.createElement(
          'span',
          { style: render },
          props.children
        );
      };
    case 'string':
      return function (props) {
        return _react2.default.createElement(
          'span',
          { className: render },
          props.children
        );
      };
  }
}

/**
 * Export.
 *
 * @type {Schema}
 */

exports.default = Schema;