const common = require('commensal-common');
const Joi = require('joi');
const dynogels = require('dynogels');

dynogels.AWS.config.update({ region: process.env.REGION });
class MatchDB {
  constructor(keyParams) {
    this.db = dynogels.define('Match', {
      hashKey: 'match_id',
      timestamps: true,
      schema: {
        match_id: dynogels.types.uuid(),
        messages: Joi.array(),
        participants: dynogels.types.stringSet(),
        connectionIds: {
          [keyParams[0]]: Joi.string(),
          [keyParams[1]]: Joi.string(),
        },
      },
      tableName: process.env.MATCH_TABLE,
    });
  }

  create(data) {
    return new Promise((resolve, reject) => {
      this.db.create(data, (err, match) => {
        if (err) {
          reject(new common.errors.HttpError('Error saving Match to Database', 500));
        }
        resolve({ isMatch: true, match_id: match.get('match_id') });
      });
    });
  }
}

module.exports = MatchDB;
