import mongoose from 'mongoose';

/**
 * @swagger
 * definition:
 *   teams:
 *     properties:
 *       id:
 *         type: string
 *       name:
 *         type: string
 *       admin_id:
 *         type: string
 *       picture:
 *         type: string
 *       level_no:
 *         type: number
 *       sub_levels:
 *         type: number
 *       players:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             username:
 *               type: string
 *             level_cleared:
 *               type: number
 */

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  admin_id: {
    type: String,
    required: true,
  },
  level_no: {
    type: Number,
    default: 0,
  },
  sub_levels: {
    type: Number,
    default: 0,
  },
  picture: {
    type: String,
    required: true,
  },
  players: {
    type: [{
      _id: String,
      username: {
        type: String,
        unique: true,
      },
      level_cleared: {
        type: Number,
        default: 0,
      },
    }],
  },
  requests: {
    type: [{
      requester_id: {
        type: String,
        unique: true,
      },
      created_at: {
        type: Date,
        default: new Date(),
      },
    }],
  },
});

export default mongoose.model('Team', TeamSchema);
