import router from '../routes';
import { errorHandler } from './error';

export default app => {
  app.use(router),
  app.use(errorHandler)
}