const AWS = require('aws-sdk');
// Set region
AWS.config.update({region: 'us-west-2'});

// parse info coming in from Dynamo
// then send appropriate SNS

exports.handler = async message => {
  const parsedMessage = JSON.parse(message.dynamodb);
  const dynamoData = parsedMessage.dynamodb;
  console.log(dynamoData);
  return {};
};
