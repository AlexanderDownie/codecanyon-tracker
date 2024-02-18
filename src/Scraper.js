import * as cheerio from 'cheerio';
import PuppeteerService from './PuppeteerService.js';

export default class Scraper {
    static async getListing(url) {
        return new Promise(async (resolve, reject) => {
            let browser;
            let html;

            try {
                // Load custom Puppeteer service
                const Puppeteer = new PuppeteerService();

                // Init browser
                await Puppeteer.init();

                // Get browser
                browser = Puppeteer.getBrowser();
            } catch (error) {
                console.log(error)
                resolve(this.response(false, {}, "Browser failed to initialize"));
            }

            try {
                // Load page
                const page = await browser.newPage();
                await page.goto(url);
                await page.waitForSelector('.item-header__sales-count');
                html = await page.content();

                // Finish with browser
                await browser.close();
            } catch (error) {
                console.log(error)
                resolve(this.response(false, {}, "Page failed to load"));
            }

            try {
                // load cheerio
                const $ = cheerio.load(html);

                // Extract sales count
                const sales = $('.item-header__sales-count strong').text().trim();

                // Extract price
                const price = $('.js-purchase-price').text().trim().replace('$', '');

                const updateHistory = $('.js-meta-attributes');

                // Extract dates
                const lastUpdateString = updateHistory.find('.js-condense-item-page-info-panel--last_update time').attr('datetime');
                const publishedString = updateHistory.find('.js-condense-item-page-info-panel--created-at span').text().trim();

                // Convert to timestamp
                const lastUpdate = new Date(lastUpdateString);
                const published = new Date(publishedString);

                // Success
                resolve(this.response(true, {
                    sales: sales,
                    price: price,
                    lastUpdate: lastUpdate,
                    published: published
                }))
            } catch (error) {
                console.log(error)
                resolve(this.response(false, {}, "Failed to extract data from page"));
            }
        });
    }

    static response(isSuccess, data = {}, error = "") {
        // Current timestamp
        const timestamp = new Date();

        return {
            success: isSuccess,
            timestamp: timestamp,
            data: data,
            error: error
        }
    }
}