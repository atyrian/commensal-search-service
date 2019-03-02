const common = require('commensal-common');
const DatabaseHandler = require('../DatabaseHandler');
const generateToken = require('../util/generateToken');
require('es6-promise').polyfill();
require('isomorphic-fetch');

module.exports = class SwipeHttpHandler {
  constructor(event) {
    this.event = event;
  }

  async get() {
    const params = this._validateParameters();
    const dbHandler = new DatabaseHandler(params);
    const serviceToken = await generateToken();
    if (!params.like) {
      await this.swipe(dbHandler, serviceToken, params);
      return { body: JSON.stringify({ code: 200 }) };
    }

    this.swipe(dbHandler, serviceToken, params);
    const isMatch = await this.isMatch(dbHandler, params, serviceToken);

    return { body: JSON.stringify({ match: isMatch, code: 200 }) };
  }

  _validateParameters() {
    const { pathParameters, queryStringParameters } = this.event;

    if (!pathParameters || !pathParameters.id || Number.isNaN(Number(pathParameters.id))) {
      throw new common.errors.HttpError('Bad request. Missing or malformed path param id', 400);
    }

    if (!queryStringParameters
      || !queryStringParameters.id
      || !queryStringParameters.like
      || Number.isNaN(Number(queryStringParameters.id))
      || Number.isNaN(Number(queryStringParameters.like))
    ) {
      throw new common.errors.HttpError('Expected numeric query parameters: id, like', 400);
    }

    if (queryStringParameters.like !== '0' && queryStringParameters.like !== '1') {
      throw new common.errors.HttpError('Expected like to have value 0 || 1', 400);
    }

    if (pathParameters.id === queryStringParameters.id) {
      throw new common.errors.HttpError('Invalid operation', 409);
    }

    return {
      base_id: pathParameters.id,
      target_id: queryStringParameters.id,
      like: queryStringParameters.like === '1',
    };
  }

  async swipe(handler, token, params) {
    const updateShownToUrl = process.env.API_URL + `/user/${params.target_id}/partial`;
    const body = { shown_to: params.base_id };
    this.makeAPIRequest(updateShownToUrl, 'PUT', token, body);

    return handler.swipe();
  }

  async isMatch(handler, params, serviceToken) {
    const targetLikesBase = await handler.findTargetSwipe();
    if (!targetLikesBase) {
      return targetLikesBase;
    }

    /*
    TODO: put match insert and user update in extrenal lambda
    call with InvocationType 'event'(don't await response).
     */
    const match = await handler.createMatch();
    const updateMatchUrl = process.env.API_URL + `/users/match?matchid=${match.match_id}&userid=${params.base_id}&userid=${params.target_id}`;

    this.makeAPIRequest(updateMatchUrl, 'PUT', serviceToken);
    return match.isMatch;
  }

  async makeAPIRequest(url, method, token, body = {}) {
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify(body),
    });
  }
};
