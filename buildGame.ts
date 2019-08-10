import fs from "fs";
import axios from "axios";

import { IGame } from "./game";
import { ITeam } from "./team";
import { reverseMapper } from "./mapper";
import { lecTracking } from "./endpoints";

export interface ICsvGame {
  game: IGame;
  csv: string;
}

const getTeams = async (): Promise<ITeam[]> => {
  const res = await axios.get<ITeam[]>(`${lecTracking}/teams`);
  return res.data;
};

const getTeamByTeamShortName = (shortName: string, teams: ITeam[]): ITeam => {
  const team = teams.find(
    x => x.name.toLowerCase() === reverseMapper[shortName]
  );
  if (!team) {
    throw Error(`Team for ${shortName} not found!`);
  }
  return team;
};

const buildGameFromCsv = (csv: string, teams: ITeam[]): ICsvGame => {
  const fields = csv.toLowerCase().split(",");
  const date = fields[0];
  const blueTeam = fields[1];
  const redTeam = fields[2];
  const blood = fields[3];
  const dragon = fields[4];
  const turret = fields[5];
  const herald = fields[6];
  const baron = fields[7];
  const win = fields[8];
  const lose = fields[9];

  return {
    csv,
    game: {
      date: new Date(date),
      createdAt: new Date(date),
      updatedAt: new Date(),
      blueSideTeamId: getTeamByTeamShortName(blueTeam, teams).id,
      redSideTeamId: getTeamByTeamShortName(redTeam, teams).id,
      firstBloodTeamId: blood
        ? getTeamByTeamShortName(blood, teams).id
        : undefined,
      firstDragonTeamId: dragon
        ? getTeamByTeamShortName(dragon, teams).id
        : undefined,
      firstBaronTeamId: baron
        ? getTeamByTeamShortName(baron, teams).id
        : undefined,
      firstTurretTeamId: turret
        ? getTeamByTeamShortName(turret, teams).id
        : undefined,
      winnerId: win ? getTeamByTeamShortName(win, teams).id : undefined,
      loserId: lose ? getTeamByTeamShortName(lose, teams).id : undefined,
      gameNumber: 1,
      leagueId: 1,
      splitId: 1
    }
  };
};

export { buildGameFromCsv, getTeams };
