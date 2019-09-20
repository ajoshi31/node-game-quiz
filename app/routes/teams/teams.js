import express from 'express';
import jwt from 'jsonwebtoken';
import async from 'async';
import {
  logger,
} from '../../../log';
import Team from '../../models/team';
import Player from '../../models/player';
import config from '../../../config';

const router = express.Router();

/**
 * @swagger
 * /teams:
 *   get:
 *     parameters:
 *       - in: header
 *         name: authorization
 *         required: true
 *         type: string
 *         description: JWT Token
 *       - in: query
 *         name: limit
 *         type: number
 *         description: limit of teams
 *       - in: query
 *         name: skip
 *         type: number
 *         description: skip the teams
 *       - in: query
 *         name: sort
 *         type: boolean
 *         description: sort or not the teams
 *     tags:
 *       - teams
 *     description: Returns all teams
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of teams
 *         schema:
 *           type: array
 *           items:
 *              $ref: '#/definitions/teams'
 */

router.get('/', (req, res) => {
  const options = req.query.sort ? {
    level_no: -1,
    updated_at: 1,
  } : null;
  Team.find()
    .sort(options)
    .skip(req.query.skip)
    .limit(req.query.limit)
    .exec((err, teams) => {
      if (err) {
        logger.error(err);
        res.json({
          err,
          success: false,
        });
      } else {
        res.json({
          success: true,
          data: teams,
        });
      }
    });
});

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     parameters:
 *       - in: header
 *         name: authorization
 *         required: true
 *         type: string
 *         description: JWT Token
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: id of team
 *     tags:
 *       - teams
 *     description: Returns team with given id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Object of a particular team
 *         schema:
 *           type: object
 *           $ref: '#/definitions/teams'
 *       404:
 *         description: team with specific id not found
 */

router.get('/:id', (req, res) => {
  Team.findById(req.params.id, (err, team) => {
    if (err) {
      logger.error(err);
      res.json({
        success: false,
        err,
      });
    } else {
      res.json({
        success: true,
        data: team,
      });
    }
  });
});

/**
 * @swagger
 * /teams:
 *   post:
 *     parameters:
 *       - in: header
 *         name: authorization
 *         required: true
 *         type: string
 *         description: JWT Token
 *       - in: body
 *         name: team
 *         required: true
 *         description: the team to create
 *         schema:
 *           type: object
 *           properties:
 *              picture:
 *                type: string
 *              name:
 *                 type: string
 *     tags:
 *       - teams
 *     description: Creates new team
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: New team created
 *         schema:
 *           type: object
 *           $ref: '#/definitions/teams'
 *       400:
 *         description: team already exists
 *       401:
 *         description: Unauthorised request
 */

router.post('/', (req, res) => {
  const teamData = req.body;
  teamData.admin_id = req.user._id;
  teamData.players = [{
    _id: req.user._id,
    username: req.user.username,
  }];

  const tasks = [
    (callback) => {
      if (req.user.team_id) {
        return callback('Player has joined already another team', null);
      }
      const dbTeamData = new Team(teamData);
      dbTeamData.save((err, response) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        return callback(null, response);
      });
    },

    (teamDetails, callback) => {
      Player.updateOne({
        _id: req.user._id,
      }, {
        $set: {
          team_id: teamDetails._id,
        },
      }, (err, updatedPlayer) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        return callback(null, updatedPlayer);
      });
    },

    // fetching the player for making jwt token
    (data, callback) => {
      Player.findById(req.user._id, (err, player) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        return callback(null, player);
      });
    },
  ];

  async.waterfall(tasks, (err, playerData) => {
    if (err) {
      logger.error(err);
      res.json({
        success: false,
        err,
      });
    } else {
      res.json({
        success: true,
        data: {
          token: jwt.sign({
            user: playerData,
          }, config.app.WEB_TOKEN_SECRET, {
            expiresIn: config.app.jwt_expiry_time,
          }),
        },
      });
    }
  });
});

/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     parameters:
 *       - in: header
 *         name: authorization
 *         required: true
 *         type: string
 *         description: JWT Token
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *       - in: query
 *         name: action
 *         required: true
 *         type: string
 *       - in: body
 *         name: team
 *         required: true
 *         description: updated team information
 *         schema:
 *           type: object
 *           properties:
 *              reqId:
 *                  type: string
 *     tags:
 *       - teams
 *     description: Updates team with given id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Object of a particular team
 *         schema:
 *           type: object
 *           $ref: '#/definitions/teams'
 *       404:
 *         description: team with specific id not found
 *       401:
 *         description: Unauthorized request
 */

router.put('/:id', (req, res) => {
  const task2 = [
    // Retreiving the player by req
    (callback) => {
      const reqId = req.body.reqId;
      Team.findOne({
        _id: req.params.id,
      }, {
        requests: {
          $elemMatch: {
            _id: reqId,
          },
        },
      }, (err, request) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        return callback(null, request);
      });
    },
    // getting user details
    (request, callback) => {
      Player.findById(request.requests[0].requester_id, (err, player) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        if (player.team_id) {
          return callback('Player has already joined a team', null);
        }
        Player.updateOne({
          _id: request.requests[0].requester_id,
        }, {
          $set: {
            team_id: req.params.id,
          },
        }, (err1, updatedPlayer) => {
          if (err1) {
            logger.error(err1);
            return callback(err1, null);
          }
          return callback(null, player);
          // TODO:= update the JWT of the requester
        });
      });
    },

    (player, callback) => {
      Team.updateOne({
        _id: req.params.id,
      }, {
        $push: {
          players: {
            _id: player._id,
            username: player.username,
          },
        },
      }, (err, res) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        return callback(null, player);
      });
    },
    // Deleting the processed request
    (player, callback) => {
      Team.update({}, {
        $pull: {
          requests: {
            requester_id: player._id,
          },
        },
      }, {
        multi: true,
      }, (err, response) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        return callback(null, response);
      });
    },
  ];

  const task1 = [
    // Checking the user dont exist in another team
    (callback) => {
      Player.findById(req.user._id, (err, player) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        if (player.team_id) {
          return callback('Player has already joined a team', null);
        }
        return callback(null, player);
      });
    },

    // Checking for the request in same team

    (player, callback) => {
      const reqId = req.body.reqId;
      Team.findOne({
        _id: req.params.id,
      }, {
        requests: {
          $elemMatch: {
            _id: reqId,
          },
        },
      }, (err, request) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        if (request) {
          return callback('Request already sent', null);
        }
        return callback(null, player);
      });
    },

    (player, callback) => {
      Team.updateOne({
        _id: req.params.id,
      }, {
        $push: {
          requests: {
            requester_id: req.user._id,
          },
        },
      }, (err, res) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        return callback(null, res);
      });
    },
  ];

  const task3 = [
    (callback) => {
      Team.update({
        _id: req.params.id,
      }, {
        $pull: {
          requests: {
            _id: req.body.reqId,
          },
        },
      }, (err, response) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        return callback(null, response);
      });
    },
  ];

  const taskDecider = (action) => {
    switch (action) {
      case 'request':
        return task1;
      case 'accept_request':
        return task2;
      case 'delete':
        return task3;
      default:
        return null;
    }
  };

  async.waterfall(taskDecider(req.query.action), (err, response) => {
    if (err) {
      logger.error(err);
      res.json({
        success: false,
        err,
      });
    } else {
      res.json({
        success: true,
      });
    }
  });
});

export default router;
