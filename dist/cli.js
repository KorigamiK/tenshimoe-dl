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
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
const app_1 = require("./app");
let args = yargs_1.default(helpers_1.hideBin(process.argv))
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    return console.log(yield app_1.search_and_downlaod(args.search.join(' '), args.opt, args.ep_start, args.ep_end, args.quality));
}))();
//# sourceMappingURL=cli.js.map