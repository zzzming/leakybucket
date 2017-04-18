'use strict';

function LeakyBucket(ceiling) {
  this.ceiling = ceiling;
}

const EventEmitter = require('events').EventEmitter;
const events = new EventEmitter();

LeakyBucket.prototype = {
  ceiling: 1,
  level: 0, //confirmed actual level
  claimed: 0, //claimed level not the actual before promise.reject

  /**
   * Leaks at the specified volumn.
   * @param v the volumn of leak
   * @callback
   */
  leak: function (v, callback) {
    if (v > this.ceiling) {
      const err = new RangeError('Volumn is more than ceiling value', this.ceiling);
      callback(err);
      return;
    }
    let self = this;

    if (this.level < v || this.claimed < v) {
      events.once('add', () => self.leak(v, callback));
    } else {
      this.claimed -= v;
      callback(null).then(() => {
        this.level -= v;
        events.emit('leak');
      })
      .catch((i) => { //the number of rejects should not exceed initial claimed leak volumn
        let actual = v;
        if (i>=0) {
          let iv = Math.min(i,v);
          actual = v - iv;
          this.claimed + iv > this.ceiling ? this.claimed = this.ceiling : this.claimed += iv;
        }
        this.level -= actual;
      });
    }
  },

  /**
   * Add the specified volumn.
   * @param v the volumn of add
   * @callback
   */
  add: function (v, callback) {
    if (v > this.ceiling) {
      const err = new RangeError('Volumn is more than ceiling value', this.ceiling);
      callback(err);
      return;
    }
    let self = this;
    if (this.level + v > this.ceiling || this.claimed + v > this.ceiling) {
      events.once('leak', () => self.add(v, callback));
    } else {
      this.claimed += v;
      callback(null).then(() => {
        this.level += v;
        events.emit('add');
      })
      .catch((i) => { //the number of rejects should not exceed initial claimed add volumn
        let actual = v;
        if (i>=0) {
          let iv = Math.min(i,v);
          actual = v - iv;
          this.claimed - iv < 0 ? this.claimed = 0 : this.claimed -= iv;
        }
        this.level += actual;
      });
    }
  }
};

module.exports = LeakyBucket;
