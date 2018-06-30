const data = require('./data.json');

function parsePriceString(priceClass) {
  const lowerString = priceClass.toLowerCase();
  const numberMatches = (lowerString.match(/(\d+)(?:\D+(\d+))?/) || []);
  if (!numberMatches) {
    return { min: 0, max: Infinity };
  }
  const numbers = [
    parseInt(numberMatches[1], 10),
    parseInt(numberMatches[2], 10)
  ];
  if (numbers[0] && numbers[1]) {
    return { min: numbers[0], max: numbers[1] };
  }
  if (/less +than|no +more +than|below|cheaper/.test(lowerString)) {
    return { min: 0, max: numbers[0] };
  }
  if (/more +than|at +least|above|expensive/.test(lowerString)) {
    return { min: numbers[0], max: Infinity };
  }

  return {
    min: Math.max(numbers[0] - 10, 0),
    max: numbers[0] + 10
  };
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
  return /^(whatever|any|any(where|thing)|any +[a-z]+|)$/i.test((s || '').trim().toLowerCase())
}

function normalizeSuburb(suburb) {
  const lowerSuburb = suburb.toLowerCase().trim();
  if (isAny(lowerSuburb) || lowerSuburb === 'sydney') return '*';
  if (/^(the +)?(cbd|city)$/.test(lowerSuburb)) return 'CBD';
  return suburb;
}

function normalizeQuery(query) {
  const { min: priceMin, max: priceMax } = priceClassToRange(query.price);
  const cuisine = isAny(query.cuisine) ? '*' : query.cuisine;
  return { priceMin, priceMax, cuisine, suburb: normalizeSuburb(query.suburb) };
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
