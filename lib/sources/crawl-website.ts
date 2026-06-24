import 'server-only';
import * as cheerio from 'cheerio';

export interface CrawledPage {
    url: string;
    title: string;
    text: string;
}

export interface CrawlOptions {
    maxDepth?: number;
    maxPages?: number;
}

const USER_AGENT =
    'Mozilla/5.0 (compatible; PrizmsolBot/1.0; +https://prizmsol.com/bot)';

function normalizeUrl(raw: string): string {
    try {
        const u = new URL(raw);
        u.hash = '';
        return u.href.replace(/\/$/, '');
    } catch {
        return raw;
    }
}

function resolveUrl(base: string, href: string): string | null {
    try {
        return new URL(href, base).href;
    } catch {
        return null;
    }
}

function isSameDomain(url: string, domain: string): boolean {
    try {
        return new URL(url).hostname === domain;
    } catch {
        return false;
    }
}

function extractContent($: cheerio.CheerioAPI): string {
    $('script, style, nav, footer, header, aside, iframe, noscript').remove();
    const text = $('body').text();
    return text.replace(/\s+/g, ' ').trim();
}

export async function crawlWebsite(
    seedUrl: string,
    options: CrawlOptions = {},
): Promise<CrawledPage[]> {
    const { maxDepth = 2, maxPages = 25 } = options;

    const parsed = new URL(seedUrl);
    const domain = parsed.hostname;
    const normalizedSeed = normalizeUrl(seedUrl);

    const visited = new Set<string>();
    const results: CrawledPage[] = [];
    const queue: [string, number][] = [[normalizedSeed, 0]];

    while (queue.length > 0 && results.length < maxPages) {
        const [url, depth] = queue.shift()!;

        const normalized = normalizeUrl(url);
        if (visited.has(normalized)) continue;
        visited.add(normalized);

        try {
            const page = await fetchPage(normalized);
            if (!page) continue;

            results.push(page);

            if (depth < maxDepth) {
                const links = await extractLinks(normalized, domain);
                for (const link of links) {
                    const nl = normalizeUrl(link);
                    if (!visited.has(nl) && !queue.some(([q]) => normalizeUrl(q) === nl)) {
                        queue.push([nl, depth + 1]);
                    }
                }
            }
        } catch (e) {
            console.warn(`[crawl] Failed to fetch ${normalized}:`, e);
        }
    }

    return results;
}

async function fetchPage(url: string): Promise<CrawledPage | null> {
    const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
        console.warn(`[crawl] HTTP ${res.status} for ${url}`);
        return null;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
        $('title').first().text().trim() ||
        $('h1').first().text().trim() ||
        new URL(url).pathname;

    const text = extractContent($);
    if (!text) return null;

    return { url, title, text };
}

async function extractLinks(url: string, domain: string): Promise<string[]> {
    const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);

    const links = new Set<string>();

    $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;

        const resolved = resolveUrl(url, href);
        if (!resolved) return;

        const normalized = normalizeUrl(resolved);

        if (
            isSameDomain(normalized, domain) &&
            !normalized.includes('#') &&
            !normalized.match(/\.(pdf|zip|png|jpg|jpeg|gif|svg|css|js|ico|woff2?|ttf|eot)$/i)
        ) {
            links.add(normalized);
        }
    });

    return [...links];
}
