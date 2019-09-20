import jwt from 'jsonwebtoken';
import ResponseTemplate from '../templates/response';
import configServer from '../../../config';
import Player from '../../models/player';
import { logger } from '../../../log';

const ValidAuthToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, configServer.app.WEB_TOKEN_SECRET, (err, decodedUser) => {
      if (err) {
        logger.error(err);
        res.json(ResponseTemplate.authError());
      } else {
        Player.findById(decodedUser.user._id, (error, user) => {
          if (error) {
            res.json(ResponseTemplate.authError());
          } else {
            req.user = user;
            next();
          }
        });
      }
    });
  } else {
    res.json(ResponseTemplate.authError());
  }
};


export default ValidAuthToken;
