import { Server } from 'http';

import * as express from 'express';
import * as env from 'dotenv';

import middlewares from './src/middlewares';

const app = express();

env.config();

middlewares(app);

const server = new Server(app);
const port = process.env.PORT || 3001;


server.listen(port, () => console.log(`Server is starting on port - ${port}`));