import { getChachName, readDatastore } from '../util';
import * as uuid from 'node-uuid';

export const exportCalendarAction = async (req: any, res: any) => {
    // get current data
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    // read cache
    const cache = await readCache(year, month);

    let events = "";
    cache.forEach((c : any) => {
        const uid = uuid.v4();
        const name = c.name;
        // TODO: 中旬などの数字以外対応
        const startdate = Number(c.date.replace(/-/g, ''));
        const enddate = startdate + 1;
        events += `BEGIN:VEVENT
DTSTART;VALUE=DATE:${startdate}
DTEND;VALUE=DATE:${enddate}
DTSTAMP:20180815T143718Z
UID:${uid}
CREATED:19000101T120000Z
DESCRIPTION:${name}
LAST-MODIFIED:20180815T143634Z
LOCATION:
SEQUENCE:1
STATUS:CONFIRMED
SUMMARY:${name}
TRANSP:OPAQUE
END:VEVENT
`
    });
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

const readCache = async (year: number, month: number): Promise<Object[]> => {
    const cacheName = getChachName(year, month);
    return await readDatastore(cacheName).then(res => {
        return res[0].data;
    }).catch(err => {
        console.error(err);
        return [];
    });
}

const exportEvent = async (): Promise<string> => {

    return "";
}
