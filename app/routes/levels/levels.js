import express from 'express';
import async from 'async';
import {
  logger,
} from '../../../log';
import Level from '../../models/level';
import levelController from './levelController';
import Team from '../../models/team';

const router = express.Router();

/**
 * @swagger
 * /levels:
 *   get:
 *     parameters:
 *       - in: header
 *         name: authorization
 *         required: true
 *         type: string
 *         description: JWT Token
 *       - in: query
 *         name: alias
 *         type: string
 *         description: alias of level
 *       - in: query
 *         name: action
 *         type: string
 *         required: true
 *         description: alias of level
 *     tags:
 *       - levels
 *     description: Returns all levels
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of levels
 *         schema:
 *           type: array
 *           items:
 *              $ref: '#/definitions/levels'
 */

router.get('/', (req, res) => {
  const task1 = [
    (callback) => {
      levelController.getAliasLevel(req.user, req.query.alias, (err, level) => {
        if (err) {
          return callback(err, null);
        }
        const subLevel = level.level.sub_levels[0].toObject();
        delete subLevel.ans;
        return callback(null, subLevel);
      });
    },
  ];

  const task2 = [
    (callback) => {
      levelController.getAllLevels(req.user, (err, levels) => {
        if (err) {
          return callback(err, null);
        }
        return callback(null, levels);
      });
    },
  ];

  const taskDecider = (action) => {
    switch (action) {
      case 'getAliasLevel':
        return task1;
      case 'getAllLevels':
        return task2;
      default:
        return null;
    }
  };

  async.waterfall(taskDecider(req.query.action), (err, response) => {
    if (err) {
      logger.error(err);
      res.json({
        err,
        success: false,
      });
    } else {
      res.json({
        success: true,
        data: response,
      });
    }
  });
});

/**
 * @swagger
 * /levels/{id}:
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
 *         description: id of level
 *     tags:
 *       - levels
 *     description: Returns level with given id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Object of a particular level
 *         schema:
 *           type: object
 *           $ref: '#/definitions/levels'
 *       404:
 *         description: level with specific id not found
 */

router.get('/:id', (req, res) => {
  const levelId = req.params.id;
  Level.findById(levelId, (err, level) => {
    if (err) {
      logger.error(err);
      res.json({
        err,
        success: false,
      });
    } else {
      res.json({
        success: true,
        data: level,
      });
    }
  });
});

/**
 * @swagger
 * /levels:
 *   post:
 *     parameters:
 *       - in: header
 *         name: authorization
 *         required: true
 *         type: string
 *         description: JWT Token
 *       - in: body
 *         name: level
 *         required: true
 *         description: the level to create
 *         schema:
 *           type: object
 *           properties:
 *              level_no:
 *                  type: number
 *     tags:
 *       - levels
 *     description: Creates new level
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: New level created
 *         schema:
 *           type: object
 *           $ref: '#/definitions/levels'
 *       400:
 *         description: level already exists
 *       401:
 *         description: Unauthorised request
 */

router.post('/', (req, res) => {
  const levelData = new Level(req.body);
  levelData.save((err, response) => {
    if (err) {
      logger.error(err);
      res.json({
        err,
        success: false,
      });
    } else {
      res.json({
        success: true,
        data: response,
      });
    }
  });
});

/**
 * @swagger
 * /levels/{id}:
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
 *         description: id of level
 *       - in: body
 *         name: level
 *         required: true
 *         description: updated level information
 *         schema:
 *           type: object
 *           properties:
 *              sub_level_no:
 *                type: number
 *              url_alias:
 *                type: string
 *              picture:
 *                type: array
 *                items:
 *                    type: string
 *              ans:
 *                type: array
 *                items:
 *                    type: string
 *              js:
 *                type: string
 *              html:
 *                type: string
 *     tags:
 *       - levels
 *     description: Updates level with given id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Object of a particular level
 *         schema:
 *           type: object
 *           $ref: '#/definitions/levels'
 *       404:
 *         description: level with specific id not found
 *       401:
 *         description: Unauthorized request
 */

