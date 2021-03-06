const searchRestaurants = require('./searchRestaurants');

/// - Util -----------------------------------------------------------------------------------------

const LOG_LEVEL = {
  SILENT: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  TRACE: 3
};
const logLevel = (process.env.LOG_LEVEL ? LOG_LEVEL[process.env.LOG_LEVEL.toUpperCase()] : null) || LOG_LEVEL.SILENT;
const logger = {
  trace: (...args) => logLevel >= LOG_LEVEL.TRACE ? console.log('[TRACE]', ...args) : null,
  info: (...args) => logLevel >= LOG_LEVEL.INFO ? console.info('[INFO]', ...args) : null,
  warn: (...args) => logLevel >= LOG_LEVEL.WARN ? console.warn('[WARN]', ...args) : null,
  error: (...args) => logLevel >= LOG_LEVEL.ERROR ? console.error('[ERROR]', ...args) : null
};

function delegate(options = {}) {
  return {
    sessionAttributes: options.sessionAttributes || {},
    dialogAction: {
      type: 'Delegate',
      slots: options.slots || {},
    }
  }
}

function close(content, options = {}) {
  if (!content) {
    throw new Error('Content argument is required');
  }

  return {
    sessionAttributes: options.sessionAttributes || {},
    dialogAction: {
      type: 'Close',
      fulfillmentState: options.fulfillmentState || 'Fulfilled',
      message: {
        contentType: options.contentType || 'PlainText',
        content
      },
      responseCard: options.responseCard
    },
  }
}

function formatPrice(price) {
  return `\$${price} and up`;
}

// --------------- Intents -------------------------------------------------------------------------

function findSpendIdeas(intentRequest) {
  const confirmationStatus = intentRequest.currentIntent.confirmationStatus;
  const invocationSource = intentRequest.invocationSource;
  const sessionAttributes = intentRequest.sessionAttributes || {};

  return {
    sessionAttributes,
    "dialogAction": {
      "type": "ElicitIntent",
      "message": {
        "contentType": "PlainText",
        "content": "Describe what kind of restaurant you're looking for. You can include things like cuisine, suburb, or price point"
      }
    }
  };
}

function findRestaurants(intentRequest) {
  const slots = intentRequest.currentIntent.slots;
  const source = intentRequest.invocationSource;
  const sessionAttributes = intentRequest.sessionAttributes || {};

  logger.trace('Slots', slots);

  if (!slots.CuisineSlot || !slots.PriceSlot || !slots.SuburbSlot) {
    return delegate({ sessionAttributes, slots });
  }

  const {
    PriceSlot: price,
    CuisineSlot: cuisine,
    SuburbSlot: suburb,
  } = slots;

  function isAllRestaurantQuery(query) {
    return query.price === '*'
      && query.cuisine === '*'
      && query.suburb === '*';
  }

  function expandRestaurantQuery(query) {
    if (query.price !== '*') return Object.assign({}, query, { price: '*' });
    if (query.cuisine !== '*') return Object.assign({}, query, { cuisine: '*' });
    if (query.suburb !== '*') return Object.assign({}, query, { suburb: '*' });
  }

  let currentSlots = { price, cuisine, suburb };
  let restaurants = searchRestaurants(currentSlots);
  let isSearchExpanded = false;
  while (restaurants.length <= 0 && !isAllRestaurantQuery(currentSlots)) {
    isSearchExpanded = true;
    currentSlots = expandRestaurantQuery(currentSlots);
    restaurants = searchRestaurants(currentSlots);
  }

  if (restaurants.length <= 0) {
    const sessionAttributes = intentRequest.sessionAttributes || {};

    return {
      sessionAttributes,
      "dialogAction": {
        "type": "ElicitIntent",
        "message": {
          "contentType": "PlainText",
          "content": 'I couldn\'t find any restaurants matching that criteria. What other kind of restaurant are interested in?'
        }
      }
    };
  }

  const message = isSearchExpanded
    ? 'Hmm, I couldn\'t find an exact match, but here are some other options'
    : 'Here\'s what I found!';

  return close(message, { sessionAttributes, responseCard: {
    contentType: 'application/vnd.amazonaws.card.generic',
    genericAttachments: restaurants.slice(0, 3).map((restaurant) => {
      const name = restaurant.name;
      const suburb = restaurant.suburb;
      const price = restaurant.price;
      const cuisine = restaurant.cuisine || [];
      const imageUrl = restaurant.imageUrl;
      const linkUrl = restaurant.linkUrl;

      const result = {
        title: `"${name}" in ${suburb}`,
        subTitle: `${cuisine.join(', ')} | ${formatPrice(price)}`,
        // buttons: [
        //   {
        //     text: 'button-text',
        //     value: 'Value sent to server on button click'
        //   }
        // ]
      };

      if (imageUrl) {
        result.imageUrl = imageUrl;
      }

      if (linkUrl) {
        result.attachmentLinkUrl = linkUrl;
      }

      return result;
    })
  }});
}

function routeIntentRequest(intentRequest) {
  logger.trace(`dispatch userId=${intentRequest.userId}, intent=${intentRequest.currentIntent.name}`);

  const name = intentRequest.currentIntent.name;

  // Dispatch to your skill's intent handlers
  switch (name) {
    case 'HowSpend':
      return findSpendIdeas(intentRequest);
    case 'FindRestaurant':
      return findRestaurants(intentRequest);
    default:
      throw new Error(`Intent "${name}" not supported`);
  }
}

/// - Entry ----------------------------------------------------------------------------------------

exports.handler = async (event) => {
  logger.trace('Lex request event', event);

  const response = routeIntentRequest(event);

  logger.trace('Lambda response', response);

  return response;
};
