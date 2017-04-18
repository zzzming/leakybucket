# Leaky Bucket
LeakyBucket is a node.js traffic shaping library that throttles or limits the input rate as well as the out-going rate of a processing queue. The queue size is used to prevent no input overflow.

The term of [leaky bucket](https://en.wikipedia.org/wiki/Leaky_bucket) is borrowed from a network algorithm to determine average and peak rates of a network. This node.js library offers much simplier implementation that enforces the ceiling of a queue size thus to throttle in-coming and out-going job rates.

## Installation

```
$ npm install leakybucket
```


## How to use ##

 1. Import and define the ceiling of the queue size
```javascript
const Bucket = require('LeakyBucket');
// set the ceiling of the queue to 500 jobs
bucket = new Bucket(500);
```

 2. The function to be rate limited is passed in as a callback. The claimed volumn is the first argument. The function is required to return a Promise resolve in success case, either a Promise reject to report the number of claimed volumn has not actually passed, so that the actual bucket level will be adjusted accordingly.
```javascript
//the volumn level goes up to 2 and successfully processed by the function.
bucket.add(2, () => {return Promise.resolve();});
//the volumn level goes down to 1 because claimed 2 however the actual process rejects 1. The level only goes down 1 level.
bucket.leak(2, () => {return Promise.reject(1);});
```
Error checking is required to ensure validity of any add or leak volumn. The example showcases an RangeError is returned when a number is added that over the ceiling limit.
```javascript
bucket.add(501, (err) => {
  if (err && err instanceof RangeError) {
    ...
  }
  ...
});
```

 3. It can be used with other time based rate limit API.
```javascript
const RateLimiter = require('limiter').RateLimiter;
const limiter = new RateLimiter(5, 'second');
limiter.removeTokens(1, () => {
  bucket.add(100, ()=> {
    // business logic function
    return Promise.resolve();
  });
});
```

## Design ##

### Lint, unit test, and code coverage ###
```
$ npm run lint
$ npm run test
$ npm run coverage
```
