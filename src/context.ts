import * as mongoose from 'mongoose';

console.log(process.env.CONNECTION_STRING);
mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true })
  .then(() => console.log('Connection to DB established successfully'))
  .catch(error => console.log('Connection to DB failed'));

export default mongoose;
