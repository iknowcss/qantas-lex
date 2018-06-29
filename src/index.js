/// - Util -----------------------------------------------------------------------------------------

const LOG_LEVEL = {
  SILENT: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  TRACE: 3
};
const logLevel = LOG_LEVEL.SILENT;
const logger = {
  trace: (...args) => logLevel >= LOG_LEVEL.TRACE ? console.log(...args) : null,
  info: (...args) => logLevel >= LOG_LEVEL.INFO ? console.info(...args) : null,
  warn: (...args) => logLevel >= LOG_LEVEL.WARN ? console.warn(...args) : null,
  error: (...args) => logLevel >= LOG_LEVEL.ERROR ? console.error(...args) : null
};

function delegate(options) {
  return {
    sessionAttributes: options.sessionAttributes || {},
    dialogAction: {
      type: 'Delegate',
      slots: options.slots || {},
    }
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

  if (!slots.Cuisine || !slots.Price || !slots.Suburb) {
    return delegate({ sessionAttributes, slots });
  }

  return {
    sessionAttributes: {},
    dialogAction: {
      type: 'Close',
      fulfillmentState: 'Fulfilled',
      message: {
        contentType: 'PlainText',
        content: `I found 3 ${slots.Price} ${slots.Cuisine} restaurants in ${slots.Suburb}! Here they are:`
      },
    },
  };
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
