const _ = require('lodash');
const EntityArray = require('./EntityArray');
const UserRepository = require('../repositories/GSIUserRepository');

class UserArray extends EntityArray {
  constructor() {
    super(new UserRepository());
  }

  async load(params) {
    const data = await this._load(params);
    const resp = this._filterResponse(data);
    _.assign(this, resp);

    return this;
  }

  _filterResponse(data) {
    const resp = [];

    data
      .forEach(geohashArray => geohashArray
        .forEach((userArray) => {
          const { id, pref, person } = userArray.attrs;
          delete person.last_name;
          resp.push({
            id,
            person,
            pref,
          });
        }));

    return resp;
  }
}


module.exports = UserArray;
