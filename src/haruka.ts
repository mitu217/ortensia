import { fetch } from 'cheerio-httpcli';
import * as fs from 'fs';

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

const animateOnlineShopUrl        = 'https://www.animate-onlineshop.jp/calendar/';
const countPerPage   = 200;

export const scraping = async () => {
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    for(var i=0; i<12; i++) {
        const releaseItems = await fetchMusicReleaseItems(year, month);
        const path = `${year}_${month}.json`;
        await writeFile(path, releaseItems);
        // move next month
        month++;
        if (month > 12) {
            month = 1;
            year++;
        }
    }
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

    // get ReleaseItems
    let releaseItems: object[] = [];
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
                        console.log(partMatches);
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
        releaseItems.push(releaseItem);
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

const writeFile = async (path: string, data: any) => {
    await fs.writeFile(path, JSON.stringify(data), (err) => {
        if (err) {
            throw err
        }
    });
}