#!/usr/bin/env node
var withConfig = require('../lib/config');

withConfig(function (config) {
    console.log('beep boop');
    console.dir(config);
});
