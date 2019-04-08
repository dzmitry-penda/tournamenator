import mongoose from '../context';

const Schema = mongoose.Schema;

const GameSchema = new Schema({
  userId1: Number,
  userId2: Number,
  scoreUser1: Number,
  scoreUser2: Number,
  tournament: { type: Schema.Types.ObjectId, ref: 'tournament' },
}, { versionKey: false });


export default mongoose.model('game', GameSchema);
