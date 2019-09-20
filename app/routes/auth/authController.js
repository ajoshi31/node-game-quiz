import Player from '../../models/player';
import { logger } from '../../../log';

const createPlayer = (user, callback) => {
  const userData = new Player(user);
  userData.save((err, response) => {
    if (err) {
      logger.error(err);
      return callback(err, null);
    }
    return callback(null, response);
  });
};

export default {
  createPlayer,
};
