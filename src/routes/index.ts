import { Router } from 'express';
import moment from 'moment';

// Routers
import UserRouter from './user';
import TodoRouter from './todo';

const MainRouter = Router();

MainRouter.get('/', (_, res) => {
  return res.status(200).json({
    status: 200,
    message: 'OK',
    date: moment().format('YYYY-MM-DD'),
    time: moment().format('HH:mm:ss'),
  });
});

MainRouter.use('/users', UserRouter);
MainRouter.use('/todos', TodoRouter);

export default MainRouter;
