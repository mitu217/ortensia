import { readCache } from '../util';
import * as uuid from 'node-uuid';

export const exportCalendarAction = async (req: any, res: any) => {
    // get current data
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const timestamp = date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '');

    const prevMonthEvents = await getEvents(month == 1 ? year - 1 : year, month == 1 ? 12 : month - 1, timestamp);
    const currentMonthEvents = await getEvents(year, month, timestamp);
    const nextMonthEvents = await getEvents(month == 12 ? year + 1 : year, month == 12 ? 1 : month + 1, timestamp);

    const events = prevMonthEvents + currentMonthEvents + nextMonthEvents;
    let result =`BEGIN:VCALENDAR
PRODID:-//ortensia/ ICS//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:CD Release Calendar
X-WR-TIMEZONE:Asia/Tokyo
${events}END:VCALENDAR`
    return res.send(result);
}

const getEvents = async (year: number, month: number, timestamp: string): Promise<string> => {
    const cache = await readCache(year, month);
    let events = "";
    cache.forEach((c : any) => {
        const uid = uuid.v4();
        const name = c.name;
        const startDate = Number(c.date.replace(/-/g, ''));
        if (!isNaN(startDate)) {
            const endDate = startDate + 1;
            events += `BEGIN:VEVENT
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDate}
DTSTAMP:${timestamp}
UID:${uid}
CREATED:${timestamp}
DESCRIPTION:${name}
LAST-MODIFIED:${timestamp}
LOCATION:
SEQUENCE:1
STATUS:CONFIRMED
SUMMARY:${name}
TRANSP:OPAQUE
END:VEVENT
`
        }
    });
    return events;
}
