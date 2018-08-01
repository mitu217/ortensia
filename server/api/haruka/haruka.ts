import * as cheerio from 'cheerio';
import * as fetch from 'node-fetch';
import * as querystring from 'querystring';
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

const animateOnlineShopUrl    = 'https://www.animate-onlineshop.jp/calendar';
const countPerPage   = 200;

// setup cron job
const job = new CronJob('0 */5 * * * *', () => {
    scraping()
});
job.start();

export const fetchAction = async (req: any, res: any) => {
    if (!req.params.year || !req.params.month) {
        return res.sendStatus(404)
    }
    const year = req.params.year;
    const month = req.params.month;
    const path = getPath(year, month);
    // read cache
    const cache = await readFile(path).catch(async (err) => {
        await fetchReleaseItems(year, month);
        /*
        const data = await readFile(path).catch(err => {
            console.log(err);
            return "[]";
        });
        return data;
        */
       return "[]";
    });
    return res.json(JSON.parse(cache));
};

export const scraping = async () => {
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    for(var i=0; i<12; i++) {
        await fetchReleaseItems(year, month);
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
    await writeFile(path, releaseItems).catch(err => {
        console.log(err);
    });
}

const fetchMusicReleaseItems = async (year: number, month: number) => {
    return await fetchAnimateReleaseItems(ANIMATE_CATEGORY_MUCIC, year, month);
}

const fetchAnimateReleaseItems = async (category: number, year: number, month: number, pageNo: number = 1) => {
    let releaseItems: any[] = [];

    // check year
    if (year < (new Date()).getFullYear()) {
        return releaseItems;
    }

    try {
        const queries = querystring.stringify({
            "cc[]": [category],
            "csy": year,
            "csm": month,
            "cey": year,
            "cem": month,
            "cl": countPerPage,
            "pageno": pageNo,
        });
        const res = await fetch(`${animateOnlineShopUrl}?${queries}`);
        const body = await res.text()

        const $ = cheerio.load(body);
        $(".calender_list_table > table > tbody > tr").each((_, row) => {
            if ($(row).children("td").length == 0) {
                return;
            }
            let releaseItem: {[key: string]: string} = {};
            // date
            {
                const $date = $(row).children("td[class=date]").text();
                let date: (number|string)[] = [];
                const fullMatches = $date.match(/(\d+)(年)(\d+)(月)(\d+)(日)/);
                if (fullMatches) {
                    date = fullMatches.slice(1).map((elm: number|string) => {
                        return (elm < 10) ? ('0'+elm).slice(-2) : elm;
                    });
                    date = [date[0], date[2], date[4]];
                } else {
                    const partMatches = $date.match(/(\d+)(年)(\d+)(月)(\s+)(\S+)/);
                    if (partMatches) {
                        date = partMatches.slice(1).map((elm: number|string) => {
                            return (elm < 10) ? ('0'+elm).slice(-2) : elm;
                        });
                        date = [date[0], date[2], date[5]];
                    }
                }
                releaseItem["date"] = date.join("-");
            }
            // category
            {
                const $category = $(row).children("td[class=category]").text();
                releaseItem["category"] = $category.trim();
            }
            // name
            {
                const $name = $(row).children("td[class=name]").text();
                releaseItem["name"] = $name.trim();
            }
            // title
            {
                const $title = $(row).children("td[class=title]").text();
                releaseItem["title"] = $title.trim();
            }
            releaseItems.push(releaseItem);
        });

        // check paging
        let maxPageNo = 1;
        $("div[class='content_pager'] > div").each((_, pager) => {
            $(pager).children().each((_, pagerLink) => {
                const pagerLinkText = $(pagerLink).text();
                if (pagerLinkText == "<<前へ" || pagerLinkText == "次へ>>") {
                    return;
                }
                if (maxPageNo < parseInt(pagerLinkText)) {
                    maxPageNo = parseInt(pagerLinkText)
                }
            });
        });
        if (maxPageNo != pageNo) {
            const nextPageReleaseItems = await fetchAnimateReleaseItems(category, year, month, pageNo+1);
            releaseItems = [ ...releaseItems, ...nextPageReleaseItems];
        }
    } catch(err) {
        console.error(err);
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
        if (err) throw err;
    });
    await util.promisify(fs.writeFile)(path, JSON.stringify(data)).then((err) => {
        if (err) throw err;
    });
}