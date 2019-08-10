import axios from "axios";
import fs from "fs";

import { IGame } from "./game";
import { Moment } from "moment";
import { buildGameFromCsv, ICsvGame } from "./buildGame";
import { ITeam } from "./team";

const apiRoot = "http://localhost:3000";

const getGames = async (start: Moment, end: Moment): Promise<IGame[]> => {
  const f = (m: Moment): string => m.format("YYYY-MM-DD HH:mm:ss");

  const { data } = await axios.get<IGame[]>(
    `${apiRoot}/api/v1/games?start=${f(start)}&end=${f(end)}`
  );
  return data;
};

const buildGamesFromCsv = (teams: ITeam[]): ICsvGame[] => {
  return fs
    .readFileSync("./games.csv", "utf8")
    .split("\n")
    .filter(x => x.includes("GMT"))
    .map(csv => buildGameFromCsv(csv, teams));
};

const gamesContainSameTeams = (g1: IGame, g2: IGame): boolean => {
  const [g1Blue, g1Red] = [g1.blueSideTeamId, g1.redSideTeamId].sort();
  const [g2Blue, g2Red] = [g2.blueSideTeamId, g2.redSideTeamId].sort();

  return g1Blue == g2Blue && g1Red == g2Red;
};

export { getGames, buildGamesFromCsv, gamesContainSameTeams };
