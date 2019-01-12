const AWS = require('aws-sdk');
// Set region
AWS.config.update({region: 'us-west-2'});

// parse info coming in from Dynamo
// then send appropriate SNS

exports.handler = async message => {
  const parsedObj = JSON.stringify(message);
  // const dynamoData = message['dynamodb'];
  console.log(parsedObj);

  return {
    statusCode: 200
  };
};
