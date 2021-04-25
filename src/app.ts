import fetch from 'node-fetch';
import dotenv from "dotenv";
import * as interfaces from './utils/interfaces'
import cheerio from 'cheerio';
const prompt = require('prompt-sync')();

dotenv.config();

const api_url = "https://tenshi.moe/anime/search"

const tabulate = (data: interfaces.search_results, option=null): interfaces.search_result => {
    let list = []
    if (option !== null) {console.log(data[option].title); return data[option]}
    data.forEach(element => {
        let e = {}
        for (const attr in element){
            if (!(['url', 'cover', 'genre'].includes(attr))) {e[attr] = element[attr]}
        }
        list.push(e)
    });
    console.table(list)
    let ans = option ? option : Number(prompt('Enter index: '))
    console.log(data[ans].title)
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

const get_eps = async (link: string, _get_other_pages: boolean=true): Promise<interfaces.episodes> => {
    const html = await (await fetch(link, { "method": "get" })).text()
    const $ = cheerio.load(html)
    let ep_list = []
    $('a').each((index, ele) => {
        if (ele.attribs.href.startsWith(link.split('?')[0]) && ele.attribs.title) {
            ep_list.push(JSON.parse(JSON.stringify(ele.attribs)))
        }
    })
    // console.log(ep_list.length)
    let more_links = []
    if (_get_other_pages) {
        let pages = new Set()
        $('.page-link').each((index, ele) => {
            if (ele.attribs.href) {pages.add(ele.attribs.href)}
        })
        let tasks = []
        // console.log(pages)
        pages.forEach((url: string) => {
            tasks.push(get_eps(url, false))
        })
        const more_links_list = await Promise.all(tasks)
        more_links_list.forEach(ele => {more_links = [...more_links, ...ele]})
    }
    return [...ep_list, ...more_links]
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

const download_one = async (episode_link: string, title: string, quality: string=process.env.quality) => {
    let final: string;
    // console.log(`starting ${episode_link.split('/').pop()}`);
    quality = quality ? quality : process.env.quality;
    (await get_downloads(episode_link)).forEach(element => {
        if (element.quality === quality) {
            final = element.src
            return false
        }
    });
    // console.log(`done ${episode_link.split('/').pop()}`);
    let ret = {}
    ret[title.replace('Watch', '').trim()] = final
    return ret
}

const download_all = async (anime_link: string, start=undefined, end=undefined, quality: string= process.env.quality) => {
    start = start > 0 ? start - 1 : -1
    const eps = await get_eps(anime_link)
    const tasks = []
    eps.slice(start, end).forEach(ele => {
        tasks.push(download_one(ele.href, ele.title, quality))
        // console.log(ele.href, ele.title, quality)
    })
    const results = await Promise.all(tasks)
    return results 
}

export const search_and_downlaod = async (query=null, option=null, start_ep=undefined, end_ep=undefined, quality=undefined) => {
    const results = await search(query ? query : prompt('Enter anime name: '))
    const needed = tabulate(results, option)
    const links: any = await download_all(needed.url, start_ep, end_ep, quality)
    console.log(links)
    return `Got ${links.length} links`
}

if (require.main === module) {
    (async () => console.log(await search_and_downlaod('naruto', 0, 200, 202, undefined)))();
    // (async () => await get_eps('https://tenshi.moe/anime/kjfrhu3s'))()
}

