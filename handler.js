const common = require('commensal-common');
const SearchHttpHandler = require('./src/httpHandlers/SearchHttpHandler');
const SwipeHttpHandler = require('./src/httpHandlers/SwipeHttpHandler');

module.exports.search = common.aws.lambdaWrapper(
  (event) => {
    searchHttpHandler = new SearchHttpHandler(event);
    return searchHttpHandler.get();
  },
);

module.exports.swipe = common.aws.lambdaWrapper(
  (event) => {
    swipeHttpHandler = new SwipeHttpHandler(event);
    return swipeHttpHandler.get();
  },
);

module.exports.serviceAuthorizer = common.aws.lambdaWrapper(
  (event) => {
    const authorizer = new common.aws.ServiceAuthorizer(event);
    return authorizer.authorize();
  },
);

module.exports.userAuthorizer = common.aws.lambdaWrapper(
  (event) => {
    const authorizer = new common.aws.UserAuthorizer(event);
    return authorizer.authorize();
  },
);
