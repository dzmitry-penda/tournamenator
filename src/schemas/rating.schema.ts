import mongoose from '../context';

const Schema = mongoose.Schema;

const RatingSchema = new Schema({
  userId: Number,
  rating: { type: Number, default: 1400 },
  ratingId: Number
}, { versionKey: false });


export default mongoose.model('rating', RatingSchema);
