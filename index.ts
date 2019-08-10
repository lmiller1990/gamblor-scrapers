import fs from "fs";
import axios from "axios";
import { getHistoricalGames } from "./lec/getGames";
import { getResults } from "./lec/getResults";
import { mapper, reverseMapper } from "./mapper";
import { buildGameFromCsv, getTeams } from "./buildGame";
import { IGame } from "./game";
import moment from "moment";
import {
  getGames,
  buildGamesFromCsv,
  gamesContainSameTeams
} from "./updateGames";
import { lecTracking } from "./endpoints";

const postGame = async (game: IGame): Promise<void> => {
 return axios.post(`${lecTracking}/games`, game);
};

const putGame = async (game: IGame): Promise<void> => {
  console.log(`Posting ${game.id}`);
  axios.put(`${lecTracking}/games/${game.id}`, game);
};

(async () => {
  // get games from API between X and Y day
  // So, if the previous week's games were 2nd til 4th, get those games
  // games from the API do not have results. That's the purpose of this.
  // Once we have the games from the API, we read the games from the CSV.
  // CSV games are scraped from lol.gamepedia, and have results.
  // Now we need to match up the API games and CSV games.
  // Finally, once we did, fill in the first blood/turret etc from CSV games
  // into the API games, then send the API games back to persist to the database.

  // const start = moment(new Date("Fri Aug 02 2019 00:00:00 GMT+1000"));
  // const teams = await getTeams();
  // const gamesFromApi = await getGames(start, start.clone().add("days", 3));

  // const builtGames = buildGamesFromCsv(teams);

  // const gamesToPostBack: IGame[] = [];
  // for (const apiGame of gamesFromApi) {
  //   for (const csvGame of builtGames) {
  //     if (gamesContainSameTeams(apiGame, csvGame.game)) {
  //       // console.log('Found match for ', csvGame.csv)
  //       // merge results from CSV game to API game.
  //       gamesToPostBack.push({
  //         ...apiGame,
  //         firstDragonTeamId: csvGame.game.firstDragonTeamId,
  //         firstTurretTeamId: csvGame.game.firstTurretTeamId,
  //         firstBaronTeamId: csvGame.game.firstBaronTeamId,
  //         firstBloodTeamId: csvGame.game.firstBloodTeamId,
  //         winnerId: csvGame.game.winnerId,
  //         loserId: csvGame.game.loserId
  //       });
  //     }
  //   }
  // }

  // gamesToPostBack.forEach(async game => {
  //   await putGame(game);
  // });

  const csvs = fs
    .readFileSync("games.csv", "utf8")
    .split("\n")
    .filter(x => x.includes("GMT"));
  const teams = await getTeams();

  let i = 0;
  for (const csv of csvs) {
    const csvGame = buildGameFromCsv(csv, teams);
    console.log(csvGame)
    const response = await postGame(csvGame.game);
    console.log(`Created game ${i}`);
    i += 1;
  }

  // const links = await getHistoricalGames()
  // fs.writeFileSync("game_histories.txt", links.join("\n"));

  // const links = fs.readFileSync("./game_histories.txt", "utf8");
  // let i = 0;
  // for (const link of links.split("\n").filter(x => x.includes("http"))) {
  //   console.log(`Getting game data for ${link}`);
  //   await getResults(link);
  //   i += 1;
  //   console.log(`Completed game ${i}`);
  // }
})();
