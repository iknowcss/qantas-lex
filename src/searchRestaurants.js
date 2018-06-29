const data = require('./data.json');

function searchRestaurants(query) {
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
