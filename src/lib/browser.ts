import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';

let _browser: any = null;

export async function getBrowser() {
  if (_browser) return _browser;

  _browser = await puppeteerCore.launch({
    args: chromium.args,
    executablePath: process.env.VERCEL
      ? await chromium.executablePath()
      : '/usr/bin/chromium-browser', // or '/usr/bin/google-chrome' locally
    headless: true,
  });

  return _browser;
}
