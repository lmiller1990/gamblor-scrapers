import puppeteer from "puppeteer";
import moment, { Moment } from "moment";
import fs from "fs";

import { options, args } from "./options";
// import { getHistoricalGames } from "./getGames";

interface IGameData {
  date: Moment;
  teams: ITeams;
  blood: IFirstObjective;
  dragon: IFirstObjective;
  turret: IFirstObjective;
  herald: IFirstObjective;
  baron: IFirstObjective;
  blueWin: boolean
  redWin: boolean
}

type TObjective = "blood" | "turret" | "dragon" | "baron" | "herald";

interface IFirstObjective {
  team: "blue" | "red" | null;
  objective: TObjective;
}

interface ITeams {
  blueTeam: string;
  redTeam: string;
}

const getGameDate = async (page: puppeteer.Page): Promise<{ date: Moment }> => {
  const date = await page.$eval(".map-header-date", (_el: Element) => {
    const el = _el as HTMLDivElement;
    return el.innerText.trim();
  });

  return { date: moment(date, "M/D/YYYY") };
};


const getWinLose = async (page: puppeteer.Page): Promise<{ blueWin: boolean, redWin: boolean }> => {
  const [blueRes, redRes] = await page.$$eval(".game-conclusion", (_el: Element[]) => {
    const el = _el as HTMLDivElement[];
    return [el[0].innerText.trim(), el[1].innerText.trim()];
  });

  return {
    blueWin: blueRes.includes("VICTORY"),
    redWin: redRes.includes("VICTORY"),
  }
};

const getFirstBlood = async (
  page: puppeteer.Page
): Promise<IFirstObjective> => {
  const firstObjective = await page.$$eval<IFirstObjective>(
    "circle",
    (_els: Element[]) => {
      const els = _els as SVGCircleElement[];

      const first = els.reduce<SVGCircleElement | null>((acc, circle) => {
        if (!circle.className.baseVal.includes("point kills")) {
          return acc;
        }

        if (!acc) {
          // found the first candidate

          if (circle.className.baseVal.includes("point kills")) {
            return circle;
          }

          return null;
        }

        if (circle.cx.baseVal < acc.cx.baseVal) {
          return circle;
        }

        return acc;
      }, null);

      if (!first) {
        return {
          team: null,
          objective: "blood"
        };
      }

      return {
        team: first
          ? first.className.baseVal.includes("100")
            ? "blue"
            : "red"
          : null,
        objective: "blood"
      };
    }
  );

  return firstObjective
};


const getFirstObjective = async (
  page: puppeteer.Page,
  objective: TObjective
): Promise<IFirstObjective> => {

  page.evaluate(`
      window['objective'] = '${objective}'
  `);

  const firstObjective = await page.$$eval<IFirstObjective>(
    "image",
    (_images: Element[]) => {
      const images = _images as SVGImageElement[];

      const first = images.reduce<SVGImageElement | null>((acc, image) => {
        if (!image.href.baseVal.includes(`${objective}_`)) {
          return acc;
        }

        if (!acc) {
          // found the first candidate

          if (image.href.baseVal.includes(`${objective}_`)) {
            return image;
          }

          return null;
        }

        if (image.x.baseVal < acc.x.baseVal) {
          return image;
        }

        return acc;
      }, null);

      if (!first) {
        return {
          team: null,
          objective
        };
      }

      return {
        team: first
          ? first.href.baseVal.includes("100")
            ? "blue"
            : "red"
          : null,
        objective
      };
    }
  );

  return firstObjective;
};

const getTeams = async (page: puppeteer.Page): Promise<ITeams> => {
  const teams = await page.$$eval<ITeams>(
    ".champion-nameplate-name",
    (_els: Element[]) => {
      const els = _els as HTMLDivElement[];
      // champion names are formatted SK Sacre. So we get the first and last, since blue is always LHS and red RHS.
      // elements 0-4 are blue, and 5-9 are red.
      return {
        blueTeam: els[0].innerText.split(" ")[0],
        redTeam: els[9].innerText.split(" ")[0]
      };
    }
  );

  return teams;
};

const appendToCsv = (data: IGameData): void => {
  const team = (obj: IFirstObjective): string => {
    if (obj.team === "blue") {
      return data.teams.blueTeam;
    }
    if (obj.team === "red") {
      return data.teams.redTeam;
    }

    return "";
  };

  const loser = () => {
    if (!data.redWin) {
      return data.teams.redTeam;
    }
    return data.teams.blueTeam;
  };

  const winner = () => {
    if (data.redWin) {
      return data.teams.redTeam;
    }
    return data.teams.blueTeam;
  };



  fs.appendFileSync("games.csv", "\n");

  fs.appendFileSync(
    "games.csv",
    [
      data.date,
      data.teams.blueTeam,
      data.teams.redTeam,
      team(data.blood),
      team(data.dragon),
      team(data.turret),
      team(data.herald),
      team(data.baron),
      winner(),
      loser()
    ].join(",") + "\n"
  );
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

  const objectives: TObjective[] = [
    "blood",
    "dragon",
    "turret",
    "herald",
    "baron"
  ];

  // unfortunately since we use a single puppeteer instance we need to do this synchro
  // TODO: individual instance for each market, do them all at the same time, 5x faster
  const teams = await getTeams(page);

  // unfortunately blood is not a <image> but a circle so it has it's own function
  const blood = await getFirstBlood(page);
  const turret = await getFirstObjective(page, "turret");
  const dragon = await getFirstObjective(page, "dragon");
  const herald = await getFirstObjective(page, "herald");
  const baron = await getFirstObjective(page, "baron");
  const { blueWin, redWin } = await getWinLose(page)

  const { date } = await getGameDate(page);

  const gameData: IGameData = {
    date,
    teams,
    turret,
    dragon,
    herald,
    baron,
    blood,
    blueWin,
    redWin
  };

  appendToCsv(gameData)

  await browser.close();
};

(async () => {
  await getResults(
    "https://matchhistory.na.leagueoflegends.com/en/#match-details/ESPORTSTMNT04/990663?gameHash=31d15a7905470d96"
    // "https://matchhistory.na.leagueoflegends.com/en/#match-details/ESPORTSTMNT04/990638?gameHash=f5ea274ad9ef38ef&tab=overview"
  );
})();
