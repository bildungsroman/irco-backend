const qs = require('qs');
const AWS = require('aws-sdk');
// Set region
AWS.config.update({region: 'us-west-2'});

// write form data to DynamoDB table
// send welcome SNS

exports.handler = async message => {
  const sns = new AWS.SNS();
  console.log(message);
  const formData = message;
  // const formData = qs.parse(message.body);
  // console.log(formData);
  // const number = formData.phone;
  const number = message.phone;
  const parsedNumber = '+1001' + number.replace(/\D/g,''); // convert phone number to E.164 format for SNS
  const welcomeMessage = 'Thank you for signing up for the IRCO Notifier. You will receive text message reminders for your scheduled classes.';
  // initialize dynamodb
  // const dynamodb = new AWS.DynamoDB();

  // const tableParams = {
  //   Item: {
  //     'phone': {
  //       S: formData.phone
  //     },
  //     'school': {
  //       S: formData.school
  //     },
  //     'programs': {
  //       S: formData.programs // array!
  //     }
  //   },
  //   ReturnConsumedCapacity: 'TOTAL',
  //   TableName: process.env.TABLE_NAME
  // };
  // await dynamodb.putItem(tableParams).promise();

  // Create publish parameters
  const snsParams = {
    Message: welcomeMessage, /* required */
    TopicArn: process.env.TOPIC_ARN,
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

  var subscribeParams = {
    Protocol: 'SMS', /* required */
    TopicArn: process.env.TOPIC_ARN, /* required */
    Endpoint: parsedNumber,
    ReturnSubscriptionArn: true
  };
  await sns.subscribe(subscribeParams, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
  // log to cloudwatch
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
