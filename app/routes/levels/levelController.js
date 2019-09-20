import async from 'async';
import {
  logger,
} from '../../../log';
import Level from '../../models/level';
import Team from '../../models/team';
import constraints from '../../helper/constraints';

const getAliasLevel = (user, alias, callback) => {
  const tasks = [
    (callback) => {
      if (!user.team_id) {
        return callback('Player dont belong from any team', null);
      }
      Team.findById(user.team_id, (err, team) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        return callback(null, team);
      });
    },

    (team, callback) => {
      Level.findOne({
        sub_levels: {
          $elemMatch: {
            url_alias: alias,
          },
        },
      }, {
        'sub_levels.$': 1,
      },
      (err, level) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        if (level) {
          const teamLevelNo = team.level_no;
          const teamSubLevelNo = team.sub_levels;

          if (level.level_no > teamLevelNo) {
            return callback('access denied', null);
          }
          if (level.level_no === teamLevelNo) {
            if (level.sub_levels.filter(o => o.url_alias === alias)[0].sub_level_no > teamSubLevelNo) {
              return callback('access denied', null);
            }
          }

          return callback(null, {
            level,
            teamLevelNo,
            teamSubLevelNo,
          });
        }
        return callback('No level found', null);
      });
    },
  ];

  async.waterfall(tasks, (err, response) => {
    if (err) {
      logger.error(err);
      return callback(err, null);
    }
    return callback(null, response);
  });
};


const getAllLevels = (user, callback) => {
  const tasks = [
    (callback) => {
      Team.findById(user.team_id, (err, team) => {
        if (err) {
          logger.error(err);
          return callback(err, null);
        }
        return callback(null, team);
      });
    },
    (team, callback) => {
      const queryCondition = !user.admin ? {
        level_no: {
          $lte: team.level_no,
        },
      } : {};
      Level.find(queryCondition,
        constraints.levelRetrieveInfo, (err, levels) => {
          if (err) {
            logger.error(err);
            return callback(err, null);
          }
          // this is a hack can fail in some cases
          levels.map((l) => {
            l.sub_levels = l.sub_levels.sort((a, b) => a.sub_level_no > b.sub_level_no);
            l.sub_levels = l.sub_levels[0];
          });
          return callback(null, levels);
        });
    },
  ];

  async.waterfall(tasks, (err, response) => {
    if (err) {
      logger.error(err);
      return callback(err, null);
    }
    return callback(null, response);
  });
};

const getNextLevelAlias = (levelNo, subLevelNo, callback) => {
  Level.findOne({
    level_no: levelNo,
  }, {
    sub_levels: {
      $elemMatch: {
        sub_level_no: subLevelNo,
      },
    },
  }, (err, level) => {
    if (err) {
      return callback(err, null);
    }
    return callback(null, level);
  });
};

export default {
  getAliasLevel,
  getAllLevels,
  getNextLevelAlias,
};
