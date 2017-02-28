const sizzle = require('./sizzle');
const ajax = require('./ajax');
const form = require('./form');
const pubsub = require('./pubsub');
const keys = require('./keys');
const util = require('./util');
const helper = require('./app-helper');

let all = { ajax, form };
Object.assign(all, ajax, pubsub, keys, util, helper);
for (let prop in all) sizzle[prop] = all[prop];

module.exports = sizzle;
