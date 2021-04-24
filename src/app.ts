import fetch from 'node-fetch';
import dotenv from "dotenv";
import * as interfaces from './utils/interfaces'
import cheerio from 'cheerio';
const prompt = require('prompt-sync')();

dotenv.config();

const api_url = "https://tenshi.moe/anime/search"

const tabulate = (data: interfaces.search_results): interfaces.search_result => {
    let list = []
    data.forEach(element => {
        let e = {}
        for (const attr in element){
            if (!(['url', 'cover', 'genre'].includes(attr))) {e[attr] = element[attr]}
        }
        list.push(e)
    });
    console.table(list)
    let ans = Number(prompt('Enter index: '))
    return data[ans]
}

const search = async (query: string): Promise<interfaces.search_results> => {
    const data = await (await fetch(api_url, {
        "headers": {
            "x-csrf-token": process.env.x_csrf_token,
            "x-requested-with": "XMLHttpRequest",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "cookie": `XSRF-TOKEN=${process.env.XSRF_TOKEN}`
        },
        "body": `q=${query}`,
        "method": "POST",
    })).json();
    return data
}

const get_eps = async (link: string): Promise<interfaces.episodes> => {
    const html = await (await fetch(link, { "method": "get" })).text()
    const $ = cheerio.load(html)
    let ep_list = []
    $('a').each((index, ele) => {
        if (ele.attribs.href.startsWith(link) && ele.attribs.title) {
            ep_list.push(JSON.parse(JSON.stringify(ele.attribs)))
        }
    })
    return ep_list
}

const get_downloads = async (ep_link: string): Promise<interfaces.downloads> => {
    const html = await (await fetch(ep_link, { "method": "get" })).text()
    const $ = cheerio.load(html)
    let dow_list = []
    $('#player > source').each((index, ele) => {
        dow_list.push({
            src: ele.attribs.src,
            quality: ele.attribs.title,
            type: ele.attribs.type
        })
    })
    return dow_list
}

const download_one = async (episode_link: string, quality: string=process.env.quality) => {
    let final: string;
    // console.log(`starting ${episode_link.split('/').pop()}`);
    (await get_downloads(episode_link)).forEach(element => {
        if (element.quality === quality) {
            final = element.src
            return false
        }
    });
    // console.log(`done ${episode_link.split('/').pop()}`);
    return final
}

const download_all = async (anime_link: string, quality: string= process.env.quality) => {
    const eps = await get_eps(anime_link)
    const tasks = []
    eps.forEach(ele => {
        tasks.push(download_one(ele.href, quality))
    })
    const results = await Promise.all(tasks)
    return results 
}

const search_and_downlaod = async () => {
    const results = await search(prompt('Enter anime name: '))
    const needed = tabulate(results)
    const links = await download_all(needed.url)
    console.log(links)
    return `Got ${links.length} links`
}

(async () => console.log(await search_and_downlaod()))();
// (async () => console.log((await search('nagatoro'))))()
