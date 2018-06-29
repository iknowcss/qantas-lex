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

function searchRestaurants(query) {
  const { price, cuisine, suburb } = query;
  const { min: priceMin, max: priceMax } = priceClassToRange(price);

  return data.restaurants.filter((restaurant) => {
    const { suburb: rSuburb, cuisine: rCuisines, price: rPriceString } = restaurant;
    const rPrice = parseInt(rPriceString, 10);

    if (suburb.toLowerCase() !== 'any' && rSuburb.toLowerCase() !== suburb.toLowerCase()) {
      return false;
    }
    if (cuisine.toLowerCase() !== 'any' && rCuisines.map(c => c.toLowerCase()).indexOf(cuisine.toLowerCase()) < 0) {
      return false;
    }
    if (rPrice < priceMin || rPrice > priceMax) {
      return false;
    }

    return true;
  });
}

module.exports = searchRestaurants;
