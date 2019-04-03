import * as bodyParser from 'body-parser';

import router from '../routes';
import { errorHandler } from './error';

export default app => {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(router),
  app.use(errorHandler);
};
