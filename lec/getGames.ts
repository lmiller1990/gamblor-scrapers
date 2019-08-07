import * as puppeteer from "puppeteer"

import { options } from "./options"

const getHistoricalGames = async function main() {
  const browser: puppeteer.Browser = await puppeteer.launch(options)
  const page = await browser.newPage()
  await page.goto("https://lol.gamepedia.com/LEC/2019_Season/Summer_Season")
  // const links = Array.from(await page.$$("a.external"))
  // const els = []
  const links = await page.$$eval("a.external", (links: HTMLAnchorElement[]) => {
    return links.map(a => a.href).filter(x => x.includes("matchhistory"))
  })

  return links
}

export {
  getHistoricalGames
}
