'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index_cjs = require('@fullcalendar/core/index.cjs');
var moment = require('moment');
var internal_cjs = require('@fullcalendar/core/internal.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var moment__default = /*#__PURE__*/_interopDefaultLegacy(moment);

function toMoment(date, calendar) {
    if (!(calendar instanceof internal_cjs.CalendarImpl)) {
        throw new Error('must supply a CalendarApi instance');
    }
    let { dateEnv } = calendar.getCurrentData();
    return convertToMoment(date, dateEnv.timeZone, null, dateEnv.locale.codes[0]);
}
function toMomentDuration(fcDuration) {
    return moment__default["default"].duration(fcDuration); // moment accepts all the props that fc.Duration already has!
}
// Internal Utils
function convertToMoment(input, timeZone, timeZoneOffset, locale) {
    let mom;
    if (timeZone === 'local') {
        mom = moment__default["default"](input);
    }
    else if (timeZone === 'UTC') {
        mom = moment__default["default"].utc(input);
    }
    else if (moment__default["default"].tz) {
        mom = moment__default["default"].tz(input, timeZone);
    }
    else {
        mom = moment__default["default"].utc(input);
        if (timeZoneOffset != null) {
            mom.utcOffset(timeZoneOffset);
        }
    }
    mom.locale(locale);
    return mom;
}

function formatWithCmdStr(cmdStr, arg) {
    let cmd = parseCmdStr(cmdStr);
    if (arg.end) {
        let startMom = convertToMoment(arg.start.array, arg.timeZone, arg.start.timeZoneOffset, arg.localeCodes[0]);
        let endMom = convertToMoment(arg.end.array, arg.timeZone, arg.end.timeZoneOffset, arg.localeCodes[0]);
        return formatRange(cmd, createMomentFormatFunc(startMom), createMomentFormatFunc(endMom), arg.defaultSeparator);
    }
    return convertToMoment(arg.date.array, arg.timeZone, arg.date.timeZoneOffset, arg.localeCodes[0]).format(cmd.whole); // TODO: test for this
}
function createMomentFormatFunc(mom) {
    return (cmdStr) => (cmdStr ? mom.format(cmdStr) : '' // because calling with blank string results in ISO8601 :(
    );
}
function parseCmdStr(cmdStr) {
    let parts = cmdStr.match(/^(.*?)\{(.*)\}(.*)$/); // TODO: lookbehinds for escape characters
    if (parts) {
        let middle = parseCmdStr(parts[2]);
        return {
            head: parts[1],
            middle,
            tail: parts[3],
            whole: parts[1] + middle.whole + parts[3],
        };
    }
    return {
        head: null,
        middle: null,
        tail: null,
        whole: cmdStr,
    };
}
function formatRange(cmd, formatStart, formatEnd, separator) {
    if (cmd.middle) {
        let startHead = formatStart(cmd.head);
        let startMiddle = formatRange(cmd.middle, formatStart, formatEnd, separator);
        let startTail = formatStart(cmd.tail);
        let endHead = formatEnd(cmd.head);
        let endMiddle = formatRange(cmd.middle, formatStart, formatEnd, separator);
        let endTail = formatEnd(cmd.tail);
        if (startHead === endHead && startTail === endTail) {
            return startHead +
                (startMiddle === endMiddle ? startMiddle : startMiddle + separator + endMiddle) +
                startTail;
        }
    }
    let startWhole = formatStart(cmd.whole);
    let endWhole = formatEnd(cmd.whole);
    if (startWhole === endWhole) {
        return startWhole;
    }
    return startWhole + separator + endWhole;
}

var index = index_cjs.createPlugin({
    name: '@fullcalendar/moment',
    cmdFormatter: formatWithCmdStr,
});

exports["default"] = index;
exports.toMoment = toMoment;
exports.toMomentDuration = toMomentDuration;
