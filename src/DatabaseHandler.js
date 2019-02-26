const swipeDB = require('./database/SwipeDb');
const matchDB = require('./database/MatchDb');

module.exports = class DatabaseHandler {
  constructor(params) {
    this.params = params;
  }

  async swipe() {
    return swipeDB.create(this.params);
  }

  async findTargetSwipe() {
    return swipeDB.getTargetSwipe(this.params);
  }

  async createMatch() {
    const matchRecord = {
      messages: [],
      participants: [this.params.base_id, this.params.target_id],
    };
    return matchDB.create(matchRecord);
  }
};
