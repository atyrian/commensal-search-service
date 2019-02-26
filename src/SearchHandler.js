const common = require('commensal-common');
const moment = require('moment');
const UserArray = require('./domain/UserArray');

module.exports = class SearchHandler {
  constructor(params) {
    this.params = params;
  }

  async getSuggested() {
    this.validateParams();
    this.params.active_to = moment().unix() + '';
    this.params.active_from = moment().unix() - 86400 + ''; // last 25 minutes as string

    const userArray = new UserArray();
    await userArray.load(this.params);
    return userArray;
  }

  validateParams() {
    if (this.params.geohashes.length > 5) {
      throw new common.errors.HttpError(`Expected geohashes array of length <= 5,
      got: ${this.params.geohashes.length}`, 400);
    }

    this.params.geohashes.forEach((hash) => {
      if (typeof hash !== 'string' || hash.length > 5) {
        throw new common.errors.HttpError('Geohash must be of type string with 5 character precision', 400);
      }
    });

    if (this.params.filter) {
      if (this.params.filter !== '0' && this.params.filter !== '1' && this.params.filter !== '3') {
        throw new common.errors.HttpError(`Expected gender filter to be one of 0,1,3,
         got:${this.params.filter}`, 400);
      }
      this.params.filter = parseInt(this.params.filter, 10);
    }
  }
};
