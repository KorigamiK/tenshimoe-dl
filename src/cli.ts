import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { search_and_downlaod } from './app'

let args = yargs(hideBin(process.argv))
    .help()
    .option('search', {
        alias: 's',
        required: true,
        type: 'array',
        desc: 'Anime name to search',
    })
    .option('ep_start', {
        alias: 'st',
        type: 'number',
        desc: 'Episode number to start from. Default: gets last',
        default: -1
    })
    .option('ep_end', {
        alias: 'ed',
        type: 'number',
        desc: 'Episode number to end to. Default: gets last',
        default: undefined
    })
    .option('quality', {
        alias: 'q',
        type: 'string',
        desc: 'Defults to the .env variable. 360p, 480p, 720p, etc.',
        default: null
    })
    .option('opt', {
        alias: 'o',
        type: 'number',
        desc: 'The search result index.',
        default: undefined
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging'
    })
    .argv;

(async () => console.log(await 
    search_and_downlaod(args.search.join(' '), args.opt, args.ep_start, args.ep_end, args.quality)
    ))();