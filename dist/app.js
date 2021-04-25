"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search_and_downlaod = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
const cheerio_1 = __importDefault(require("cheerio"));
const prompt = require('prompt-sync')();
dotenv_1.default.config();
const api_url = "https://tenshi.moe/anime/search";
const tabulate = (data, option = null) => {
    let list = [];
    if (option !== null) {
        console.log(data[option].title);
        return data[option];
    }
    data.forEach(element => {
        let e = {};
        for (const attr in element) {
            if (!(['url', 'cover', 'genre'].includes(attr))) {
                e[attr] = element[attr];
            }
        }
        list.push(e);
    });
    console.table(list);
    let ans = option ? option : Number(prompt('Enter index: '));
    console.log(data[ans].title);
    return data[ans];
};
const search = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (yield node_fetch_1.default(api_url, {
        "headers": {
            "x-csrf-token": process.env.x_csrf_token,
            "x-requested-with": "XMLHttpRequest",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "cookie": `XSRF-TOKEN=${process.env.XSRF_TOKEN}`
        },
        "body": `q=${query}`,
        "method": "POST",
    })).json();
    return data;
});
const get_eps = (link, _get_other_pages = true) => __awaiter(void 0, void 0, void 0, function* () {
    const html = yield (yield node_fetch_1.default(link, { "method": "get" })).text();
    const $ = cheerio_1.default.load(html);
    let ep_list = [];
    $('a').each((index, ele) => {
        if (ele.attribs.href.startsWith(link.split('?')[0]) && ele.attribs.title) {
            ep_list.push(JSON.parse(JSON.stringify(ele.attribs)));
        }
    });
    // console.log(ep_list.length)
    let more_links = [];
    if (_get_other_pages) {
        let pages = new Set();
        $('.page-link').each((index, ele) => {
            if (ele.attribs.href) {
                pages.add(ele.attribs.href);
            }
        });
        let tasks = [];
        // console.log(pages)
        pages.forEach((url) => {
            tasks.push(get_eps(url, false));
        });
        const more_links_list = yield Promise.all(tasks);
        more_links_list.forEach(ele => { more_links = [...more_links, ...ele]; });
    }
    return [...ep_list, ...more_links];
});
const get_downloads = (ep_link) => __awaiter(void 0, void 0, void 0, function* () {
    const html = yield (yield node_fetch_1.default(ep_link, { "method": "get" })).text();
    const $ = cheerio_1.default.load(html);
    let dow_list = [];
    $('#player > source').each((index, ele) => {
        dow_list.push({
            src: ele.attribs.src,
            quality: ele.attribs.title,
            type: ele.attribs.type
        });
    });
    return dow_list;
});
const download_one = (episode_link, title, quality = process.env.quality) => __awaiter(void 0, void 0, void 0, function* () {
    let final;
    // console.log(`starting ${episode_link.split('/').pop()}`);
    quality = quality ? quality : process.env.quality;
    (yield get_downloads(episode_link)).forEach(element => {
        if (element.quality === quality) {
            final = element.src;
            return false;
        }
    });
    // console.log(`done ${episode_link.split('/').pop()}`);
    let ret = {};
    ret[title.replace('Watch', '').trim()] = final;
    return ret;
});
const download_all = (anime_link, start = undefined, end = undefined, quality = process.env.quality) => __awaiter(void 0, void 0, void 0, function* () {
    start = start > 0 ? start - 1 : -1;
    const eps = yield get_eps(anime_link);
    const tasks = [];
    eps.slice(start, end).forEach(ele => {
        tasks.push(download_one(ele.href, ele.title, quality));
        // console.log(ele.href, ele.title, quality)
    });
    const results = yield Promise.all(tasks);
    return results;
});
const search_and_downlaod = (query = null, option = null, start_ep = undefined, end_ep = undefined, quality = undefined) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield search(query ? query : prompt('Enter anime name: '));
    const needed = tabulate(results, option);
    const links = yield download_all(needed.url, start_ep, end_ep, quality);
    console.log(links);
    return `Got ${links.length} links`;
});
exports.search_and_downlaod = search_and_downlaod;
if (require.main === module) {
    (() => __awaiter(void 0, void 0, void 0, function* () { return console.log(yield exports.search_and_downlaod('naruto', 0, 200, 202, undefined)); }))();
    // (async () => await get_eps('https://tenshi.moe/anime/kjfrhu3s'))()
}
//# sourceMappingURL=app.js.map