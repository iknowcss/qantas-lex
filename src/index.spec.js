const proxyquire = require('proxyquire');

const sandbox = sinon.createSandbox();
const searchRestaurantsStub = sandbox.stub();
const { handler, findRestaurants } = proxyquire('./index', {
  './searchRestaurants': searchRestaurantsStub
});

describe('lambda entry', () => {
  beforeEach(() => {
    sandbox.reset();
  });

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
            content: 'Describe the kind of restaurant you\'re interested in. You can include cuisine, suburb, and a price point'
          }
        }
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
      searchRestaurantsStub.returns([ {} ]);

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
            content: 'Here\'s what I found!'
          },
          responseCard: {
            contentType: 'application/vnd.amazonaws.card.generic',
            genericAttachments: [
              {
                title: '\"undefined\" in undefined',
                subTitle: ' | $undefined and up'
              }
            ]
          }
        },
      });
    });

    it('expands the search when a request returns no results', async () => {
      searchRestaurantsStub
        .onFirstCall().returns([])
        .onSecondCall().returns([])
        .onThirdCall().returns([ {} ]);

      const result = await expect(handler(buildFindRestaurantsRequest({
        slots: { CuisineSlot: 'Thai', SuburbSlot: 'Newtown', PriceSlot: 'cheap' }
      }))).to.be.fulfilled;

      // First attempt
      expect(searchRestaurantsStub.args[0][0]).to.eql({
        price: 'cheap',
        cuisine: 'Thai',
        suburb: 'Newtown'
      });

      // 1st expansion
      expect(searchRestaurantsStub.args[1][0]).to.eql({
        price: '*',
        cuisine: 'Thai',
        suburb: 'Newtown'
      });

      // 2nd expansion
      expect(searchRestaurantsStub.args[2][0]).to.eql({
        price: '*',
        cuisine: '*',
        suburb: 'Newtown'
      });

      expect(result).to.eql({
        sessionAttributes: {},
        dialogAction: {
          type: 'Close',
          fulfillmentState: 'Fulfilled',
          message: {
            contentType: 'PlainText',
            content: 'Hmm, I couldn\'t find an exact match, but here are some other options'
          },
          responseCard: {
            contentType: 'application/vnd.amazonaws.card.generic',
            genericAttachments: [
              {
                title: '\"undefined\" in undefined',
                subTitle: ' | $undefined and up'
              }
            ]
          }
        },
      });
    });

    it('fails a request with no results', async () => {
      searchRestaurantsStub.returns([]);

      const result = await expect(handler(buildFindRestaurantsRequest({
        slots: { CuisineSlot: 'Thai', SuburbSlot: 'Newtown', PriceSlot: 'cheap' }
      }))).to.be.fulfilled;

      expect(result).to.eql({
        sessionAttributes: {},
        dialogAction: {
          type: 'ElicitIntent',
          message: {
            contentType: "PlainText",
            content: 'I couldn\'t find any restaurants matching that criteria. What other kind of restaurant are interested in?'
          }
        }
      });
    });
  });
});
