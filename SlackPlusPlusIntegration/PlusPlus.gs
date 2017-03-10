var PLUS_PLUS_GOOGLE_SPREADSHEET_ID = "ID OF GOOGLE SPREADSHEET ID FOR PLUS PLUS STORAGE HERE"

/*
// HELP message definition
*/
var plusPlusHelp = function() {
  return [
    {
      "title": "PlusPlus",
      "value": "Anywhere in your message, match any of the following formatted commands:\n" +
               "`@<name>++ [for <text>]`\n" +
               "`@<name>-- [for <text>]`\n" +
               "`[daily] scoreboard [with logs] [for @<name>]`\n" +
               "`weekly scoreboard [with logs] [for @<name>]`\n" +
               "`montly scoreboard [with logs] [for @<name>]`\n" +
               "`annual scoreboard [with logs] [for @<name>]`\n" +
               "`scoreboard since <mm/dd/yyyy> [with logs] [for @<name>]`",
      "short": true
    }
  ]
}

/*
// PlusPlus Request Handler
*/
var plusPlusRequestHandler = function(params) {
  var text = params.text;
  if (plusPlusMatch(text)) {
    // Parse the text
    var row = plusPlusMatch(text);
    row[2] = "'" + row[2];
    plusPlusResponse(row.slice(1));
  } else if (plusPlusScoreboardMatch(text)) {
    plusPlusScoreboardResponse(text)
  } else if (plusPlusTooMatch(text)) {
    var props = PropertiesService.getScriptProperties();
    var lastEntry = [
      props.getProperty('lastPlusPlusName'),
      props.getProperty('lastPlusPlusSign'),
      props.getProperty('lastPlusPlusFor')
    ];
    plusPlusResponse(lastEntry);
  }
}

/*
// ++/-- Functionality
*/
var plusPlusMatch = function(text) {
  return /(<?@[\w\d]+>?):?\s*(\+\+|\-\-|—)(?:\s+for\s+(.*))?/i.exec(text);
}

var plusPlusTooMatch = function(text) {
  return /^[\-+]{2}\s*$/.exec(text);
}

var updatePlusPlusProperties = function(newEntry) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('lastPlusPlusName', newEntry[0]);
  props.setProperty('lastPlusPlusSign', newEntry[1]);
  props.setProperty('lastPlusPlusFor', newEntry[2]);
}

var plusPlusResponse = function(newEntry) {
  // Get the PlusPlus Sheet
  var entriesSheet = SpreadsheetApp.openById(PLUS_PLUS_GOOGLE_SPREADSHEET_ID).getSheetByName("Entries");

  // Add this result
  newEntry.push(new Date());
  entriesSheet.appendRow(newEntry);
  updatePlusPlusProperties(newEntry);

  // Construct the response
  var name = newEntry[0];
  var count = 0;
  var entries = entriesSheet.getSheetValues(1, 1, entriesSheet.getLastRow(), entriesSheet.getLastColumn());

  var streak = 0;
  var streakMsg = "";

  var positivePhrases = ["JAMS it in!","Boom-shakalaka!","From Down-town!","Swish!","Razzle Dazzle!","It's good!"];
  var negativePhrases = ["Ugly shot!","Intercepted!", "Turns it over!"];

  var today = new Date();
  entries.forEach(
    function(entry) {
      var d = entry[3];
      var day = d.getDate();
      var m = d.getMonth();
      var y = d.getFullYear();
      // determine if this entry's date matches today
      if (day == today.getDate() && m == today.getMonth() && y == today.getFullYear()) {
        if (entry[0] == name) {
          if (entry[1] == "++") {
            count += 1;
            streak += 1;

            if (streak == 1) {
              streakMsg = positivePhrases[Math.floor(Math.random()*positivePhrases.length)] + ":fire:";
            }
            else if (streak == 2) {
              streakMsg = name + "'s heatin' up! :fire: :fire:";
            }
            else if (streak >= 3) {
              streakMsg = name + "'s ON FIRE! :fire: :fire: :fire:";
            }

          } else {
            count -= 1;
            streak = 0;
            streakMsg = negativePhrases[Math.floor(Math.random()*negativePhrases.length)];
          }
        }
      }
    }
  )

  var attachment = {
    "pretext": streakMsg,
    "mrkdwn_in": ["pretext"],
    "color": "#D00000"
  };
  postAttachmentResponse(attachment);
}

