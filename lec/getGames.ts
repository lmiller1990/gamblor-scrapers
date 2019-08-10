import puppeteer from "puppeteer";

import { options } from "./options";

const getHistoricalGames = async (): Promise<string[]> => {
  const browser: puppeteer.Browser = await puppeteer.launch({
    ...options,
    headless: true
  });
  const page = await browser.newPage();
  await page.goto("https://lol.gamepedia.com/LEC/2019_Season/Summer_Season");
  // const links = Array.from(await page.$$("a.external"))
  // const els = []
  const links = await page.$$eval("a.external", (_els: Element[]) => {
    const els = _els as HTMLAnchorElement[];
    return els.map(a => a.href).filter(x => x.includes("matchhistory"));
  });

  await browser.close();
  return links;
};

export { getHistoricalGames };
