const data = require('./data.json');

// casual
// street food
// fine dining

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
      return { min: 0, max: Infinity }
  }
}

function searchRestaurants(query) {
  const { price, cuisine, suburb } = query;
  const { min: priceMin, max: priceMax } = priceClassToRange(price);

  return data.restaurants.filter((restaurant) => {
    const { suburb: rSuburb, cuisine: rCuisines, price: rPriceString } = restaurant;
    const rPrice = parseInt(rPriceString, 10);

    if (rSuburb.toLowerCase() !== suburb.toLowerCase()) {
      return false;
    }
    if (rCuisines.map(c => c.toLowerCase()).indexOf(cuisine.toLowerCase()) < 0) {
      return false;
    }
    if (rPrice < priceMin || rPrice > priceMax) {
      return false;
    }

    return true;
  });
}

module.exports = searchRestaurants;
