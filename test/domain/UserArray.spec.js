const chai = require('chai');
const sandbox = require('sinon').createSandbox();
const expect = require('chai').expect;

chai.should();
chai.use(require('chai-as-promised'));

const UserArray = require('../../src/domain/UserArray');

describe('tests for UserArray', function () {
  beforeEach(function () {
    this.sut = new UserArray;
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('_filterResponse', function () {
    it('filters a two dimensional array and returns a single array of users', function () {
      const data = [[{
        attrs: {
          id: 1,
          pref: 0,
          person: { last_name: '' }
        }
      },
      {
        attrs: {
          id: 2,
          pref: 0,
          person: { last_name: '' }
        }
      }],
      [{
        attrs: {
          id: 3,
          pref: 1,
          person: { last_name: '' }
        }
      }]]
      const resp = this.sut._filterResponse(data);

      expect(resp).to.have.length(3)
      expect(resp[0]).to.have.keys(['id', 'person', 'pref']);
      expect(resp[0]).to.not.have.keys(['last_name']);
    });
  });
});