var nbaJamMatch = function(text) {
  return /[^:]+:\s*dunk on!/i.exec(text);
}

/*
// Scoreboard Functionality
*/

var plusPlusScoreboardMatch = function(text) {
  /*
  // Capture groups
  // [1] - daily/weekly/monthly/annual
  // [2] - since mm/dd/yyyy
  // [3] - with logs
  // [4] - for name
  */
  return /^(daily|weekly|monthly|annual)?\s*scoreboard(?:\s+since\s+(\d{1,2}\/\d{1,2}\/\d{4}))?(\s+with\s+logs)?(?:\s+for\s+(.+))?/i.exec(text);
}

var plusPlusScoreboardResponse = function(text) {
  // Get the PlusPlus Sheet
  var entriesSheet = SpreadsheetApp.openById(PLUS_PLUS_GOOGLE_SPREADSHEET_ID).getSheetByName("Entries");

  // Parse the text
  var match = plusPlusScoreboardMatch(text);
  var timeframe = match[1];
  var since = match[2];
  var logs = match[3];
  var name = match[4];

  // Construct the response
  var entries = entriesSheet.getSheetValues(1, 1, entriesSheet.getLastRow(), entriesSheet.getLastColumn());
  var fields = [];
  var nameValues = "";
  var logValues = "";
  var totalNameValues = "";
  var totalNonNameValues = "";
  var totals = {}

  var nameCheck;
  if (name) {
    nameCheck = function(n) { return n == name; };
  } else {
    nameCheck = function(n) { return true; };
  }

  // Determine sinceDate
  var sinceDate = new Date();
  switch(timeframe) {
    case "daily":
      break;
    case "weekly":
      var day = sinceDate.getDay()
      var diff = sinceDate.getDate() - day;
      sinceDate = new Date(sinceDate.setDate(diff));
      break;
    case "monthly":
      sinceDate = new Date(sinceDate.getFullYear(), sinceDate.getMonth(), 1);
      break;
    case "annual":
      sinceDate = new Date(sinceDate.getFullYear(), 0, 1);
      break;
  }

  if (since) {
    sinceDate = new Date(since);
  }
  sinceDate.setHours(0,0,0,0);
  var dateCheck = function(d) { return d >= sinceDate; };

  entries.forEach(
    function(entry) {
      var add = entry[1] == "++" ? 1: -1;
      var eName = entry[0];

      if (nameCheck(eName) && dateCheck(entry[3])) {
        nameValues += eName + "\n";
        logValues += entry[1] + " for " + entry[2] + "\n";
        if (eName in totals) {
          totals[eName] += add;
        } else {
          totals[eName] = add;
        }
      }
    }
  )

  //Convert totals to an array of objects
  totalsArray = []
  Object.keys(totals).forEach(
    function(eName) {
      totalsArray.push(
        {
          "itemName" : eName,
          "itemCount": totals[eName]
        }
      );
    }
  )

  //Sort totals array
  totalsArray.sort(
    function(a, b) {
      if (a.itemCount < b.itemCount) {
        return 1;
      } else {
        return -1;
      }
    }
  ).forEach(
    function(item) {
      if (/^<[^>]+>$/.exec(item.itemName)) {
        totalNameValues += item.itemName + ": " + item.itemCount + "\n";
      } else {
        totalNonNameValues += item.itemName + ": " + item.itemCount + "\n";
      }
    }
  )

  // Set the response fields
  var fields = []
  if (totalNameValues || totalNonNameValues) {
    if (logs) {
      fields.push({"title": "Name", "value": nameValues, "short": true});
      fields.push({"title": "Name", "value": logValues, "short": true});
    }
    fields.push({"title": "Total Points for Users", "value": totalNameValues, "short": true});
    fields.push({"title": "Total Points for Non-Users", "value": totalNonNameValues, "short": true});
  } else {
    fields.push({"title": "No entries matched your criteria!", "value": "Please adjust and try again.", "short": false});
  }

  sinceDate = timeframe ? timeframe + " point summary" : "point summary since " + Utilities.formatDate(sinceDate, "EST", "MM/dd/yyyy");
  var attachment = {
    "pretext": "PlusPlus " + sinceDate + (name ? " for " + name : "") + (logs ? " with logs" : "") + ":",
    "mrkdwn_in": ["pretext"],
    "color": "#D00000",
    "fields": fields.sort(function(a, b) {return b.value - a.value;})
  };
  postAttachmentResponse(attachment);
}

