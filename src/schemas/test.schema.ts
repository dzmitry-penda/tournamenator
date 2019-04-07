import mongoose from '../context';


const testSchema = new mongoose.Schema({
  data: Number,
  message: {
    type: String,
    default: 'Hello there'
  }
}, { versionKey: false });


export default mongoose.model('testSchema', testSchema);
