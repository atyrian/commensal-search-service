const sinon = require("sinon");
const chai = require('chai');
const sandbox = require('sinon').createSandbox();
const expect = require('chai').expect;
const { assert } = require('chai');

chai.should();
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

const SwipeHttpHandler = require('../../src/httpHandlers/SwipeHttpHandler');
const DatabaseHandler = require('../../src/DatabaseHandler');
describe('tests for SwipeHttpHandler', function () {
  beforeEach(function () {
    this.event = {
      pathParameters: { id: '1' },
      queryStringParameters: { id: '2', like: '1' }
    };
    this.handler = new SwipeHttpHandler(this.event);
    process.env.API_URL = 'well-known-API-url/dev';
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('_validateParameters()', function () {
    it('throws HTTP 400 when id not in query parameters', function () {
      delete this.event.queryStringParameters.id;
      return expect(() => {
        this.handler._validateParameters()
      }).to.throw('Expected numeric query parameters: id, like')
        .that.has.property('statusCode')
        .that.is.equal(400);
    });

    it('throws HTTP 400 when like not in query parameters', function () {
      delete this.event.queryStringParameters.like;
      return expect(() => {
        this.handler._validateParameters()
      }).to.throw('Expected numeric query parameters: id, like')
        .that.has.property('statusCode')
        .that.is.equal(400);
    });

    it('throws HTTP 400 when querystring parameter like not 0 || 1', function () {
      this.event.queryStringParameters.like = 3;
      return expect(() => {
        this.handler._validateParameters()
      }).to.throw('Expected like to have value 0 || 1')
        .that.has.property('statusCode')
        .that.is.equal(400);
    });

    it('throws HTTP 409 when path id === query id', function () {
      this.event.queryStringParameters.id = '1';
      return expect(() => {
        this.handler._validateParameters()
      }).to.throw('Invalid operation')
        .that.has.property('statusCode')
        .that.is.equal(409);
    });

    it('throws HTTP 400 when id not in path parameters', function () {
      delete this.event.pathParameters.id;
      return expect(() => {
        this.handler._validateParameters()
      }).to.throw('Bad request. Missing or malformed path param id')
        .that.has.property('statusCode')
        .that.is.equal(400);
    });
    it('Returns an object with keys base_id, target_id and boolean like', function () {
      const res = this.handler._validateParameters();
      expect(res).to.have.property('base_id', this.event.pathParameters.id);
      expect(res).to.have.property('like', true);
      expect(res).to.have.property('target_id', this.event.queryStringParameters.id);
    });
  });

  describe('swipe()', function () {
    it('registers swipe in db and builds API url with query string and calls makeAPIRequest()', function () {
      const params = { base_id: '1', target_id: '2', like: true }
      dbHandler = new DatabaseHandler(params);
      const makeAPIRequestStub = sandbox.stub(this.handler, 'makeAPIRequest');
      const dbHandlerSwipeStub = sandbox.stub(dbHandler, 'swipe').resolves(true);

      return expect(this.handler.swipe(dbHandler, 'sometoken', params))
        .to.eventually.be.fulfilled
        .then((data) => {
          expect(data).to.be.equal(true);

          makeAPIRequestStub.should.have.been.calledWith(process.env.API_URL + `/user/${params.target_id}/partial`,
            'PUT',
            'sometoken',
            { shown_to: params.base_id });

          dbHandlerSwipeStub.should.have.been.calledOnce;
        });
    });
  });

  describe('isMatch()', function () {
    it('returns false if target swipe exists and like is false', function () {
      const params = { base_id: '1', target_id: '2', like: false }
      dbHandler = new DatabaseHandler(params);
      const dbHandlerTargetSwipe = sandbox.stub(dbHandler, 'findTargetSwipe').resolves(false);

      return expect(this.handler.isMatch(dbHandler, params, 'sometoken'))
        .to.eventually.be.fulfilled
        .then((data) => {
          expect(data).to.be.equal(false);
          dbHandlerTargetSwipe.should.have.been.calledOnce;
        });
    });

    it('creates a match in case of mutual like', function () {
      const params = { base_id: '1', target_id: '2', like: true }
      dbHandler = new DatabaseHandler(params);
      const dbHandlerTargetSwipe = sandbox.stub(dbHandler, 'findTargetSwipe').resolves(true);
      const dbHandlerMatchStub = sandbox.stub(dbHandler, 'createMatch').resolves({ isMatch: true, match_id: 'someId' });

      return expect(this.handler.isMatch(dbHandler, params, 'sometoken'))
        .to.eventually.be.fulfilled
        .then((data) => {
          expect(data).to.be.equal(true);
          dbHandlerTargetSwipe.should.have.been.calledOnce;
          dbHandlerMatchStub.should.have.been.calledOnce;
        });
    });

    it('builds API url and makes API request in case of match', function () {
      const params = { base_id: '1', target_id: '2', like: true }
      dbHandler = new DatabaseHandler(params);
      const dbHandlerTargetSwipe = sandbox.stub(dbHandler, 'findTargetSwipe').resolves(true);
      const dbHandlerMatchStub = sandbox.stub(dbHandler, 'createMatch').resolves({ isMatch: true, match_id: 'someId' });
      const makeAPIRequestStub = sandbox.stub(this.handler, 'makeAPIRequest');

      return expect(this.handler.isMatch(dbHandler, params, 'sometoken'))
        .to.eventually.be.fulfilled
        .then(() => {
          makeAPIRequestStub.should.have.been.calledWith(process.env.API_URL + `/users/match?matchid=someId&userid=${params.base_id}&userid=${params.target_id}`,
            'PUT',
            'sometoken'
          );
        });
    });
  });
});