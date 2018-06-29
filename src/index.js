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
    },
  }
}

// --------------- Intents -------------------------------------------------------------------------

function findSpendIdeas(intentRequest) {
  const { IdeaType } = intentRequest.currentIntent.slots;
  const source = intentRequest.invocationSource;
  const outputSessionAttributes = intentRequest.sessionAttributes || {};
  // const bookingMap = JSON.parse(outputSessionAttributes.bookingMap || '{}');

  return {
    "dialogAction": {
      "type": "ElicitIntent",
      "message": {
        "contentType": "PlainText",
        "content": "What kind of restaurant are you looking for?"
      },
      "intentName": "FindRestaurant"
    }
  };
}

function findRestaurants(intentRequest) {
  const slots = intentRequest.currentIntent.slots;
  const source = intentRequest.invocationSource;
  const sessionAttributes = intentRequest.sessionAttributes || {};

  if (!slots.CuisineSlot || !slots.PriceSlot || !slots.SuburbSlot) {
    return delegate({ sessionAttributes, slots });
  }

  const message = `I found 3 ${slots.PriceSlot} ${slots.CuisineSlot} restaurants in ${slots.SuburbSlot}! Here they are:`;
  return close(message, {
    sessionAttributes
  });
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
