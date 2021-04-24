export interface search_result {
    url: string,
    title: string,
    cover: string,
    genre: string,
    year: number,
    type: string,
    eps: string,
    cen: string
}

export interface search_results extends Array<search_result>{
}

interface episode {
    href: string,
    title: string
}

export interface episodes extends Array<episode> {
}

interface download {
    src: string,
    quality: string,
    type: string
}

export interface downloads extends Array<download> {
}
