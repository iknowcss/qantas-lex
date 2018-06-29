function elicitIntent(message, options) {

}

exports.handler = async (event) => {
  console.log('Lex request event', event);
  return JSON.stringify({
    "dialogState": "ElicitSlot",
    "intentName": "FindRestaurant",
    "message": "What kind of food are you looking for?",
    "messageFormat": "PlainText",
    "responseCard": null,
    "sessionAttributes": {},
    "slotToElicit": "Cuisine",
    "slots": {
      "Cuisine": null,
      "Price": null
    }
  });
};
