const dynogels = require('dynogels');
const common = require('commensal-common');

class BaseRepository {
  constructor(name, definition, tableName, index) {
    this._db = dynogels.define(name, definition);
    this._db.config(tableName);
    this._index = index;
  }

  create() {
  }

  update() {
  }

  destroy() {
  }

  async loadArray(params) {
    const responseArray = [];

    for (const geohash of params.geohashes) {
      const query = this._db
        .query(geohash)
        .limit(20)
        .where('last_active').between(params.active_from, params.active_to)
        .filter('shown_to')
        .notContains(params.id)
        .filter('id')
        .notContains(params.id)
        .usingIndex(this._index);

      if (params.filter !== null) {
        query.filter('person.gender')
          .equals(params.filter);
      }

      const data = await this.execQuery(query);
      data ? responseArray.push(data) : null;
    }

    if (responseArray.length === 0) {
      throw new common.errors.HttpError('Found no users matching parameters', 404);
    }
    return responseArray;
  }

  execQuery(query) {
    return new Promise((resolve, reject) => {
      query.exec((err, resp) => {
        if (err) {
          return reject(new common.errors.HttpError(`Error: ${err.message}`, 500));
        }
        if (resp.Count) {
          return resolve(resp.Items);
        }
        return resolve();
      });
    });
  }

  _validate(entity) {
    entity._entityRepository ? delete entity._entityRepository : null;

    Object.keys(entity).filter(key => key.startsWith('_'))
      .forEach(k => delete entity[k]);
  }
}

module.exports = BaseRepository;
