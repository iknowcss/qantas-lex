const index = require('./index');

describe('lambda entry', () => {
  it('does something', async () => {
    const responseJson = await expect(index.handler({
      messageVersion: '1.0',
      invocationSource: 'DialogCodeHook',
      // userId: 'esgtzomeyplw2nstkzgy1pd2iuoxiwuc',
      sessionAttributes: {},
      requestAttributes: null,
      bot: { name: 'SpendQantasPoints',
        alias: '$LATEST',
        version: '$LATEST'
      },
      outputDialogMode: 'Text',
      currentIntent: {
        name: 'FindRestaurant',
        slots: { Cuisine: null, Suburb: null, Price: null },
        // slotDetails: { Cuisine: [Object], Suburb: [Object], Price: [Object] },
        confirmationStatus: 'None'
      },
      inputTranscript: 'How can I spend my Qantas points'
    })).to.be.fulfilled;

    expect(JSON.parse(responseJson)).to.eql({
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
  });
});
