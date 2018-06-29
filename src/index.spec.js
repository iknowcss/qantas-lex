const index = require('./index');

describe('lambda entry', () => {
  it('does something', async () => {
    const responseJson = await expect(index.handler({
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
    })).to.be.fulfilled;

    expect(JSON.parse(responseJson)).to.eql({
      "dialogAction": {
        "type": "ElicitIntent",
        "message": {
          "contentType": "PlainText",
          "content": "What kind of restaurant are you looking for?"
        }
      }
    });
  });
});
