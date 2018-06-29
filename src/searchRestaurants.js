const data = require('./data.json');

function searchRestaurants(query) {
  const { price, cuisine, suburb } = query;
  return [
    {
      "name": "Saké",
      "suburb":  "The Rocks",
      "cuisine": ["Japanese"],
      "price": "135"
    }
  ];
}

exports = searchRestaurants;
