const qs = require('qs');
const AWS = require('aws-sdk');

// write form data to DynamoDB table
// send welcome SNS

exports.handler = async message => {
  console.log(message);
  const formData = qs.parse(message.body);
  console.log(formData);

  const dynamodb = new AWS.DynamoDB();
  const params = {
    Item: {
      'phone': {
        S: formData.phone
      },
      'school': {
        S: formData.school
      },
      'programs': {
        S: formData.programs // array!
      }
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: process.env.TABLE_NAME
  };
  await dynamodb.putItem(params).promise();

  return {
    statusCode: 302,
    headers: {'Location': 'https://githubpageredirect.com/submitted'}
  };
};
