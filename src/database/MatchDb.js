const common = require('commensal-common');
const Joi = require('joi');
const dynogels = require('dynogels');

dynogels.AWS.config.update({ region: process.env.REGION });

const Match = dynogels.define('Match', {
  hashKey: 'match_id',
  timestamps: true,
  schema: {
    match_id: dynogels.types.uuid(),
    messages: Joi.array(),
    participants: dynogels.types.stringSet(),
  },
  tableName: process.env.MATCH_TABLE,
});

const create = data => new Promise((resolve, reject) => {
  Match.create(data, (err, match) => {
    if (err) {
      reject(new common.errors.HttpError('Error saving Match to Database', 500));
    }
    resolve({ isMatch: true, match_id: match.get('match_id') });
  });
});

const MatchDB = { create };

module.exports = MatchDB;
