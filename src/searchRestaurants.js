const data = require('./data.json');

function parsePriceString(priceClass) {
  const lowerString = priceClass.toLowerCase();
  const numbers = (lowerString.match(/\d+/) || [])[0];
  if (!numbers) {
    return { min: 0, max: Infinity };
  }
  const parsedNumber = parseInt(numbers, 0);
  if (/less +than|no +more +than|below|cheaper/.test(lowerString)) {
    return { min: 0, max: parsedNumber };
  }
  if (/more +than|at +least|above|expensive/.test(lowerString)) {
    return { min: parsedNumber, max: Infinity };
  }
  if (/around|about|something +like|approx/.test(lowerString)) {
    return {
      min: Math.max(parsedNumber - 10, 0),
      max: parsedNumber + 10
    };
  }

  return { min: 0, max: Infinity };
}

function priceClassToRange(priceClass) {
  switch (priceClass.toLowerCase()) {
    case 'street food':
    case 'cheap':
      return { min: 0, max: 30 };
    case 'casual':
      return { min: 30, max: 60 };
    case 'fine dining':
    case 'expensive':
      return { min: 60, max: Infinity };
    default:
      return parsePriceString(priceClass);
  }
}

function isAny(s) {
  return /^(any|anywhere|any +[a-z]+|)$/i.test((s || '').trim().toLowerCase())
}

function normalizeQuery(query) {
  const { min: priceMin, max: priceMax } = priceClassToRange(query.price);
  const cuisine = isAny(query.cuisine) ? '*' : query.cuisine;
  const suburb = isAny(query.suburb) ? '*' : query.suburb;
  return { priceMin, priceMax, cuisine, suburb };
}

function searchRestaurants(query) {
  let { cuisine, suburb, priceMin, priceMax } = normalizeQuery(query);

  return data.restaurants.filter((restaurant) => {
    const { suburb: rSuburb, cuisine: rCuisines, price: rPriceString } = restaurant;
    const rPrice = parseInt(rPriceString, 10);

    if (suburb !== '*' && rSuburb.toLowerCase() !== suburb.toLowerCase()) {
      return false;
    }
    if (cuisine !== '*' && rCuisines.map(c => c.toLowerCase()).indexOf(cuisine.toLowerCase()) < 0) {
      return false;
    }
    if (rPrice < priceMin || rPrice > priceMax) {
      return false;
    }

    return true;
  });
}

module.exports = searchRestaurants;
