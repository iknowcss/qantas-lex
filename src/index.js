/// - Util -----------------------------------------------------------------------------------------

function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message, responseCard) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'ElicitSlot',
      intentName,
      slots,
      slotToElicit,
      message,
      responseCard,
    },
  };
}

function elicitIntent(sessionAttributes, intentName, slots, slotToElicit, message, responseCard) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'ElicitIntent',
      intentName,
      slots,
      slotToElicit,
      message,
      responseCard,
    },
  };
}

function confirmIntent(sessionAttributes, intentName, slots, message, responseCard) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'ConfirmIntent',
      intentName,
      slots,
      message,
      responseCard,
    },
  };
}

function close(sessionAttributes, fulfillmentState, message, responseCard) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'Close',
      fulfillmentState,
      message,
      responseCard,
    },
  };
}

function delegate(sessionAttributes, slots) {
  return {
    sessionAttributes,
    dialogAction: {
      type: 'Delegate',
      slots,
    },
  };
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
    return {
      sessionAttributes,
      dialogAction: {
        type: 'Delegate',
        slots: { Cuisine: null, Suburb: null, Price: null },
      }
    };
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
};

function routeIntentRequest(intentRequest) {
  console.log(`dispatch userId=${intentRequest.userId}, intent=${intentRequest.currentIntent.name}`);

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
  console.log('Lex request event', event);

  const response = routeIntentRequest(event);

  console.log('Lambda response', response);

  return response;
};
