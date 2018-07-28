import { fetch } from 'cheerio-httpcli';
import { CronJob } from 'cron';
import * as fs from 'fs';
import { dirname as getDirName } from 'path';
import * as mkdirp from 'mkdirp';
import * as util from 'util';

// -------------------
// animate online shop
// -------------------
const ANIMATE_CATEGORY_GOODS  = 1;
const ANIMATE_CATEGORY_MOVIE  = 2;
const ANIMATE_CATEGORY_MUCIC  = 3;
const ANIMATE_CATEGORY_BOOK   = 4;
const ANIMATE_CATEGORY_FIGURE = 5;
const ANIMATE_CATEGORY_GAME   = 6;
const ANIMATE_CATEGORY_TICKET = 7;

const animateOnlineShopUrl    = 'https://www.animate-onlineshop.jp/calendar/';
const countPerPage   = 200;

// setup cron job
const job = new CronJob('0 */5 * * * *', () => {
    scraping()
});
job.start();

export const fetchAction = async (request: any, response: any) => {
    if (!request.params.year || !request.params.month) {
        response.statusCode = 500;
        return response.json({});
    }
    const year = request.params.year;
    const month = request.params.month;
    const path = getPath(year, month);
    // read cache
    const cache = await readFile(path).catch(async () => {
        await fetchReleaseItems(year, month)
        return await readFile(path)
    });
    return response.json({ result: JSON.parse(cache) })
};

export const scraping = async () => {
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    for(var i=0; i<12; i++) {
        await fetchReleaseItems(year, month)
        // move next month
        month++;
        if (month > 12) {
            month = 1;
            year++;
        }
    }
}

const fetchReleaseItems = async (year: number, month: number) => {
    const releaseItems = await fetchMusicReleaseItems(year, month);
    const path = getPath(year, month);
    await writeFile(path, releaseItems);
}

const fetchMusicReleaseItems = async (year: number, month: number) => {
    return await fetchAnimateReleaseItems(ANIMATE_CATEGORY_MUCIC, year, month);
}

const fetchAnimateReleaseItems = async (category: number, year: number, month: number, pageNo: number = 1) => {
    const fetchResult = await fetch(animateOnlineShopUrl, {
        cc: [category],
        csy: year,
        csm: month,
        cey: year,
        cem: month,
        cl: countPerPage,
        pageno: pageNo,
    });
    if (fetchResult.error) {
        throw fetchResult.error;
    }

    // check year
    let releaseItems: any[] = [];
    if (year < (new Date()).getFullYear()) {
        return releaseItems;
    }

    // get ReleaseItems
    const $ = fetchResult.$;
    const tableElement = $(".calender_list_table > table > tbody > tr");
    tableElement.each((i: number, element: CheerioElement) => {
        let releaseItem: {[key: string]: string} = {};
        element.children.forEach((child: CheerioElement) => {
            if (child.attribs == undefined || child.tagName == 'th') {
                return;
            }
            switch (child.attribs.class) {
                case "date":
                let date: (number|string)[] = [];
                const fullMatches = $(child).text().match(/(\d+)(年)(\d+)(月)(\d+)(日)/);
                if (fullMatches) {
                    date = fullMatches.slice(1).map((elm: number|string) => {
                        return (elm < 10) ? ('0'+elm).slice(-2) : elm;
                    });
                    date = [date[0], date[2], date[4]];
                } else {
                    const partMatches = $(child).text().match(/(\d+)(年)(\d+)(月)(\s+)(\S+)/);
                    if (partMatches) {
                        date = partMatches.slice(1).map((elm: number|string) => {
                            return (elm < 10) ? ('0'+elm).slice(-2) : elm;
                        });
                        date = [date[0], date[2], date[5]];
                    }
                }
                releaseItem[child.attribs.class] = date.join("-");
                break;
                case "category":
                releaseItem[child.attribs.class] = $(child).text().trim();
                break;
                case "name":
                releaseItem[child.attribs.class] = $(child).text().trim();
                break;
                case "title":
                releaseItem[child.attribs.class] = $(child).text().trim();
                break;
            }
        });
        if (Object.keys(releaseItem).length > 0) {
            releaseItems.push(releaseItem);
        }
    });

    // check paging
    const pagingElements = $("div[class='content_pager'] > div");
    let maxPageNo = 1;
    pagingElements.map(async (i: number, element: CheerioElement) => {
        element.children.forEach((child: CheerioElement) => {
            const pageLinkText = $(child).text();
            if (pageLinkText == "<<前へ" || pageLinkText == "次へ>>") {
                return;
            }
            if (maxPageNo < parseInt(pageLinkText)) {
                maxPageNo = parseInt(pageLinkText)
            }
        });
    });
    if (maxPageNo != pageNo) {
        const nextPageReleaseItems = await fetchAnimateReleaseItems(category, year, month, pageNo+1);
        releaseItems = [ ...releaseItems, ...nextPageReleaseItems];
    }

    return releaseItems;
}

export const getPath = (year: number, month: number) => {
    return `cache/${year}_${month}.json`;
}

const readFile = async (path: string) => {
    let result = "";
    await util.promisify(fs.readFile)(path, "utf8").then((data) => {
        result = data;
    });
    return result;
}

const writeFile = async (path: string, data: any) => {
    await util.promisify(mkdirp)(getDirName(path)).then((err) => {
        console.log(err);
        if (err) throw err;
    });
    await util.promisify(fs.writeFile)(path, JSON.stringify(data)).then((err) => {
        if (err) throw err;
    });
}