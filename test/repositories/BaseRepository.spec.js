const sinon = require("sinon");
const chai = require('chai');
const sandbox = require('sinon').createSandbox();
const expect = require('chai').expect;

const BaseRepository = require('../../src/repositories/BaseRepository');

chai.should();
chai.use(require('chai-as-promised'));

describe('tests for BaseRepository', function () {
  beforeEach(function () {
    this.params = {
      id: '2',
      filter: '1',
      geohashes: ['u3chr', 'u3chq', 'u3chp', 'u3chn'],
      active_from: 1550871560,
      active_to: 1550871580
    };

    this.baseRepo = new BaseRepository('User', {
      hashKey: 'id',
      rangeKey: 'geohash',
      timestamps: true,
      createdAt: 'created_at',
    }, { tableName: 'commensal-user' }, 'geohash-time-index')
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('loadArray', function () {
    it('async queries geohashes iteratively with filter and adds each response to response array', function () {
      const execQueryStub = sandbox.stub(this.baseRepo, 'execQuery').resolves([{ user: 'user' }]);

      return expect(this.baseRepo.loadArray(this.params))
        .to.eventually.be.fulfilled
        .then((data) => {
          expect(Array.isArray(data)).to.be.true;
          expect(data).to.have.length(4);
          sinon.assert.callCount(execQueryStub, 4);
          const options = execQueryStub.getCall(0).args[0];
          expect(options.request.FilterExpression.includes('(#person.#gender = :person_gender)'))
            .to.be.true;
        });
    });

    it('when filter is null, query does not include FilterExpression', function () {
      const execQueryStub = sandbox.stub(this.baseRepo, 'execQuery').resolves([{ user: 'user' }]);
      this.params.filter = null;

      return expect(this.baseRepo.loadArray(this.params))
        .to.eventually.be.fulfilled
        .then((data) => {
          expect(Array.isArray(data)).to.be.true;
          expect(data).to.have.length(4);
          sinon.assert.callCount(execQueryStub, 4);
          const options = execQueryStub.getCall(0).args[0];
          expect(options.request.FilterExpression.includes('(#person.#gender = :person_gender)'))
            .to.be.false;
        });
    });
  });
});