router.put('/:id', (req, res) => {
  Level.updateOne({
    _id: req.params.id,
  }, {
    $push: {
      sub_levels: req.body,
    },
  },
  (err, res1) => {
    if (err) {
      logger.error(err);
      res.json({
        err,
        success: false,
      });
    } else {
      res.json({
        success: true,
        data: res1,
      });
    }
  });
});

/**
 * @swagger
 * /levels/{alias}:
 *   post:
 *     parameters:
 *       - in: header
 *         name: authorization
 *         required: true
 *         type: string
 *         description: JWT Token
 *       - in: path
 *         name: alias
 *         required: true
 *         type: string
 *         description: url_alias of level
 *       - in: body
 *         name: ans
 *         required: true
 *         description: answer of user
 *         schema:
 *            type: object
 *            properties:
 *               ans:
 *                  type: string
 *     tags:
 *       - levels
 *     description: Checks answer for given level
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Answer is correct
 *       400:
 *         description: Answer is wrong
 *       404:
 *         description: level with specific id not found
 *       401:
 *         description: Unauthorized request
 */

router.post('/:alias', (req, res) => {
  const userAns = req.body.ans;
  const levelAlias = req.params.alias;
  let teamLevelNo;
  let teamSubLevelNo;

  const tasks = [
    // getting level from the alias
    (callback) => {
      levelController.getAliasLevel(req.user, levelAlias, (err, data) => {
        if (err) {
          return callback(err, null);
        }
        req.level = data.level;
        const subLevel = data.level.sub_levels.filter(obj => obj.url_alias === levelAlias)[0]; // always 0 index because alias is unique
        req.sub_level = subLevel;
        teamLevelNo = data.teamLevelNo;
        teamSubLevelNo = data.teamSubLevelNo;
        return callback(null, subLevel);
      });
    },

    // matching ans
    (subLevel, callback) => {
      const levelAns = subLevel.ans;
      if (levelAns.indexOf(userAns) > -1) {
        return callback(null, true);
      }
      return callback(null, false);
    },
  ];

  const task1 = [
    // getting the user_team and updating columns
    (callback) => {
      let newLevelNo;
      let newSubLevelNo;
      if (req.sub_level.sub_level_no === req.level.sub_levels.length) {
        newLevelNo = req.level.level_no + 1;
        newSubLevelNo = 1;
      } else {
        newLevelNo = req.level.level_no;
        newSubLevelNo = req.sub_level.sub_level_no + 1;
      }
      if (teamLevelNo === req.level.level_no && req.sub_level.sub_level_no === teamSubLevelNo) {
        // updating team
        if (!req.user.admin) {
          Team.update({
            'players._id': req.user._id,
          }, {
            $inc: {
              'players.$.level_cleared': 1,
            },
            $set: {
              level_no: newLevelNo,
              sub_levels: newSubLevelNo,
              updated_at: new Date(),
            },
          },
          (err, team) => {
            if (err) {
              return callback(err, null);
            }
            return callback(null, {
              newLevelNo,
              newSubLevelNo,
            });
          });
        }
      } else {
        return callback(null, {
          newLevelNo,
          newSubLevelNo,
        });
      }
    },

    // getting next level alias
    (data, callback) => {
      levelController.getNextLevelAlias(data.newLevelNo, data.newSubLevelNo, (err, level) => {
        if (err) {
          return callback(err, null);
        }
        return callback(null, level);
      });
    },
  ];

  async.waterfall(tasks, (err, response) => {
    if (err) {
      logger.error(err);
      res.json({
        err,
        success: false,
      });
    } else if (!response) {
      res.json({
        success: true,
        ansCorrect: false,
      });
    } else {
      async.waterfall(task1, (err, level) => {
        if (err) {
          logger.error(err);
          res.json({
            err,
            success: false,
          });
        } else {
          res.json({
            success: true,
            ansCorrect: true,
            data: level,
          });
        }
      });
    }
  });
});

export default router;
