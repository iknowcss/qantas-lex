const { handler, findRestaurants } = require('./index');

describe('lambda entry', () => {
  xdescribe('HowSpend intent', () => {
    it('handles a request with no slots', () => {
      const result = findRestaurants({
        messageVersion: '1.0',
        invocationSource: 'DialogCodeHook',
        userId: 'mock-user-id',
        sessionAttributes: {},
        requestAttributes: null,
        bot: {
          name: 'SpendQantasPoints',
          alias: '$LATEST',
          version: '$LATEST'
        },
        outputDialogMode: 'Text',
        currentIntent: {
          name: 'FindRestaurant',
          slots: { Cuisine: null, Suburb: null, Price: null },
          confirmationStatus: 'None'
        },
        inputTranscript: 'What restaurants can I spend points at?'
      });

      expect(result).to.eql({

      });
    });
  });

  describe('FindRestaurants intent', () => {
    function buildFindRestaurantsRequest(options) {
      const slots = Object.assign({ Cuisine: null, Suburb: null, Price: null }, options.slots);
      return {
        messageVersion: '1.0',
        invocationSource: 'DialogCodeHook',
        userId: 'mock-user-id',
        sessionAttributes: {},
        requestAttributes: null,
        bot: {
          name: 'SpendQantasPoints',
          alias: '$LATEST',
          version: '$LATEST'
        },
        outputDialogMode: 'Text',
        currentIntent: {
          name: 'FindRestaurant',
          slots,
          confirmationStatus: 'None'
        },
        inputTranscript: 'What restaurants can I spend points at?'
      };
    }

    it('delegates a request with no slots', async () => {
      const result = await expect(handler(buildFindRestaurantsRequest({
        slots: { Cuisine: null, Suburb: null, Price: null }
      }))).to.be.fulfilled;

      expect(result).to.eql({
        sessionAttributes: {},
        dialogAction: {
          type: 'Delegate',
          slots: { Cuisine: null, Suburb: null, Price: null },
        },
      });
    });

    it('fulfills a request with all slots filled', async () => {
      const result = await expect(handler(buildFindRestaurantsRequest({
        slots: { Cuisine: 'Thai', Suburb: 'Newtown', Price: 'cheap' }
      }))).to.be.fulfilled;

      expect(result).to.eql({
        sessionAttributes: {},
        dialogAction: {
          type: 'Close',
          fulfillmentState: 'Fulfilled',
          message: {
            contentType: 'PlainText',
            content: 'I found 3 cheap Thai restaurants in Newtown! Here they are:'
          },
        },
      });
    });
  });

  // it('does something', async () => {
  //   const responseJson = await expect(index.handler({
  //     messageVersion: '1.0',
  //     invocationSource: 'DialogCodeHook',
  //     // userId: 'esgtzomeyplw2nstkzgy1pd2iuoxiwuc',
  //     sessionAttributes: {},
  //     requestAttributes: null,
  //     bot: { name: 'SpendQantasPoints',
  //       alias: '$LATEST',
  //       version: '$LATEST'
  //     },
  //     outputDialogMode: 'Text',
  //     currentIntent: {
  //       name: 'FindRestaurant',
  //       slots: { Cuisine: null, Suburb: null, Price: null },
  //       // slotDetails: { Cuisine: [Object], Suburb: [Object], Price: [Object] },
  //       confirmationStatus: 'None'
  //     },
  //     inputTranscript: 'How can I spend my Qantas points'
  //   })).to.be.fulfilled;
  //
  //   expect(JSON.parse(responseJson)).to.eql({
  //     "dialogState": "ElicitSlot",
  //     "intentName": "FindRestaurant",
  //     "message": "What kind of food are you looking for?",
  //     "messageFormat": "PlainText",
  //     "responseCard": null,
  //     "sessionAttributes": {},
  //     "slotToElicit": "Cuisine",
  //     "slots": {
  //       "Cuisine": null,
  //       "Price": null
  //     }
  //   });
  // });
  //
  // it('does something else', async () => {
  //   const responseJson = await expect(index.handler({
  //     messageVersion: '1.0',
  //     invocationSource: 'DialogCodeHook',
  //     // userId: 'esgtzomeyplw2nstkzgy1pd2iuoxiwuc',
  //     sessionAttributes: {},
  //     requestAttributes: null,
  //     bot: { name: 'SpendQantasPoints',
  //       alias: '$LATEST',
  //       version: '$LATEST'
  //     },
  //     outputDialogMode: 'Text',
  //     currentIntent: {
  //       name: 'FindRestaurant',
  //       slots: { Cuisine: null, Suburb: null, Price: null },
  //       // slotDetails: { Cuisine: [Object], Suburb: [Object], Price: [Object] },
  //       confirmationStatus: 'None'
  //     },
  //     inputTranscript: 'How can I spend my Qantas points'
  //   })).to.be.fulfilled;
  //
  //   expect(JSON.parse(responseJson)).to.eql({
  //     "dialogState": "ReadyForFulfillment",
  //     "intentName": "FindRestaurant",
  //     "message": null,
  //     "messageFormat": null,
  //     "responseCard": null,
  //     "sessionAttributes": {},
  //     "slotToElicit": null,
  //     "slots": {
  //       "Cuisine": "Thai",
  //       "Price": "Casual",
  //       "Suburb": "Coogee"
  //     }
  //   });
  // });
});
