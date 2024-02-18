import puppeteer from 'puppeteer';

export default class PuppeteerService {
  constructor() {
    this.browser = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      // args: [
      //   '--proxy-server=socks5://62.109.31.192:20000',
      // ],
    });
  }

  getBrowser() {
    return this.browser;
  }
}