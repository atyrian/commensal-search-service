const sinon = require("sinon");
const chai = require('chai');
const sandbox = require('sinon').createSandbox();
const expect = require('chai').expect;

chai.should();
chai.use(require('chai-as-promised'));

const SearchHttpHandler = require('../../src/httpHandlers/SearchHttpHandler');

describe('tests for SearchHttpHandler', function () {
  beforeEach(function () {
    this.event = {
      multiValueQueryStringParameters: { geohashes: ['u3chr', 'u3chq', 'u3chp', 'u3chn'] },
      pathParameters: { id: '2' },
      queryStringParameters: { gender: '1' }
    }
    this.handler = new SearchHttpHandler(this.event);

  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('_validateParameters()', function () {
    it('returns response containing id, filter, geohashes, active_from, active_to', function () {
      const spy = sinon.spy(this.handler, "_validateParameters");
      const res = this.handler._validateParameters();

      expect(res).to.contain.all.keys('id', 'filter', 'geohashes', 'active_from', 'active_to');
      expect(Array.isArray(res.geohashes)).to.eql(true);
      expect(res.geohashes).to.eql(this.event.multiValueQueryStringParameters.geohashes);
      expect(res.id).to.eql(this.event.pathParameters.id);
      expect(res.filter).to.eql(this.event.queryStringParameters.gender);
      return sinon.assert.calledOnce(spy);
    });

    it('ignores filter when gender not in query string', function () {
      delete this.event.queryStringParameters.gender;
      const res = this.handler._validateParameters();

      expect(res.filter).to.eql(null);
    });

    it('throws HTTP 400 when id not in path parameters', function () {
      delete this.event.pathParameters.id;

      return expect(() => {
        this.handler._validateParameters()
      }).to.throw('Bad request. Missing or malformed path param id')
        .that.has.property('statusCode')
        .that.is.equal(400);
    });

    it('throws HTTP 400 when geohashes property not present on multiValueQueryStringParameters', function () {
      delete this.event.multiValueQueryStringParameters.geohashes;

      return expect(() => {
        this.handler._validateParameters()
      }).to.throw('Bad request. Expected parameter geohashes of type Array.')
        .that.has.property('statusCode')
        .that.is.equal(400);
    });
  });
});