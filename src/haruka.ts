import { fetch } from 'cheerio-httpcli';

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
    const releaseItems = await fetchMusicReleaseItems(2018, 8);
    return releaseItems
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

    // Get ReleaseItems
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
                const matches = $(child).text().match(/(\d+)(年)(\d+)(月)(\d+)(日)/);
                if (matches) {
                    date = matches.slice(1).map((elm: number|string) => {
                        return (elm < 10) ? ('0'+elm).slice(-2) : elm;
                    });
                    date = [date[0], date[2], date[4]];
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

    // Check Paging
    const pagingElements = $("div[class='content_pager'] > div");
    pagingElements.map(async (i: number, element: CheerioElement) => {
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
            const nextPageReleaseItems = await fetchAnimateReleaseItems(category, year, month, pageNo+1);
            releaseItems = [ ...releaseItems, ...nextPageReleaseItems];
        }
    });
    return releaseItems;
}
