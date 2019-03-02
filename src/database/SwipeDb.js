const common = require('commensal-common');
const Joi = require('joi');
const dynogels = require('dynogels');

dynogels.AWS.config.update({ region: process.env.REGION });

const Swipe = dynogels.define('Swipe', {
  hashKey: 'base_id',
  rangeKey: 'target_id',
  timestamps: true,
  schema: {
    base_id: Joi.string(),
    target_id: Joi.string(),
    like: Joi.bool(),
  },
  tableName: process.env.SWIPE_TABLE,
});

const create = data => new Promise((resolve, reject) => {
  Swipe.update(data, {
    expected: {
      base_id: { Exists: false },
      target_id: { Exists: false }
    },
  }, (err) => {
    if (err && err.code === 'ConditionalCheckFailedException') {
      return reject(new common.errors.HttpError('Already swiped on user', 400));
    }
    if (err) {
      return reject(new common.errors.HttpError('Error saving Swipe to Database', 500));
    }
    return resolve(true);
  });
});

const getTargetSwipe = data => new Promise((resolve, reject) => {
  Swipe.get(data.target_id, data.base_id, (err, swipe) => {
    if (err) {
      reject(new common.errors.HttpError('Error getting target Swipe', 500));
    }
    resolve(swipe ? swipe.get('like') : false);
  });
});

const SwipeDB = { create, getTargetSwipe };

module.exports = SwipeDB;
