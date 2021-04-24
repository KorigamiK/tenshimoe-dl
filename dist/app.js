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
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
const cheerio_1 = __importDefault(require("cheerio"));
const prompt = require('prompt-sync')();
dotenv_1.default.config();
const api_url = "https://tenshi.moe/anime/search";
const tabulate = (data) => {
    let list = [];
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
    let ans = Number(prompt('Enter index: '));
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
const get_eps = (link) => __awaiter(void 0, void 0, void 0, function* () {
    const html = yield (yield node_fetch_1.default(link, { "method": "get" })).text();
    const $ = cheerio_1.default.load(html);
    let ep_list = [];
    $('a').each((index, ele) => {
        if (ele.attribs.href.startsWith(link) && ele.attribs.title) {
            ep_list.push(JSON.parse(JSON.stringify(ele.attribs)));
        }
    });
    return ep_list;
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
const download_one = (episode_link, quality = process.env.quality) => __awaiter(void 0, void 0, void 0, function* () {
    let final;
    // console.log(`starting ${episode_link.split('/').pop()}`);
    (yield get_downloads(episode_link)).forEach(element => {
        if (element.quality === quality) {
            final = element.src;
            return false;
        }
    });
    // console.log(`done ${episode_link.split('/').pop()}`);
    return final;
});
const download_all = (anime_link, quality = process.env.quality) => __awaiter(void 0, void 0, void 0, function* () {
    const eps = yield get_eps(anime_link);
    const tasks = [];
    eps.forEach(ele => {
        tasks.push(download_one(ele.href, quality));
    });
    const results = yield Promise.all(tasks);
    return results;
});
const search_and_downlaod = () => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield search(prompt('Enter anime name: '));
    const needed = tabulate(results);
    const links = yield download_all(needed.url);
    console.log(links);
});
(() => __awaiter(void 0, void 0, void 0, function* () { return console.log(yield search_and_downlaod()); }))();
// (async () => console.log((await search('nagatoro'))))()
//# sourceMappingURL=app.js.map