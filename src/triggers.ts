import * as express from 'express';
import {fetchSync} from 'cheerio-httpcli';

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

const baseUrl        = 'https://www.animate-onlineshop.jp/calendar/';
const countPerPage   = 200;

export const scraping = (request: any, response: any) => {
    const releaseItems = fetchMusicReleaseItems(2018, 8);
    return response.json({ music: releaseItems })
};

function fetchMusicReleaseItems(year: number, month: number) {
    return fetchAnimateReleaseItems(ANIMATE_CATEGORY_MUCIC, year, month);
}

function fetchAnimateReleaseItems(category: number, year: number, month: number, pageNo: number = 1) {
    const fetchResult = fetchSync(baseUrl, {
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
    // Get ReleaseItems
    let releaseItems: object[] = [];
    const $ = fetchResult.$;
    const tableElement = $("div[class='calender_list_table'] > table > tbody > tr");
    tableElement.each((i: number, element: CheerioElement) => {
        let releaseItem: {[key: string]: string} = {};
        element.children.forEach((child: CheerioElement) => {
            if (child.attribs == undefined || child.tagName == 'th') {
                return;
            }
            releaseItem[child.attribs.class] = $(child).text().trim(); // remove useless space
        });
        releaseItems.push(releaseItem);
    });
    // Check Paging
    const pagingElements = $("div[class='content_pager'] > div");
    pagingElements.each((i: number, element: CheerioElement) => {
        let maxPageNo = 1;
        element.children.forEach((child: CheerioElement) => {
            const pageLinkText = $(child).text();
            if (pageLinkText == "<<前へ" || pageLinkText == "次へ>>") {
                return;
            }
            if (maxPageNo < parseInt(pageLinkText)) {
                maxPageNo = parseInt(pageLinkText)
            }
        });
        if (maxPageNo != pageNo) {
            const nextPageReleaseItems = fetchAnimateReleaseItems(category, year, month, pageNo+1);
            releaseItems = [ ...releaseItems, ...nextPageReleaseItems];
        }
    })
    return releaseItems;
}

export const createApp = () => {
    let app = express();
    app.get('/haruka', scraping);
    return app;
}
