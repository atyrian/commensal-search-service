const common = require('commensal-common');
const Joi = require('joi');
const dynogels = require('dynogels');

dynogels.AWS.config.update({ region: process.env.REGION });

const create = data => new Promise((resolve, reject) => {
  const Match = dynogels.define('Match', {
    hashKey: 'match_id',
    timestamps: true,
    schema: {
      match_id: dynogels.types.uuid(),
      messages: Joi.array(),
      participants: dynogels.types.stringSet(),
      connectionIds: {
        [Object.keys(data.connectionIds)[0]]: Joi.string(),
        [Object.keys(data.connectionIds)[1]]: Joi.string(),
      },
    },
    tableName: process.env.MATCH_TABLE,
  });

  Match.create(data, (err, match) => {
    if (err) {
      reject(new common.errors.HttpError('Error saving Match to Database', 500));
    }
    resolve({ isMatch: true, match_id: match.get('match_id') });
  });
});

const MatchDB = { create };

module.exports = MatchDB;
