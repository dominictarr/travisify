#!/usr/bin/env node
var withConfig = require('../lib/config');
var exec = require('child_process').exec;
var request = require('request');

function remote (cb) {
    exec('git remote -v', function (err, stdout, stderr) {
        if (err) return cb(err.stack)
        if (stderr) return cb(stderr)
        
        var m = stdout.match(/git@github.com:(\S+)\.git/);
        if (!m) return cb('no github remote found');
        cb(null, m[1]);
    });
}

withConfig(function (config) {
    remote(function (err, repo) {
        if (err) return console.error(err);
        
        var uri = 'https://'
            + [ config.user, config.pass ].map(encodeURIComponent).join(':')
            + '@api.github.com/repos/' + repo + '/hooks'
        ;
        var opts = { uri : uri, json : true };
        
        request.get(opts, function (err, res, body) {
            if (err) return console.error(err);
            if (res.statusCode !== 200) return console.error(body);
            if (!Array.isArray(body)) {
                console.error('non-array response: ');
                console.error(body);
                return;
            }
            
            var hasTravis = body.some(function (rec) {
                return rec && rec.name === 'travis'
            });
            if (hasTravis) {
                return console.log('this repo already has a travis hook');
            }
            
        });
    });
});
