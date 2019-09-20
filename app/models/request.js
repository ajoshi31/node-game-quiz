import mongoose from 'mongoose';

/**
 * @swagger
 * definition:
 *   requests:
 *     properties:
 *       id:
 *         type: string
 *       requester_id:
 *         type: number
 *       team_id:
 *         type: string
 *       created_at:
 *         type: date-time
 *       updated_at:
 *         type: date-time
 */

const RequestSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  requester_id: {
    type: String,
    required: true,
  },
  team_id: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
  updated_at: {
    type: Date,
    default: new Date(),
  },

});

export default mongoose.model('Request', RequestSchema);
