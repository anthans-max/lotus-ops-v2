import type { Browser } from 'puppeteer-core'

let _browser: Browser | null = null

export async function getBrowser(): Promise<Browser> {
  if (_browser) return _browser

  if (process.env.VERCEL) {
    const chromium = await import('@sparticuz/chromium')
    const puppeteerCore = await import('puppeteer-core')
    _browser = await puppeteerCore.default.launch({
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(),
      headless: true,
    })
  } else {
    // Local only — puppeteer installed as devDependency
    const { execSync } = await import('child_process')
    const puppeteer = await import('puppeteer')
    _browser = await puppeteer.default.launch({ headless: true }) as unknown as Browser
  }

  return _browser
}
