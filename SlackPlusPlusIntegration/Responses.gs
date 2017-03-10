var TEST_CHANNEL = "ENTER TEST CHANNEL, e.g. #bottesting";
var DEFAULT_CHANNEL = "ENTER DEFAULT CHANNEL, e.g. #general";
var DEFAULT_BOT_USERNAME = "ENTER DEFAULT BOT USERNAME";
var DEFAULT_BOT_EMOJI = "ENTER DEFAULT BOT EMOJI, used as the bot's avatar, e.g. :ghost:"
var SLACK_INCOMING_WEBHOOK_URL = "ENTER INCOMING WEBHOOK URL HERE"
/*
// Set testMode
// Exposes a runnable function within your GAS project for setting/unsetting
// Test Mode for your dev and production responses
*/
function setTestMode() {
  var scriptProperty = PropertiesService.getScriptProperties();
  scriptProperty.setProperty('testMode', 'false');
}

/*
// Sends Post Response to a configured Slack Inbound Webhook URL
//
// attachment - the response (required)
// toChannel - channel the response should post to (#general by default)
// username - the user the response will show up as (PWW by default)
// emoji - the user emoji the response will show up as (:pww: by default)
//
*/
var postAttachmentResponse = function(attachment, channel, username, emoji) {
  /*
  // Determine Test Mode run the setTestMode function after modifying the
  // setProperty function appropriately
  */
  var testMode = eval(PropertiesService.getScriptProperties().getProperty('testMode'));

  channel = testMode ? TEST_CHANNEL : typeof channel !== 'undefined' ?  channel : DEFAULT_CHANNEL;
  username = typeof username !== 'undefined' ?  username : DEFAULT_BOT_USERNAME;
  emoji = typeof emoji !== 'undefined' ?  emoji : DEFAULT_BOT_EMOJI;

  if (!('fallback' in attachment)) {
    attachment['fallback'] = "This is an update from a Slackbot integrated into your organization. Your client chose not to show the attachment.";
  }

  var payload = {
    "channel": channel,
    "username": username,
    "icon_emoji": emoji,
    "link_names": 1,
    "attachments":[attachment],
    "unfurl_media": true,
    "unfurl_links": true
  };

  var url = SLACK_INCOMING_WEBHOOK_URL;
  var options = {
    'method': 'post',
    'payload': JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(url,options);
}

var postPayloadResponse = function(payload, channel, username, emoji) {
  /*
  // Determine Test Mode run the setTestMode function after modifying the
  // setProperty function appropriately
  */
  var testMode = eval(PropertiesService.getScriptProperties().getProperty('testMode'));

  channel = testMode ? TEST_CHANNEL : typeof channel !== 'undefined' ?  channel : DEFAULT_CHANNEL;
  username = typeof username !== 'undefined' ?  username : DEFAULT_BOT_USERNAME;
  emoji = typeof emoji !== 'undefined' ?  emoji : DEFAULT_BOT_EMOJI;

  payload["channel"] = channel
  payload["username"] = username
  payload["icon_emoji"] = emoji

  var url = SLACK_INCOMING_WEBHOOK_URL;
  var options = {
    'method': 'post',
    'payload': JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(url,options);
}

var slashCommandResponse = function(playload) {
  // Note: slashCommandReponse is in response to an HTTP Request, thus its use must always be "returned"
  //       e.g. return slashCommandResponse({text: 'text response'})
  return ContentService.createTextOutput(JSON.stringify(playload)).setMimeType(ContentService.MimeType.JSON);
}
