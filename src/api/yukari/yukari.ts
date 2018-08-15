import { getChachName, readDatastore } from '../util';
import * as uuid from 'node-uuid';

export const exportCalendarAction = async (req: any, res: any) => {
    // get current data
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;

    const prevMonthEvents = await getEvents(month == 1 ? year - 1 : year, month == 1 ? 12 : month - 1);
    const currentMonthEvents = await getEvents(year, month);
    const nextMonthEvents = await getEvents(month == 12 ? year + 1 : year, month == 12 ? 1 : month + 1);

    const events = prevMonthEvents + currentMonthEvents + nextMonthEvents;
    let result =`BEGIN:VCALENDAR
PRODID:-//ortensia/ ICS//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:CDReleaseCalendar
X-WR-TIMEZONE:Asia/Tokyo
${events}END:VCALENDAR`
    return res.send(result);
}

export const getEvents = async (year: number, month: number): Promise<string> => {
    const date = new Date();
    const dateString = date.toISOString().replace(/[-:.]/g, '');
    const cache = await readCache(year, month);
    let events = "";
    cache.forEach((c : any) => {
        const uid = uuid.v4();
        const name = c.name;
        const startdate = Number(c.date.replace(/-/g, ''));
        const enddate = startdate + 1;
        events += `BEGIN:VEVENT
DTSTART;VALUE=DATE:${startdate}
DTEND;VALUE=DATE:${enddate}
DTSTAMP:${dateString}
UID:${uid}
CREATED:${dateString}
DESCRIPTION:${name}
LAST-MODIFIED:${dateString}
LOCATION:
SEQUENCE:1
STATUS:CONFIRMED
SUMMARY:${name}
TRANSP:OPAQUE
END:VEVENT
`
    });
    return events;
}

const readCache = async (year: number, month: number): Promise<Object[]> => {
    const cacheName = getChachName(year, month);
    return await readDatastore(cacheName).then(res => {
        return res[0].data;
    }).catch(err => {
        console.error(err);
        return [];
    });
}
