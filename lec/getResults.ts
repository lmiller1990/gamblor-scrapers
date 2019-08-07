import * as puppeteer from "puppeteer";

import { options, args } from "./options";
// import { getHistoricalGames } from "./getGames";

type TObjective = "blood" | "turret" | "dragon" | "baron";
interface IFirstObjective {
  team: "blue" | "red" | null;
  objective: TObjective;
}

const getFirstObjective = async (
  page: puppeteer.Page,
  objective: TObjective
): Promise<IFirstObjective> => {
    page.evaluate(`
    Object.defineProperty(
      window, 
      'objective', { 
        get() { 
          return '${objective}' 
        }
      })
  `);

  const firstObjective = await page.$$eval<IFirstObjective>(
    "image",
    (images: SVGImageElement[]) => {

      const first = images.reduce<SVGImageElement>((acc, image) => {
        if (!image.href.baseVal.includes(`${objective}_`)) {
          return acc;
        }

        if (!acc) {
          // found the first candidate
          return image
        }

        if (image.x.baseVal < acc.x.baseVal) {
          return image;
        }

        return acc;
      }, null);

      return {
        team: first ? first.href.baseVal.includes("100") ? "blue" : "red" : null,
        objective
      };
    }
  );

  return firstObjective;
};

const getResults = async (matchHistoryLink: string) => {
  const browser: puppeteer.Browser = await puppeteer.launch({
    ...options,
    headless: true
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36"
  );

  await page.goto(matchHistoryLink, { waitUntil: "load" });
  // this is the container with the timeline containing first blood, dragon etc...
  // const rendered = await page.waitForSelector("#graph-switcher-262-container");
  await page.waitForSelector(".team-100-kills-bg");

  const objective = "dragon"

  const result = await getFirstObjective(page, objective);

  console.log(`first ${objective}`, result);
};

(async () => {
  await getResults(
    "https://matchhistory.na.leagueoflegends.com/en/#match-details/ESPORTSTMNT04/990663?gameHash=31d15a7905470d96"
    // "https://matchhistory.na.leagueoflegends.com/en/#match-details/ESPORTSTMNT04/990638?gameHash=f5ea274ad9ef38ef&tab=overview"
  );
})();
