const { handler, findRestaurants } = require('./index');

describe('lambda entry', () => {
  describe('HowSpend intent', () => {
    function buildFindSpendIdeasRequest(options) {
      const slots = Object.assign({
        // TODO
      }, options.slots);
      return {
        messageVersion: '1.0',
        invocationSource: options.invocationSource || 'DialogCodeHook',
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
          name: 'HowSpend',
          slots,
          confirmationStatus: 'None'
        },
        inputTranscript: 'What restaurants can I spend points at?'
      };
    }

    it('handles a fulfillent request', async () => {
      const result = await expect(handler(buildFindSpendIdeasRequest({
        invocationSource: 'FulfillmentCodeHook'
      }))).to.be.fulfilled;

      expect(result).to.eql({
        sessionAttributes: {},
        dialogAction: {
          type: 'ElicitIntent',
          message: {
            contentType: "PlainText",
            content: 'What kind of restaurant are you looking for?'
          }
        },
      });
    });
  });

  describe('FindRestaurants intent', () => {
    function buildFindRestaurantsRequest(options) {
      const slots = Object.assign({
        CuisineSlot: null,
        SuburbSlot: null,
        PriceSlot: null
      }, options.slots);
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
        slots: { CuisineSlot: null, SuburbSlot: null, PriceSlot: null }
      }))).to.be.fulfilled;

      expect(result).to.eql({
        sessionAttributes: {},
        dialogAction: {
          type: 'Delegate',
          slots: { CuisineSlot: null, SuburbSlot: null, PriceSlot: null },
        },
      });
    });

    it('delegates a request with some slots', async () => {
      const result = await expect(handler(buildFindRestaurantsRequest({
        slots: { CuisineSlot: null, SuburbSlot: 'Coogee', PriceSlot: null }
      }))).to.be.fulfilled;

      expect(result).to.eql({
        sessionAttributes: {},
        dialogAction: {
          type: 'Delegate',
          slots: { CuisineSlot: null, SuburbSlot: 'Coogee', PriceSlot: null },
        },
      });
    });

    it('fulfills a request with all slots filled', async () => {
      const result = await expect(handler(buildFindRestaurantsRequest({
        slots: { CuisineSlot: 'Thai', SuburbSlot: 'Newtown', PriceSlot: 'cheap' }
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
});
