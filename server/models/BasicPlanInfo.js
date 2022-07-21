const { Schema, model } = require('mongoose');

const BasicPlanInfoSchema = new Schema(
  {
    username: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User'
        }
    ],

    planTitle: {
      type: [String],
      required: true,
      trim: true
    },

    city: {
      type: [String],
      required: true,
      trim: true
    },

    descriptionText: {
      type: String,
      required: 'You need to provide your reaction text.',
      minLength: 1,
      maxLength: 280
    },

    days: {
      type: Number,
      required: 'You need to provide the number of days'
    },

    startDay: {
      type: String,
      required: 'You need to provide the start time of the day'
    },

    endDay: {
      type: String,
      required: 'You need to provide the end time of the day'
    }
  },
  {
    toJSON: {
      virtuals: true
    }
  }
);


const BasicPlanInfo = model('BasicPlanInfo', BasicPlanInfoSchema);

module.exports = BasicPlanInfo;