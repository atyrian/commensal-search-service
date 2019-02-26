const chai = require('chai');
const sandbox = require('sinon').createSandbox();
const expect = require('chai').expect;

chai.should();
chai.use(require('chai-as-promised'));

const SearchHandler = require('../../src/SearchHandler');

describe('tests for SearchHandler', function () {
  beforeEach(function () {
    this.params = { id: '2', filter: '1', geohashes: ['u3chr', 'u3chq', 'u3chp', 'u3chn'], active_from: null, active_to: null };
    this.handler = new SearchHandler(this.params);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('validateParams', function () {
    it('throws HTTP 400 if geohashes array length > 5', function () {
      this.params.geohashes.push('geohash', 'geohash');

      return expect(() => {
        this.handler.validateParams()
      }).to.throw('Expected geohashes array of length <= 5')
        .that.has.property('statusCode')
        .that.is.equal(400);
    });

    it('throws HTTP 400 if geohashes are not strings', function () {
      this.params.geohashes[0] = 10;

      return expect(() => {
        this.handler.validateParams()
      }).to.throw('Geohash must be of type string with 5 character precision')
        .that.has.property('statusCode')
        .that.is.equal(400);
    });

    it('throws HTTP 400 if geohashes exceed 5 character length', function () {
      this.params.geohashes[0] = '123456';

      return expect(() => {
        this.handler.validateParams()
      }).to.throw('Geohash must be of type string with 5 character precision')
        .that.has.property('statusCode')
        .that.is.equal(400);
    });

    it('throws HTTP 400 if filter has value other than 0,1,3', function () {
      this.params.filter = 'invalidValue';

      return expect(() => {
        this.handler.validateParams()
      }).to.throw('Expected gender filter to be one of 0,1,3')
        .that.has.property('statusCode')
        .that.is.equal(400);
    });

    it('parses filter string to number', function () {
      this.handler.validateParams()

      return expect(typeof this.params.filter)
        .to.eql('number');
    });
  });
});