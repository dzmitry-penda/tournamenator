import { Server } from 'http';
import * as express from 'express';

import * as dotenv from 'dotenv';
dotenv.config();

import middlewares from './src/middlewares';

const app = express();

middlewares(app);

const server = new Server(app);
const port = process.env.PORT || 3333;
server.listen(port, () => console.log(`Server is starting on port - ${port}`));
