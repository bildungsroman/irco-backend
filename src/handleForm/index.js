const qs = require('qs');
const AWS = require('aws-sdk');
// Set region
AWS.config.update({region: 'us-west-2'});

// write form data to DynamoDB table
// send welcome SNS

exports.handler = async message => {
  console.log(message);
  // const formData = qs.parse(message.body);
  // console.log(formData);
  // const number = formData.phone;
  const number = message.phone;
  const parsedNumber = '+1001' + number.replace(/\D/g,''); // convert phone number to E.164 format for SNS
  const welcomeMessage = 'Thank you for signing up for the IRCO Notifier. You will receive text message reminders for your scheduled classes.';
  // initialize dynamodb
  const dynamodb = new AWS.DynamoDB();

  const tableParams = {
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
  await dynamodb.putItem(tableParams).promise();

  // Create publish parameters
  const snsParams = {
    Message: welcomeMessage, /* required */
    PhoneNumber: parsedNumber,
  };
  console.log(`Sending welcome message to number ${parsedNumber}: ${welcomeMessage}`);
  // Create promise and SNS service object
  const publishTextPromise = new AWS.SNS().publish(snsParams).promise();

  // Handle promise's fulfilled/rejected states
  publishTextPromise.then(
    function(data) {
      console.log("MessageID is " + data.MessageId);
    }).catch(
      function(err) {
      console.error(err, err.stack);
    });

  return {
    statusCode: 302,
    headers: {'Location': 'https://githubpageredirect.com/submitted'} // redirect in react app
  };
};
