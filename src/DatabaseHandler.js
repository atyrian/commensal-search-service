const swipeDB = require('./database/SwipeDb');
const MatchDB = require('./database/MatchDb');

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
    const matchDB = new MatchDB([this.params.base_id, this.params.target_id]);
    const matchRecord = {
      messages: [' '],
      participants: [this.params.base_id, this.params.target_id],
      connectionIds: {
        [this.params.base_id]: 'disconnected',
        [this.params.target_id]: 'disconnected',
      },
    };
    return matchDB.create(matchRecord);
  }
};
