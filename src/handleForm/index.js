const AWS = require('aws-sdk');
// Set region
AWS.config.update({region: 'us-west-2'});

// this Lambda function will
// write form data to DynamoDB table
// then send a welcome SNS

exports.handler = async message => {
  console.log(message);
  const formData = JSON.parse(message.body);
  const number = formData.phone;
  const parsedNumber = '+1001' + number.replace(/\D/g,''); // convert phone number to E.164 format for SNS
  const welcomeMessage = 'Thank you for signing up for the IRCO Notifier. You will receive text message reminders for your scheduled classes.';
  // initialize dynamodb
  const dynamodb = new AWS.DynamoDB();

  const tableParams = {
    Item: {
      'phone': {
        S: parsedNumber
      },
      'school': {
        S: formData.school
      },
      'programs': {
        SS: formData.programs // array of strings containing program names
      }
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: process.env.TABLE_NAME
  };
  console.log(`Writing new user data for number ${parsedNumber} to table ${process.env.TABLE_NAME}: ${tableParams}`)
  await dynamodb.putItem(tableParams).promise();

  // Create publish parameters
  const snsParams = {
    Message: welcomeMessage, /* required */
    // TopicArn: process.env.TOPIC_ARN,
    PhoneNumber: number,
    // PhoneNumber: parsedNumber,
    MessageAttributes: {
			'AWS.SNS.SMS.SMSType': {
				DataType: 'String',
				StringValue: 'Promotional'
			},
			'AWS.SNS.SMS.SenderID': {
				DataType: 'String',
				StringValue: 'IRCO'
			},
		},
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
    statusCode: 200
  };
};
