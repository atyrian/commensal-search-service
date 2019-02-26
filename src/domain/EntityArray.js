class EntityArray extends Array {
  constructor(entityRepository) {
    super();
    this._entityRepository = entityRepository;
  }

  async _load(params) {
    return this._entityRepository.loadArray(params)
      .then(data => data);
  }
}

module.exports = EntityArray;
