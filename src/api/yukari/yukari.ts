import { readCache } from '../util';
import * as uuid from 'node-uuid';

export const exportCalendarAction = async (req: any, res: any) => {
    // get current data
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const timestamp = date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '');

    const prevMonthEvents = await createEvents(month == 1 ? year - 1 : year, month == 1 ? 12 : month - 1, timestamp);
    const currentMonthEvents = await createEvents(year, month, timestamp);
    const nextMonthEvents = await createEvents(month == 12 ? year + 1 : year, month == 12 ? 1 : month + 1, timestamp);

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

const createEvents = async (year: number, month: number, timestamp: string): Promise<string> => {
    const cache = await readCache(year, month);
    let eventMetas = {};
    await(async () => {
        cache.forEach(async (c : any) => {
            const uniqueName = await getUniqueName(c.name);
            if (eventMetas.hasOwnProperty(uniqueName)) {
                eventMetas[uniqueName]['desc'].push(c.name);
            } else {
                eventMetas[uniqueName] = {
                    'desc': [ c.name ],
                    'date': c.date,
                };
            }
        });
    })();
    let events = '';
    await(async() => {
        for(const uniqueName in eventMetas) {
            const date = eventMetas[uniqueName]['date'];
            const desc = eventMetas[uniqueName]['desc'].join('\n');
            const startDate = Number(date.replace(/-/g, ''));
            if (!isNaN(startDate)) {
                const uid = uuid.v4();
                const endDate = startDate + 1;
                events += `BEGIN:VEVENT
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDate}
DTSTAMP:${timestamp}
UID:${uid}
CREATED:${timestamp}
DESCRIPTION:${desc}
LAST-MODIFIED:${timestamp}
LOCATION:
SEQUENCE:1
STATUS:CONFIRMED
SUMMARY:${uniqueName}
TRANSP:OPAQUE
END:VEVENT
`
            }
        };
    })();
    return events;
}

const getUniqueName = async (name: string): Promise<string> => {
    let uniqueName = name;
    const baseMatch = uniqueName.match(/【.*】(.*)/);
    if (baseMatch === null) {
        return uniqueName;
    }
    uniqueName = baseMatch[1];

    // ○○盤を削除
    // 原則、直前にスペース等の文字以外が入る
    uniqueName = uniqueName.replace(/(\s+\S+盤(A|B|C|D|E|F|G)?)/g, '');

    // ○○verを削除
    uniqueName = uniqueName.replace(/(\s+\S+(ver|Ver|VER)\.?)/g, '');

    // ○○付を削除
    uniqueName = uniqueName.replace(/(\s+\S+(付き|付))/g, '');

    // アニメイト~を除外
    uniqueName = uniqueName.replace(/アニメイト\S+/g, '');

    // 例外
    const ignores = [
        'CDシングル',
        '7インチアナログレコード',
    ]
    const ignoreReg = new RegExp(ignores.join('|'));
    uniqueName = uniqueName.replace(ignoreReg, '');

    // 先頭と末尾のスペースを削除
    uniqueName = uniqueName.trim();

    return uniqueName;
}