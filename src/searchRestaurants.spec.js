const proxyquire = require('proxyquire');
const testData = require('./testData.json');
const searchRestaurants = proxyquire('./searchRestaurants', {
  './data.json': testData
});

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

  it('handles any cuisine', () => {
    expect(searchRestaurants({
      price: 'cheap',
      cuisine: '*',
      suburb: 'newtown'
    })).to.eql([
      {
        "name": "Mad Mex",
        "suburb":  "Newtown",
        "cuisine": ["mexican"],
        "price": "15",
        "imageUrl": "",
        "linkUrl": ""
      },
      {
        "name": "Dumpling King",
        "suburb":  "Newtown",
        "cuisine": ["chinese"],
        "price": "20",
        "imageUrl": "",
        "linkUrl": ""
      }
    ]);
  });

  it('handles any suburb', () => {
    expect(searchRestaurants({
      price: '*',
      cuisine: 'mexican',
      suburb: '*'
    })).to.eql([
      {
        "name": "Chica Bonita",
        "suburb":  "Manly",
        "cuisine": ["mexican"],
        "price": "40",
        "imageUrl": "",
        "linkUrl": ""
      },
      {
        "name": "Mad Mex",
        "suburb":  "Newtown",
        "cuisine": ["mexican"],
        "price": "15",
        "imageUrl": "",
        "linkUrl": ""
      },
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

  it('handles less than price range', () => {
    expect(searchRestaurants({
      price: 'less than $20',
      cuisine: '*',
      suburb: '*'
    })).to.eql([
      { name: 'Criniti\'s',
        suburb: 'Castle Hill',
        cuisine: [ 'Australian' ],
        price: '20',
        imageUrl: '',
        linkUrl: ''
      },
      { name: 'Mad Mex',
        suburb: 'Newtown',
        cuisine: [ 'mexican' ],
        price: '15',
        imageUrl: '',
        linkUrl: '' },
      { name: 'Dumpling King',
        suburb: 'Newtown',
        cuisine: [ 'chinese' ],
        price: '20',
        imageUrl: '',
        linkUrl: ''
      }
    ]);
  });

  it('handles more than than price range', () => {
    expect(searchRestaurants({
      price: 'at least $100',
      cuisine: '*',
      suburb: '*'
    })).to.eql([
      {
        name: 'Saké',
        suburb: 'The Rocks',
        cuisine: [ 'Japanese' ],
        price: '135',
        imageUrl: '',
        linkUrl: ''
      },
      {
        name: 'Catalina',
        suburb: 'Rose Bay',
        cuisine: [ 'Australian' ],
        price: '100',
        imageUrl: '',
        linkUrl: ''
      }
    ]);
  });

  it('handles approximate price range', () => {
    expect(searchRestaurants({
      price: 'around $20',
      cuisine: '*',
      suburb: '*'
    })).to.eql([
      { name: 'Criniti\'s',
      suburb: 'Castle Hill',
      cuisine: [ 'Australian' ],
      price: '20',
      imageUrl: '',
      linkUrl: '' },
      { name: 'Time for Thai',
        suburb: 'Coogee',
        cuisine: [ 'thai' ],
        price: '30',
        imageUrl: '',
        linkUrl: '' },
      { name: 'Mad Mex',
        suburb: 'Newtown',
        cuisine: [ 'mexican' ],
        price: '15',
        imageUrl: '',
        linkUrl: '' },
      { name: 'Dumpling King',
        suburb: 'Newtown',
        cuisine: [ 'chinese' ],
        price: '20',
        imageUrl: '',
        linkUrl: '' }
        ]
    );
  });

  it('returns an empty array when there are no matches', () => {
    expect(searchRestaurants({
      price: 'cheap',
      cuisine: 'japanese',
      suburb: 'CBD'
    })).to.eql([]);
  });

  it('normalises "any" type queries', () => {
    expect(searchRestaurants({
      price: 'any',
      cuisine: 'any food',
      suburb: 'anywhere'
    })).to.have.length(testData.restaurants.length);

    expect(searchRestaurants({
      price: 'anything',
      cuisine: 'whatever',
      suburb: 'Sydney'
    })).to.have.length(testData.restaurants.length);
  });
});
