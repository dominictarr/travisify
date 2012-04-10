travisify
=========

Add [travis-ci](http://travis-ci.org) hooks to your github project.

install
=======

```
npm install -g travisify
```

usage
=====

Navigate to a git project that you've set up remotes for on github, then run
`travisify`. The first time you run `travisify` it will prompt you for your
account information.

```
$ cd ~/projects/upnode
$ travisify
github username: substack
github password:
travis-ci api key: abcdefghijklmnopqrst
travis hook added for substack/upnode with id 213466
```

Now every time you push to github your tests will be run on travis-ci.

Make sure to `git add` a `.travis.yml` file like this before you push:

``` yaml
language: node_js
node_js:
  - 0.4
  - 0.6
```

If you want to trigger the tests manually you can use the `travisify test`
command:

```
$ cd ~/projects/upnode
$ travisify test
test hook sent for substack/upnode/213466
```

commands
========

travisify
---------

Add a github hook for travis if one hasn't already been added.

travisify test
--------------

Trigger a test request for the travis hook.

travisify badge
---------------

Generate a markdown travis badge to put in your readme.

license
=======

MIT