/*
// PlusPlus Request Testers
*/

function testPositvePlusPlusPost() {
  doPost({parameters:{
  token:"X71a2wYlUyj2jUzj0tNpnSrR",
  team_id:"T0001",
  team_domain:"example",
  channel_id:"C2147483705",
  channel_name:"test",
  timestamp:1355517523.000005,
  user_id:"U2147483697",
  user_name:"Steve",
  text: "<@U0685GNSF>++ for test", // Sean: <@U0685GNSF>, Rod: <@U068B0YKD>
  trigger_word: "googlebot:"}});
}

function testPositvePlusPlusTooPost() {
  doPost({parameters:{
  token:"X71a2wYlUyj2jUzj0tNpnSrR",
  team_id:"T0001",
  team_domain:"example",
  channel_id:"C2147483705",
  channel_name:"test",
  timestamp:1355517523.000005,
  user_id:"U2147483697",
  user_name:"Steve",
  text: "++", // Sean: <@U0685GNSF>, Rod: <@U068B0YKD>
  trigger_word: "googlebot:"}});
}

function testNegativePlusPlusPost() {
  doPost({parameters:{
  token:"X71a2wYlUyj2jUzj0tNpnSrR",
  team_id:"T0001",
  team_domain:"example",
  channel_id:"C2147483705",
  channel_name:"test",
  timestamp:1355517523.000005,
  user_id:"U2147483697",
  user_name:"Steve",
  text: "<@U0685GNSF>-- for test",
  trigger_word: "googlebot:"}});
}

function testNegativePlusPlusTooPost() {
  doPost({parameters:{
  token:"X71a2wYlUyj2jUzj0tNpnSrR",
  team_id:"T0001",
  team_domain:"example",
  channel_id:"C2147483705",
  channel_name:"test",
  timestamp:1355517523.000005,
  user_id:"U2147483697",
  user_name:"Steve",
  text: "--",
  trigger_word: "googlebot:"}});
}

function testNbaJamPost() {
  doPost({parameters:{
  token:"X71a2wYlUyj2jUzj0tNpnSrR",
  team_id:"T0001",
  team_domain:"example",
  channel_id:"C2147483705",
  channel_name:"test",
  timestamp:1355517523.000005,
  user_id:"U2147483697",
  user_name:"Steve",
  text: "dunk on <@U068B0YKD>",
  trigger_word: "googlebot:"}});
}


/* All Scoreboard Options
  "scoreboard"
  "scoreboard with logs"
  "scoreboard with logs for foo"
  "daily scoreboard"
  "daily scoreboard with logs"
  "daily scoreboard with logs for foo"
  "weekly scoreboard"
  "weekly scoreboard with logs"
  "weekly scoreboard with logs for foo"
  "monthly scoreboard"
  "monthly scoreboard with logs"
  "monthly scoreboard with logs for foo"
  "annual scoreboard"
  "annual scoreboard with logs"
  "annual scoreboard with logs for foo"
  "scoreboard since 10/21/2015"
  "scoreboard since 10/21/2015 with logs"
  "scoreboard since 10/21/2015 with logs for foo"
*/

function testPlusPlusScoreboardPost() {
  doPost({parameters:{
  token:"X71a2wYlUyj2jUzj0tNpnSrR",
  team_id:"T0001",
  team_domain:"example",
  channel_id:"C2147483705",
  channel_name:"test",
  timestamp:1355517523.000005,
  user_id:"U2147483697",
  user_name:"Steve",
  text: "scoreboard since 10/10/1001",
  trigger_word: "googlebot:"}});
}
