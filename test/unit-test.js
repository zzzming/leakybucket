'use strict';

const expect = require('chai').expect;
const Bucket = require('../src/LeakyBucket.js'); // module to be tested

describe ('leaky bucket', () => {
  describe ('leaky bucket test cases', ()=> {
    let bucket = new Bucket(3);
    let nr = 0;
    let decr = function(num) {nr-=num; return Promise.resolve();}
    let incr = function(num) {nr+=num; return Promise.resolve();}
    it ('add two to bucket', (done)=> {
      expect(3).to.equal(bucket.ceiling);
      expect(0).to.equal(bucket.level);
      bucket.add(1, () => {return incr(2)});
      bucket.add(1, () => {return incr(4)});
      setTimeout(()=>{
        expect(6).to.equal(nr);
        expect(2).to.equal(bucket.level);
        done();}, 20);
    });
    it ('add two more', (done)=> {
      bucket.add(2, () => {return incr(4)}); //not added due to over level budget of 2
      bucket.add(1, () => {return incr(3)}); //this one will be added
      bucket.add(1, () => {return incr(7)}); //not added due to reach ceiling
      setTimeout(()=>{
        expect(9).to.equal(nr);
        expect(3).to.equal(bucket.level);
        done();}, 20);
    });
    it ('remove two from bucket', (done)=> {
      bucket.leak(2, () => {return decr(1);});
      //all add events are queued in order from the last test case
      setTimeout(()=>{
        expect(12).to.equal(nr);
        expect(3).to.equal(bucket.level);
        done();}, 20);
    });
    it ('Clear previous add backlog and add another add', (done)=> {
      bucket.add(3, () => {return incr(100);});
      bucket.leak(3, () => {return decr(1);});
      setTimeout(()=>{
        expect(18).to.equal(nr);
        expect(1).to.equal(bucket.level);
        done();}, 20);
    });
    it ('Clear all add and test multiple leak backup', (done)=> {
      bucket.leak(3, () => {return decr(50);});//then leak this due to the previous add back up
      bucket.leak(1, () => {return decr(1);}); //first leak this
      setTimeout(()=>{
        expect(67).to.equal(nr);
        expect(0).to.equal(bucket.level);
        done();}, 20);
    });
    it ('add with callback adjusted level by promise reject', (done)=> {
      bucket.add(3, () => {return Promise.reject(2);});
      setTimeout(()=>{
        expect(67).to.equal(nr);
        expect(1).to.equal(bucket.level);
        done();}, 20);
    });
    it ('leak with callback adjusted level by promise reject', (done)=> {
      bucket.add(2, () => {return Promise.resolve(2);}); //resolve return a number does no magic
      bucket.leak(3, () => {return Promise.reject(1);});
      setTimeout(()=>{
        expect(67).to.equal(nr);
        expect(1).to.equal(bucket.level);
        done();}, 20);
    });
    it ('add with callback adjusted level over ceiling by promise reject', (done)=> {
      bucket.add(1, () => {return Promise.reject(4);});
      setTimeout(()=>{
        expect(67).to.equal(nr);
        expect(1).to.equal(bucket.level);
        done();}, 20);
    });
    it ('add with callback adjusted level over ceiling by promise reject', (done)=> {
      bucket.leak(1, () => {return Promise.reject(4);});
      setTimeout(()=>{
        expect(67).to.equal(nr);
        expect(1).to.equal(bucket.level);
        done();}, 20);
    });
    it ('add volumn range error', (done)=> {
      bucket.add(4, (err) => {
        expect (err).to.be.an.instanceof ( RangeError );
        done();
      });
    });
    it ('leak volumn range error', (done)=> {
      bucket.leak(23, (err) => {
        expect (err).to.be.an.instanceof ( RangeError );
        done();
      });
    });
  });
});
