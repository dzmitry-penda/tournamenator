import * as mongoose from 'mongoose';
import * as env from 'dotenv';

console.log(env);
console.log(process.env);
mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => console.log('Connection to DB established successfully'))
  .catch(error => console.log('Connection to DB failed'));

export default mongoose;
