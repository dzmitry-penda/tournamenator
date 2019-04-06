import { CreateTournamentState } from "../enums/create-tournament-state";
import { TournamentType } from "../enums/tournament-type";

export class Chat {
  public name: string;
  public type: TournamentType;
  public ratingId: number;

  constructor(
    public lastMessageId: number,
    public state: CreateTournamentState
  ) { }
}