function elicitIntent(message, options) {

}

exports.handler = async (event) => {
  console.log('Lex request event', event);
  return {
    "dialogAction": {
      "type": "ElicitSlot",
      "message": {
        "contentType": "PlainText",
        "content": "What kind of restaurant are you looking for?"
      },
      "intentName": "FindRestaurant",
      "slots": {
        "Cuisine": null,
        "Price": null,
        "Suburb": null
      },
      "slotToElicit" : "Cuisine"
    }
  };
};
