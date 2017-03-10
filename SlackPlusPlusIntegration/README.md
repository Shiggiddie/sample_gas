# Slack Plus Plus Integration
Adds team kudos functionality to Slack

## Setup
* Create a new GAS project and copy all of the files into the project
* Create a Google Spreadsheet and name a Sheet `Entries`
* Fill in the Google Spreadsheet's ID for `PLUS_PLUS_GOOGLE_SPREADSHEET_ID`
* Create a Slack Outgoing Webhook and fill in the Webhook's token for `SLACK_OUTGOING_WEBHOOK_TOKEN`
* Create a Slack Incoming Webhook and fill in the Webhook's url for `SLACK_INCOMING_WEBHOOK_URL`
* Create a Slack Bot testing channel and fill in the channel name for `TEST_CHANNEL`
* Create or determine the default channel for the bot to post in and fill in the channel name for `DEFAULT_CHANNEL`
* Choose a default name for the bot and fill in the name for `DEFAULT_BOT_USERNAME`
* Upload or choose a default emoji to be used for the bot's avatar and fill in the emoji for `DEFAULT_BOT_EMOJI`
* Deploy the GAS project as a web app
* Update the Slack Outgoing Webhook to point to the GAS project's deployed URL

## Use in Slack
Anywhere in your message, match any of the following formatted commands:
* `@<name>++ [for <text>]`
* `@<name>-- [for <text>]`
* `[daily] scoreboard [with logs] [for @<name>]`
* `weekly scoreboard [with logs] [for @<name>]`
* `monthly scoreboard [with logs] [for @<name>]`
* `annual scoreboard [with logs] [for @<name>]`
* `scoreboard since <mm/dd/yyyy> [with logs] [for @<name>]`
