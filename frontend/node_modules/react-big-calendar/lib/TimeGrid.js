"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _callSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/callSuper"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _clsx = _interopRequireDefault(require("clsx"));
var animationFrame = _interopRequireWildcard(require("dom-helpers/animationFrame"));
var _memoizeOne = _interopRequireDefault(require("memoize-one"));
var _react = _interopRequireWildcard(require("react"));
var _position = _interopRequireDefault(require("dom-helpers/position"));
var _width = _interopRequireDefault(require("dom-helpers/width"));
var _DayColumn = _interopRequireDefault(require("./DayColumn"));
var _PopOverlay = _interopRequireDefault(require("./PopOverlay"));
var _TimeGridHeader = _interopRequireDefault(require("./TimeGridHeader"));
var _TimeGridHeaderResources = _interopRequireDefault(require("./TimeGridHeaderResources"));
var _TimeGutter = _interopRequireDefault(require("./TimeGutter"));
var _constants = require("./utils/constants");
var _eventLevels = require("./utils/eventLevels");
var _helpers = require("./utils/helpers");
var _propTypes = require("./utils/propTypes");
var _Resources = _interopRequireDefault(require("./utils/Resources"));
var TimeGrid = exports.default = /*#__PURE__*/function (_Component) {
  function TimeGrid(props) {
    var _this;
    (0, _classCallCheck2.default)(this, TimeGrid);
    _this = (0, _callSuper2.default)(this, TimeGrid, [props]);
    _this.handleScroll = function (e) {
      if (_this.scrollRef.current) {
        _this.scrollRef.current.scrollLeft = e.target.scrollLeft;
      }
    };
    _this.handleResize = function () {
      animationFrame.cancel(_this.rafHandle);
      _this.rafHandle = animationFrame.request(_this.checkOverflow);
    };
    _this.handleKeyPressEvent = function () {
      _this.clearSelection();
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      (0, _helpers.notify)(_this.props.onKeyPressEvent, args);
    };
    _this.handleSelectEvent = function () {
      //cancel any pending selections so only the event click goes through.
      _this.clearSelection();
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      (0, _helpers.notify)(_this.props.onSelectEvent, args);
    };
    _this.handleDoubleClickEvent = function () {
      _this.clearSelection();
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      (0, _helpers.notify)(_this.props.onDoubleClickEvent, args);
    };
    _this.handleShowMore = function (events, date, cell, slot, target) {
      var _this$props = _this.props,
        popup = _this$props.popup,
        onDrillDown = _this$props.onDrillDown,
        onShowMore = _this$props.onShowMore,
        getDrilldownView = _this$props.getDrilldownView,
        doShowMoreDrillDown = _this$props.doShowMoreDrillDown;
      _this.clearSelection();
      if (popup) {
        var position = (0, _position.default)(cell, _this.containerRef.current);
        _this.setState({
          overlay: {
            date: date,
            events: events,
            position: (0, _objectSpread2.default)((0, _objectSpread2.default)({}, position), {}, {
              width: '200px'
            }),
            target: target
          }
        });
      } else if (doShowMoreDrillDown) {
        (0, _helpers.notify)(onDrillDown, [date, getDrilldownView(date) || _constants.views.DAY]);
      }
      (0, _helpers.notify)(onShowMore, [events, date, slot]);
    };
    _this.handleSelectAllDaySlot = function (slots, slotInfo) {
      var onSelectSlot = _this.props.onSelectSlot;
      var start = new Date(slots[0]);
      var end = new Date(slots[slots.length - 1]);
      end.setDate(slots[slots.length - 1].getDate() + 1);
      (0, _helpers.notify)(onSelectSlot, {
        slots: slots,
        start: start,
        end: end,
        action: slotInfo.action,
        resourceId: slotInfo.resourceId
      });
    };
    _this.overlayDisplay = function () {
      _this.setState({
        overlay: null
      });
    };
    _this.checkOverflow = function () {
      if (_this._updatingOverflow) return;
      var content = _this.contentRef.current;
      if (!(content !== null && content !== void 0 && content.scrollHeight)) return;
      var isOverflowing = content.scrollHeight > content.clientHeight;
      if (_this.state.isOverflowing !== isOverflowing) {
        _this._updatingOverflow = true;
        _this.setState({
          isOverflowing: isOverflowing
        }, function () {
          _this._updatingOverflow = false;
        });
      }
    };
    _this.memoizedResources = (0, _memoizeOne.default)(function (resources, accessors) {
      return (0, _Resources.default)(resources, accessors);
    });
    _this.state = {
      gutterWidth: undefined,
      isOverflowing: null
    };
    _this.scrollRef = /*#__PURE__*/_react.default.createRef();
    _this.contentRef = /*#__PURE__*/_react.default.createRef();
    _this.containerRef = /*#__PURE__*/_react.default.createRef();
    _this._scrollRatio = null;
    _this.gutterRef = /*#__PURE__*/(0, _react.createRef)();
    return _this;
  }
  (0, _inherits2.default)(TimeGrid, _Component);
  return (0, _createClass2.default)(TimeGrid, [{
    key: "getSnapshotBeforeUpdate",
    value: function getSnapshotBeforeUpdate() {
      this.checkOverflow();
      return null;
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      if (this.props.width == null) {
        this.measureGutter();
      }
      this.calculateScroll();
      this.applyScroll();
      window.addEventListener('resize', this.handleResize);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener('resize', this.handleResize);
      animationFrame.cancel(this.rafHandle);
      if (this.measureGutterAnimationFrameRequest) {
        window.cancelAnimationFrame(this.measureGutterAnimationFrameRequest);
      }
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.applyScroll();
    }
  }, {
    key: "renderDayColumn",
    value: function renderDayColumn(date, id, resource, groupedEvents, groupedBackgroundEvents, localizer, accessors, components, dayLayoutAlgorithm, now) {
      var _this$props2 = this.props,
        min = _this$props2.min,
        max = _this$props2.max;
      var daysEvents = (groupedEvents.get(id) || []).filter(function (event) {
        return localizer.inRange(date, accessors.start(event), accessors.end(event), 'day');
      });
      var daysBackgroundEvents = (groupedBackgroundEvents.get(id) || []).filter(function (event) {
        return localizer.inRange(date, accessors.start(event), accessors.end(event), 'day');
      });
      return /*#__PURE__*/_react.default.createElement(_DayColumn.default, Object.assign({}, this.props, {
        localizer: localizer,
        min: localizer.merge(date, min),
        max: localizer.merge(date, max),
        resource: resource && id,
        components: components,
        isNow: localizer.isSameDate(date, now),
        key: "".concat(id, "-").concat(date),
        date: date,
        events: daysEvents,
        backgroundEvents: daysBackgroundEvents,
        dayLayoutAlgorithm: dayLayoutAlgorithm
      }));
    }
  }, {
    key: "renderResourcesFirst",
    value: function renderResourcesFirst(range, resources, groupedEvents, groupedBackgroundEvents, localizer, accessors, now, components, dayLayoutAlgorithm) {
      var _this2 = this;
      return resources.map(function (_ref) {
        var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
          id = _ref2[0],
          resource = _ref2[1];
        return range.map(function (date) {
          return _this2.renderDayColumn(date, id, resource, groupedEvents, groupedBackgroundEvents, localizer, accessors, components, dayLayoutAlgorithm, now);
        });
      });
    }
  }, {
    key: "renderRangeFirst",
    value: function renderRangeFirst(range, resources, groupedEvents, groupedBackgroundEvents, localizer, accessors, now, components, dayLayoutAlgorithm) {
      var _this3 = this;
      return range.map(function (date) {
        return /*#__PURE__*/_react.default.createElement("div", {
          style: {
            display: 'flex',
            minHeight: '100%',
            flex: 1
          },
          key: date
        }, resources.map(function (_ref3) {
          var _ref4 = (0, _slicedToArray2.default)(_ref3, 2),
            id = _ref4[0],
            resource = _ref4[1];
          return /*#__PURE__*/_react.default.createElement("div", {
            style: {
              flex: 1
            },
            key: accessors.resourceId(resource)
          }, _this3.renderDayColumn(date, id, resource, groupedEvents, groupedBackgroundEvents, localizer, accessors, components, dayLayoutAlgorithm, now));
        }));
      });
    }
  }, {
    key: "renderEvents",
    value: function renderEvents(range, events, backgroundEvents, now) {
      var _this$props3 = this.props,
        accessors = _this$props3.accessors,
        localizer = _this$props3.localizer,
        resourceGroupingLayout = _this$props3.resourceGroupingLayout,
        components = _this$props3.components,
        dayLayoutAlgorithm = _this$props3.dayLayoutAlgorithm;
      var resources = this.memoizedResources(this.props.resources, accessors);
      var groupedEvents = resources.groupEvents(events);
      var groupedBackgroundEvents = resources.groupEvents(backgroundEvents);
      if (!resourceGroupingLayout) {
        return this.renderResourcesFirst(range, resources, groupedEvents, groupedBackgroundEvents, localizer, accessors, now, components, dayLayoutAlgorithm);
      } else {
        return this.renderRangeFirst(range, resources, groupedEvents, groupedBackgroundEvents, localizer, accessors, now, components, dayLayoutAlgorithm);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props$allDayMax;
      var _this$props4 = this.props,
        events = _this$props4.events,
        backgroundEvents = _this$props4.backgroundEvents,
        range = _this$props4.range,
        width = _this$props4.width,
        rtl = _this$props4.rtl,
        selected = _this$props4.selected,
        getNow = _this$props4.getNow,
        resources = _this$props4.resources,
        components = _this$props4.components,
        accessors = _this$props4.accessors,
        getters = _this$props4.getters,
        localizer = _this$props4.localizer,
        min = _this$props4.min,
        max = _this$props4.max,
        showMultiDayTimes = _this$props4.showMultiDayTimes,
        longPressThreshold = _this$props4.longPressThreshold,
        resizable = _this$props4.resizable,
        resourceGroupingLayout = _this$props4.resourceGroupingLayout;
      width = width || this.state.gutterWidth;
      var start = range[0],
        end = range[range.length - 1];
      this.slots = range.length;
      var allDayEvents = [],
        rangeEvents = [],
        rangeBackgroundEvents = [];
      events.forEach(function (event) {
        if ((0, _eventLevels.inRange)(event, start, end, accessors, localizer)) {
          var eStart = accessors.start(event),
            eEnd = accessors.end(event);
          if (accessors.allDay(event) || localizer.startAndEndAreDateOnly(eStart, eEnd) || !showMultiDayTimes && !localizer.isSameDate(eStart, eEnd)) {
            allDayEvents.push(event);
          } else {
            rangeEvents.push(event);
          }
        }
      });
      backgroundEvents.forEach(function (event) {
        if ((0, _eventLevels.inRange)(event, start, end, accessors, localizer)) {
          rangeBackgroundEvents.push(event);
        }
      });
      allDayEvents.sort(function (a, b) {
        return (0, _eventLevels.sortEvents)(a, b, accessors, localizer);
      });
      var headerProps = {
        range: range,
        events: allDayEvents,
        width: width,
        rtl: rtl,
        getNow: getNow,
        localizer: localizer,
        selected: selected,
        allDayMaxRows: this.props.showAllEvents ? Infinity : (_this$props$allDayMax = this.props.allDayMaxRows) !== null && _this$props$allDayMax !== void 0 ? _this$props$allDayMax : Infinity,
        resources: this.memoizedResources(resources, accessors),
        selectable: this.props.selectable,
        accessors: accessors,
        getters: getters,
        components: components,
        scrollRef: this.scrollRef,
        isOverflowing: this.state.isOverflowing,
        longPressThreshold: longPressThreshold,
        onSelectSlot: this.handleSelectAllDaySlot,
        onSelectEvent: this.handleSelectEvent,
        onShowMore: this.handleShowMore,
        onDoubleClickEvent: this.props.onDoubleClickEvent,
        onKeyPressEvent: this.props.onKeyPressEvent,
        onDrillDown: this.props.onDrillDown,
        getDrilldownView: this.props.getDrilldownView,
        resizable: resizable
      };
      return /*#__PURE__*/_react.default.createElement("div", {
        className: (0, _clsx.default)('rbc-time-view', resources && 'rbc-time-view-resources'),
        ref: this.containerRef
      }, resources && resources.length > 1 && resourceGroupingLayout ? /*#__PURE__*/_react.default.createElement(_TimeGridHeaderResources.default, headerProps) : /*#__PURE__*/_react.default.createElement(_TimeGridHeader.default, headerProps), this.props.popup && this.renderOverlay(), /*#__PURE__*/_react.default.createElement("div", {
        ref: this.contentRef,
        className: "rbc-time-content",
        onScroll: this.handleScroll
      }, /*#__PURE__*/_react.default.createElement(_TimeGutter.default, {
        date: start,
        ref: this.gutterRef,
        localizer: localizer,
        min: localizer.merge(start, min),
        max: localizer.merge(start, max),
        step: this.props.step,
        getNow: this.props.getNow,
        timeslots: this.props.timeslots,
        components: components,
        className: "rbc-time-gutter",
        getters: getters
      }), this.renderEvents(range, rangeEvents, rangeBackgroundEvents, getNow())));
    }
  }, {
    key: "renderOverlay",
    value: function renderOverlay() {
      var _this$state$overlay,
        _this$state,
        _this4 = this;
      var overlay = (_this$state$overlay = (_this$state = this.state) === null || _this$state === void 0 ? void 0 : _this$state.overlay) !== null && _this$state$overlay !== void 0 ? _this$state$overlay : {};
      var _this$props5 = this.props,
        accessors = _this$props5.accessors,
        localizer = _this$props5.localizer,
        components = _this$props5.components,
        getters = _this$props5.getters,
        selected = _this$props5.selected,
        popupOffset = _this$props5.popupOffset,
        handleDragStart = _this$props5.handleDragStart;
      var onHide = function onHide() {
        return _this4.setState({
          overlay: null
        });
      };
      return /*#__PURE__*/_react.default.createElement(_PopOverlay.default, {
        overlay: overlay,
        accessors: accessors,
        localizer: localizer,
        components: components,
        getters: getters,
        selected: selected,
        popupOffset: popupOffset,
        ref: this.containerRef,
        handleKeyPressEvent: this.handleKeyPressEvent,
        handleSelectEvent: this.handleSelectEvent,
        handleDoubleClickEvent: this.handleDoubleClickEvent,
        handleDragStart: handleDragStart,
        show: !!overlay.position,
        overlayDisplay: this.overlayDisplay,
        onHide: onHide
      });
    }
  }, {
    key: "clearSelection",
    value: function clearSelection() {
      clearTimeout(this._selectTimer);
      this._pendingSelection = [];
    }
  }, {
    key: "measureGutter",
    value: function measureGutter() {
      var _this5 = this;
      if (this.measureGutterAnimationFrameRequest) {
        window.cancelAnimationFrame(this.measureGutterAnimationFrameRequest);
      }
      this.measureGutterAnimationFrameRequest = window.requestAnimationFrame(function () {
        var _this5$gutterRef;
        var width = (_this5$gutterRef = _this5.gutterRef) !== null && _this5$gutterRef !== void 0 && _this5$gutterRef.current ? (0, _width.default)(_this5.gutterRef.current) : undefined;
        if (width && _this5.state.gutterWidth !== width) {
          _this5.setState({
            gutterWidth: width
          });
        }
      });
    }
  }, {
    key: "applyScroll",
    value: function applyScroll() {
      // If auto-scroll is disabled, we don't actually apply the scroll
      if (this._scrollRatio != null && this.props.enableAutoScroll === true) {
        var content = this.contentRef.current;
        content.scrollTop = content.scrollHeight * this._scrollRatio;
        // Only do this once
        this._scrollRatio = null;
      }
    }
  }, {
    key: "calculateScroll",
    value: function calculateScroll() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
      var min = props.min,
        max = props.max,
        scrollToTime = props.scrollToTime,
        localizer = props.localizer;
      var diffMillis = localizer.diff(localizer.merge(scrollToTime, min), scrollToTime, 'milliseconds');
      var totalMillis = localizer.diff(min, max, 'milliseconds');
      this._scrollRatio = diffMillis / totalMillis;
    }
  }]);
}(_react.Component);
TimeGrid.defaultProps = {
  step: 30,
  timeslots: 2,
  // To be compatible with old versions, default as `false`.
  resourceGroupingLayout: false
};