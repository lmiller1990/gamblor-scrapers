import { ITeam } from "./team";

export interface IGame {
  id?: number
  firstBloodTeamId?: number
  firstTurretTeamId?: number
  date: Date
  createdAt: Date
  updatedAt: Date
  winnerId?: number
  loserId?: number
  redSideTeamId: number
  blueSideTeamId: number
  firstBaronTeamId?: number
  firstDragonTeamId?: number
  leagueId?: number
  gameid?: number
  splitId?: number
  fbOdds?: number
  ftOdds?: number
  fdOdds?: number
  fbaronOdds?: number
  redSideTeamFbOdds?: number
  redSideTeamFtOdds?: number
  redSideTeamFdOdds?: number
  redSideTeamFbaronOdds?: number
  redSideTeamWinOdds?: number
  blueSideTeamFbOdds?: number;
  blueSideTeamFtOdds?: number
  blueSideTeamFdOdds?: number
  blueSideTeamFbaronOdds?: number
  blueSideTeamWinOdds?: number
  blueSideWinOdds?: number
  redSideWinOdds?: number
  gameNumber?: number
  matchUuid?: string
  teams?: ITeam[]
}
