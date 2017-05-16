'use strict';

var sizzle = require('./sizzle');
var ajax = require('./ajax');
var form = require('./form');
var pubsub = require('./pubsub');
var keys = require('./keys');
var util = require('./util');

var all = { ajax: ajax, form: form };
Object.assign(all, ajax, pubsub, keys, util);
for (var prop in all) {
  sizzle[prop] = all[prop];
}module.exports = sizzle;