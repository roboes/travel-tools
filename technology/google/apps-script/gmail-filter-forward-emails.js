// Google Apps Script - Automatically forwards Gmail emails from specified senders with attachments, applies a label, and ensures they are not marked as spam
// Last update: 2025-01-09


// https://script.google.com > New project >
// - Editor > Services > Add a service > Gmail API
// - Triggers > Add Trigger >
// -- Choose which function to run: forwardNewEmails
// -- Choose which deployment should run: Head
// -- Select event source: Time-driven
// -- Select type of time based trigger: Minutes timer
// -- Select minute interval: Every 30 minutes


var lastRun = PropertiesService.getScriptProperties().getProperty('lastRun'); // Get last run time
if (!lastRun) {
  lastRun = new Date().getTime(); // If this is the first time the script runs, set the time to now
  PropertiesService.getScriptProperties().setProperty('lastRun', lastRun); // Save the current timestamp
}

function forwardNewEmails() {

  // Settings
  var forwardingEmailTo = "email_to@email.com";
  var sendersEmailFrom = ["email_from@email.com"];
  var labelName = "Label Name"

  // Search for emails from these senders, with attachments, and received after the last run
  var query = 'from:(' + sendersEmailFrom.join(' OR ') + ') has:attachment after:' + new Date(lastRun).toISOString();
  var threads = GmailApp.search(query);

  // Loop through all threads that meet the search criteria
  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var messages = thread.getMessages();

    // Check each message in the thread
    for (var j = 0; j < messages.length; j++) {
      var message = messages[j];

      // Forward the message to the specified email
      message.forward(forwardingEmailTo);

      // Apply the "labelName" label to the message
      var label = GmailApp.getUserLabelByName(labelName);
      if (!label) {
        label = GmailApp.createLabel(labelName); // Create the label if it doesn't exist
      }
      message.addLabel(label);

      // Ensure the message is not marked as spam
      message.markSpam(false);
    }
  }

  // Update the last run time
  PropertiesService.getScriptProperties().setProperty('lastRun', new Date().getTime());
}
