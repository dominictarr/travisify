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
    var doc = {
        name : 'travis',
        config : {
            token : config.token,
            domain : '',
            user : config.user,
        },
    };
    
    remote(function (err, repo) {
        if (err) console.error(err)
        else if (process.argv[2] === 'test') {
            testHook(config, repo);
        }
        else addHook(config, repo)
    });
});

function hookUri (config, repo) {
    return 'https://'
        + [ config.user, config.pass ].map(encodeURIComponent).join(':')
        + '@api.github.com/repos/' + repo + '/hooks'
    ;
}

function getHook (uri, cb) {
    request.get({ uri : uri, json : true }, function (err, res, body) {
        if (err) return cb(err);
        if (res.statusCode !== 200) return cb(body);
        if (!Array.isArray(body)) {
            return cb('non-array response: ' + JSON.stringify(body));
        }
        
        cb(null, body.filter(function (rec) {
            return rec && rec.name === 'travis'
        })[0]);
    });
}

function testHook (config, repo) {
    var uri = hookUri(config, repo);
    getHook(uri, function (err, hook) {
        if (err) return console.error(err);
        if (!hook) return console.error('no hook for this project');
        
        var opts = {
            uri : uri + '/' + hook.id + '/test',
            body : '',
        };
        request.post(opts, function (err, res, body) {
            if (err) console.error(err)
            else if (!res.statusCode.toString().match(/^2/)) {
                console.error('response code ' + res.statusCode);
                console.error(body);
            }
            else console.log('test hook sent for ' + repo + '/' + hook.id)
        });
    });
}

function addHook (config, repo) {
    var uri = hookUri(config, repo);
    getHook(uri, function (err, hook) {
        if (err) return console.error(err);
        if (hook) return console.log('this repo already has a travis hook');
        
        var opts = {
            uri : uri,
            body : JSON.stringify(doc),
        };
        request.post(opts, function (err, res, body) {
            if (err) console.error(err);
            else if (res.statusCode !== 200) console.log(body)
            else if (body.id) {
                console.log('travis hook added for ' + repo
                    + ' with id ' + body.id);
            }
            else console.log(body)
        });
    });
}
