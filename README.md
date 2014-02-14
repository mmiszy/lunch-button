lunch-button
============

Find a place for lunch

How to run
------------

copy [app/scripts/constants.js.dist](app/scripts/constants.js.dist) to app/scripts/constants.js and fill CLIENT_ID and CLIENT_SECRET.
`grunt server` and open [http://localhost:9000](http://localhost:9000)

How to test
-----------

Run:

In separate terminal instances run one command:

```bash
grunt server
grunt selenium
grunt e2e
```

Bulding for mobile
------------------
Requirements
- SDK for your desired platform
- npm install -g phonegap cordova

iOS specific:
- npm install -g ios-sim ios-deploy

```bash
grunt phonegap:build
cp cordova-config.xml www/config.xml
grunt cordova build ios
cordova emulate ios
```