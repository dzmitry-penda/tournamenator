import mongoose from '../context';
import { TournamentType } from '../enums/tournament-type';
import { TournamentState } from '../enums/tournament-state';


const Schema = mongoose.Schema;

const TournamentSchema = new Schema({
  name: String,
  type: { type: Number, default: TournamentType.League },
  ratingId: Number,
  chatId: Number,
  users: [Number],
  games: [{ type: Schema.Types.ObjectId, ref: 'game'}],
  state: { type: Number, default: TournamentState.New },
}, { versionKey: false });


export default mongoose.model('tournament', TournamentSchema);
