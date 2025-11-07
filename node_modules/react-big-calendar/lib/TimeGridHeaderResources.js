"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _callSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/callSuper"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _clsx = _interopRequireDefault(require("clsx"));
var _scrollbarSize = _interopRequireDefault(require("dom-helpers/scrollbarSize"));
var _react = _interopRequireDefault(require("react"));
var _DateContentRow = _interopRequireDefault(require("./DateContentRow"));
var _Header = _interopRequireDefault(require("./Header"));
var _ResourceHeader = _interopRequireDefault(require("./ResourceHeader"));
var _helpers = require("./utils/helpers");
var TimeGridHeaderResources = /*#__PURE__*/function (_React$Component) {
  function TimeGridHeaderResources() {
    var _this;
    (0, _classCallCheck2.default)(this, TimeGridHeaderResources);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = (0, _callSuper2.default)(this, TimeGridHeaderResources, [].concat(args));
    _this.handleHeaderClick = function (date, view, e) {
      e.preventDefault();
      (0, _helpers.notify)(_this.props.onDrillDown, [date, view]);
    };
    return _this;
  }
  (0, _inherits2.default)(TimeGridHeaderResources, _React$Component);
  return (0, _createClass2.default)(TimeGridHeaderResources, [{
    key: "renderHeaderCells",
    value: function renderHeaderCells(range) {
      var _this2 = this;
      var _this$props = this.props,
        localizer = _this$props.localizer,
        getDrilldownView = _this$props.getDrilldownView,
        getNow = _this$props.getNow,
        dayProp = _this$props.getters.dayProp,
        _this$props$component = _this$props.components,
        _this$props$component2 = _this$props$component.header,
        HeaderComponent = _this$props$component2 === void 0 ? _Header.default : _this$props$component2,
        _this$props$component3 = _this$props$component.resourceHeader,
        ResourceHeaderComponent = _this$props$component3 === void 0 ? _ResourceHeader.default : _this$props$component3,
        resources = _this$props.resources,
        accessors = _this$props.accessors,
        events = _this$props.events,
        rtl = _this$props.rtl,
        selectable = _this$props.selectable,
        components = _this$props.components,
        getters = _this$props.getters,
        resizable = _this$props.resizable;
      var today = getNow();
      var groupedEvents = resources.groupEvents(events);
      return range.map(function (date, idx) {
        var drilldownView = getDrilldownView(date);
        var label = localizer.format(date, 'dayFormat');
        var _dayProp = dayProp(date),
          className = _dayProp.className,
          style = _dayProp.style;
        var header = /*#__PURE__*/_react.default.createElement(HeaderComponent, {
          date: date,
          label: label,
          localizer: localizer
        });
        return /*#__PURE__*/_react.default.createElement("div", {
          key: idx,
          className: "rbc-time-header-content rbc-resource-grouping"
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: "rbc-row rbc-time-header-cell".concat(range.length <= 1 ? ' rbc-time-header-cell-single-day' : '')
        }, /*#__PURE__*/_react.default.createElement("div", {
          style: style,
          className: (0, _clsx.default)('rbc-header', className, localizer.isSameDate(date, today) && 'rbc-today')
        }, drilldownView ? /*#__PURE__*/_react.default.createElement("button", {
          type: "button",
          className: "rbc-button-link",
          onClick: function onClick(e) {
            return _this2.handleHeaderClick(date, drilldownView, e);
          }
        }, header) : /*#__PURE__*/_react.default.createElement("span", null, header))), /*#__PURE__*/_react.default.createElement("div", {
          className: "rbc-row"
        }, resources.map(function (_ref, idx) {
          var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
            id = _ref2[0],
            resource = _ref2[1];
          return /*#__PURE__*/_react.default.createElement("div", {
            key: "resource_".concat(id, "_").concat(idx),
            className: (0, _clsx.default)('rbc-header', className, localizer.isSameDate(date, today) && 'rbc-today')
          }, /*#__PURE__*/_react.default.createElement(ResourceHeaderComponent, {
            index: idx,
            label: accessors.resourceTitle(resource),
            resource: resource
          }));
        })), /*#__PURE__*/_react.default.createElement("div", {
          className: "rbc-row rbc-m-b-negative-3 rbc-h-full"
        }, resources.map(function (_ref3, idx) {
          var _ref4 = (0, _slicedToArray2.default)(_ref3, 2),
            id = _ref4[0],
            resource = _ref4[1];
          // Filter the grouped events by the current date.
          var filteredEvents = (groupedEvents.get(id) || []).filter(function (event) {
            return localizer.isSameDate(event.start, date) || localizer.isSameDate(event.end, date);
          });
          return /*#__PURE__*/_react.default.createElement(_DateContentRow.default, {
            key: "resource_".concat(id, "_").concat(idx),
            isAllDay: true,
            rtl: rtl,
            getNow: getNow,
            minRows: 2,
            maxRows: _this2.props.allDayMaxRows + 1,
            range: [date] // This ensures that only the single day is rendered
            ,
            events: filteredEvents // Only show filtered events for this day.
            ,
            resourceId: resource && id,
            className: "rbc-allday-cell",
            selectable: selectable,
            selected: _this2.props.selected,
            components: components,
            accessors: accessors,
            getters: getters,
            localizer: localizer,
            onSelect: _this2.props.onSelectEvent,
            onShowMore: _this2.props.onShowMore,
            onDoubleClick: _this2.props.onDoubleClickEvent,
            onKeyDown: _this2.props.onKeyPressEvent,
            onSelectSlot: _this2.props.onSelectSlot,
            longPressThreshold: _this2.props.longPressThreshold,
            resizable: resizable
          });
        })));
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
        width = _this$props2.width,
        rtl = _this$props2.rtl,
        range = _this$props2.range,
        scrollRef = _this$props2.scrollRef,
        isOverflowing = _this$props2.isOverflowing,
        TimeGutterHeader = _this$props2.components.timeGutterHeader;
      var style = {};
      if (isOverflowing) {
        style[rtl ? 'marginLeft' : 'marginRight'] = "".concat((0, _scrollbarSize.default)() - 1, "px");
      }
      return /*#__PURE__*/_react.default.createElement("div", {
        style: style,
        ref: scrollRef,
        className: (0, _clsx.default)('rbc-time-header', isOverflowing && 'rbc-overflowing')
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "rbc-label rbc-time-header-gutter",
        style: {
          width: width,
          minWidth: width,
          maxWidth: width
        }
      }, TimeGutterHeader && /*#__PURE__*/_react.default.createElement(TimeGutterHeader, null)), this.renderHeaderCells(range));
    }
  }]);
}(_react.default.Component);
var _default = exports.default = TimeGridHeaderResources;