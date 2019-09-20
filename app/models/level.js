import mongoose from 'mongoose';

/**
 * @swagger
 * definition:
 *   levels:
 *     properties:
 *       id:
 *         type: string
 *       level_no:
 *         type: number
 *       url_alias:
 *         type: string
 *       picture:
 *         type: array
 *         items:
 *           type: string
 *       ans:
 *         type: array
 *         items:
 *           type: string
 *       js:
 *         type: string
 *       html:
 *         type: string
 *       created_at:
 *         type: string
 *         format: date
 *       updated_at:
 *         type: string
 *         format: date
 */


const LevelSchema = mongoose.Schema({
  id: {
    type: String,
  },
  level_no: {
    type: Number,
    required: true,
    unique: true,
  },
  sub_levels: [{
    sub_level_no: {
      type: Number,
      required: true,
    },
    url_alias: {
      type: String,
      required: true,
      unique: true,
    },
    picture: {
      type: [String],
      required: true,
    },
    ans: {
      type: [String],
      required: true,
    },
    js: {
      type: String,
    },
    html: {
      type: String,
    },
  }],
  created_at: {
    type: Date,
    default: new Date(),
  },
  updated_at: {
    type: Date,
    default: new Date(),
  },
});

export default mongoose.model('Level', LevelSchema);
