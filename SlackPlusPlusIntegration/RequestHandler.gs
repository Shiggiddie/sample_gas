var SLACK_OUTGOING_WEBHOOK_TOKEN = "PLACE YOUR TOKEN HERE";
var HELP_REGEX = /HELP REGEX GOES HERE/i

var helpResponse = function() {
  var fields = []
  for (functionName in this) {
    // Each piece of functionality is expected to define a <functionality>Help
    if (functionName.match('Help$')) {
      fields = fields.concat(eval(functionName)());
    }
  }

  var attachment = {
    "pretext": "Let me help you out. Here's what I can do:",
    "mrkdwn_in": ["pretext", "fields"],
    "color": "#D00000",
    "fields": fields
  };
  postAttachmentResponse(attachment);
}

function doPost(req) {
  var params = req.parameters;
  var text = params.text;

  // Ensure the request is coming from the Slack Outgoing Webhook
  if (params.token == SLACK_OUTGOING_WEBHOOK_TOKEN) {
    // If the request is not for help...
    if (HELP_REGEX.exec(text)) {
      helpResponse();
    } else {
    // ...then attempt to run the message through all <functionality>RequestHandlers
      for (functionName in this) {
        if (functionName.match('RequestHandler$')) {
          eval(functionName)(params);
        }
      }
    }
  } else {
    Logger.log('response did not pass token');
    // Do anything you wish here to respond to requests that aren't from Slack
  }
}

/*
// Request Testers
*/

function testInvokeHelp1Post() {
  doPost({parameters:{
  token:SLACK_OUTGOING_WEBHOOK_TOKEN,
  team_id:"T0001",
  team_domain:"example",
  channel_id:"C2147483705",
  channel_name:"test",
  timestamp:1355517523.000005,
  user_id:"U2147483697",
  user_name:"Steve",
  text: "help",
  trigger_word: "googlebot:"}});
}

function testInvokeHelp2Post() {
  doPost({parameters:{
  token:SLACK_OUTGOING_WEBHOOK_TOKEN,
  team_id:"T0001",
  team_domain:"example",
  channel_id:"C2147483705",
  channel_name:"test",
  timestamp:1355517523.000005,
  user_id:"U2147483697",
  user_name:"Steve",
  text: "help me, you're my only hope!",
  trigger_word: "googlebot:"}});
}
