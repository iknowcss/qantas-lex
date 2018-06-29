const searchRestaurants = require('./searchRestaurants');

describe('searchRestaurants', () => {
  it('finds cheap mexican', () => {
    expect(searchRestaurants({
      price: 'cheap',
      cuisine: 'mexican',
      suburb: 'newtown'
    })).to.eql([
      {
        "name": "Mad Mex",
        "suburb": "Newtown",
        "cuisine": ["mexican"],
        "price": "15",
        "imageUrl": "",
        "linkUrl": ""
      }
    ]);
  });

  it('finds casual mexican', () => {
    expect(searchRestaurants({
      price: 'casual',
      cuisine: 'mexican',
      suburb: 'newtown'
    })).to.eql([
      {
        "name": "Beach Burrito Co.",
        "suburb":  "Newtown",
        "cuisine": ["mexican"],
        "price": "40",
        "imageUrl": "",
        "linkUrl": ""
      }
    ]);
  });

  it('finds expensive japanese', () => {
    expect(searchRestaurants({
      price: 'expensive',
      cuisine: 'japanese',
      suburb: 'the rocks'
    })).to.eql([
      {
        "name": "Saké",
        "suburb":  "The Rocks",
        "cuisine": ["Japanese"],
        "price": "135",
        "imageUrl": "",
        "linkUrl": ""
      }
    ]);
  });

  it('returns an empty array when there are no matches', () => {
    expect(searchRestaurants({
      price: 'cheap',
      cuisine: 'japanese',
      suburb: 'CBD'
    })).to.eql([]);
  });
});
