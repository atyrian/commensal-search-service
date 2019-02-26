const common = require('commensal-common');
const SearchHandler = require('../SearchHandler');

module.exports = class SearchHttpHandler {
  constructor(event) {
    this.event = event;
  }

  async get() {
    const params = this._validateParameters();
    const search = new SearchHandler(params);
    const responseArray = await search.getSuggested();

    return this._generateResponse(responseArray);
  }

  _validateParameters() {
    const resp = {
      id: null, filter: null, geohashes: null, active_from: null, active_to: null,
    };
    const { pathParameters, queryStringParameters, multiValueQueryStringParameters } = this.event;

    if (!pathParameters || !pathParameters.id || Number.isNaN(Number(pathParameters.id))) {
      throw new common.errors.HttpError('Bad request. Missing or malformed path param id', 400);
    }
    if (!multiValueQueryStringParameters
      || !multiValueQueryStringParameters.geohashes
      || !Array.isArray(multiValueQueryStringParameters.geohashes)) {
      throw new common.errors.HttpError('Bad request. Expected parameter geohashes of type Array.', 400);
    }
    if (queryStringParameters && queryStringParameters.gender) {
      resp.filter = queryStringParameters.gender;
    }

    resp.geohashes = multiValueQueryStringParameters.geohashes;
    resp.id = pathParameters.id;
    return resp;
  }

  _generateResponse(data) {
    const response = {
      body: JSON.stringify({
        data,
        code: 200,
      }),
    };
    return response;
  }
};
