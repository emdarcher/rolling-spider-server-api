# rolling-spider-server-api

[![NPM Version](http://img.shields.io/npm/v/rolling-spider-server-api.svg)](https://www.npmjs.com/package/rolling-spider-server-api)

Creates a server for controlling the Parrot Rolling Spider drone via an API.

The API's documentation in [RAML](raml.org) can be found in the [raml-doc](https://github.com/emdarcher/rolling-spider-server-api/tree/master/raml-doc) folder on GitHub.

### Installation:
To install with npm run `npm install -g rolling-spider-server-api` to install globally, then you can start the server by running `rs-server` in the command line.

To install from source from GitHub, go into the `drone-api` folder (if not already there), then run `npm install . -g` for global install, and start the server with `rs-server`. If you want to run the server within the `drone-api` folder only, then run `npm install`, and `node server.js` to run the server.

By default the server runs on port 7777 with a base path of `/drone-api`. These can be changed by setting the `PORT` and `DRONE_API_PREFIX` environment variables, respectively.

To set the server to connect to a drone with a peculiar Bluetooth UUID that can be set using the `DRONE_BT_UUID` environment variable.

By default, for safety, the server assumes you are using wheels with your drone, and therefore will not allow the right or left flip commands. To tell the server that you are not using wheels, set the `DRONE_WHEELS` environment variable to `false`.


