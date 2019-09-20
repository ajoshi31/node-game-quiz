import players from './routes/players/players';
import teams from './routes/teams/teams';
import levels from './routes/levels/levels';
import auth from './routes/auth/auth';
import requireAuth from './global/middlewares/ValidAuthToken';

const router = (app) => {
  app.use('/players', requireAuth, players);
  app.use('/teams', requireAuth, teams);
  app.use('/levels', requireAuth, levels);
  app.use('/auth', auth);
};

export default router;
