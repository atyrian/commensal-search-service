const jwt = require('jsonwebtoken');
const moment = require('moment');
const AWS = require('aws-sdk');

async function generateToken() {
  const ssm = new AWS.SSM();
  const cert = await ssm.getParameters({ Names: ['jwtRS256.key'] }).promise();
  const payload = {
    iss: process.env.SCOPE_ID,
    sub: process.env.SCOPE_ID,
    exp: moment().unix() + 3600, // 1 hour
    aut: 'service',
  };
  const token = jwt.sign(payload, cert.Parameters[0].Value, { algorithm: 'RS256' });
  return token;
}

module.exports = generateToken;
