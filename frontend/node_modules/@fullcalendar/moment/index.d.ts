import { CalendarApi, Duration, PluginDef } from '@fullcalendar/core';
import moment from 'moment';

declare function toMoment(date: Date, calendar: CalendarApi): moment.Moment;
declare function toMomentDuration(fcDuration: Duration): moment.Duration;

declare const _default: PluginDef;
//# sourceMappingURL=index.d.ts.map

export { _default as default, toMoment, toMomentDuration };
