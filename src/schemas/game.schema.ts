import mongoose from '../context';

const Schema = mongoose.Schema;

const GameSchema = new Schema({
  firstUserId: Number,
  secondUserId: Number,
  firstUserScore: Number,
  secondUserScore: Number,
}, { versionKey: false });


export default mongoose.model('game', GameSchema);
