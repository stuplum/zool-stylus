# zool-stylus

A Hapi.js plugin for compiling and serving Sass stylesheets using [stylus](https://github.com/stylus/stylus).
This is a port of their express middleware to a hapi.js plugin. 

This plugin is a port of [zool-sass](https://github.com/stuplum/zool-sass).

### Overview

This plugin will create a single (configurable) route on the server that will respond to requests for css files. 

The plugin will map the request to a styl file in the configured `src` directory. The plugin will then try to just serve an existing, compiled `.css` file in the configured `dest` directory. If the file does not exist, or is older than the styl file, it will re-compile, write the file back to disk and respond with the contents back to the requester. 


### Example usage:

```shell
$ npm install zool-stylus --save
```

```javascript
var Hapi = require('hapi');
var ZoolStylus = require('zool-stylus')

var server = new Hapi.Server();
server.connection({ port: 1337 });

var options = {
    src: './example/styl',
    dest: './example/css',
    force: true,
    debug: true,
    routePath: '/css/{file}.css',
    paths: ['./example/vendor/styl'],
    comress: false,
    sourcemap: true
};

server.register({
        register: ZoolStylus,
        options: options
    }
    , function (err) {
        if (err) throw err;
        server.start(function () {
            server.log("Hapi server started @ " + server.info.uri);
        });
    }
);
```

### Options:

* `src`: Source directory used to find .styl files. Defaults to `./lib/styl`
* `dest`: Destination directory used to output .css files. Defaults to `./public/css`
* `debug`: Output debug logging. Defaults to `false`
* `entryPoint`: Defaults to `index`
* `extension`: Defaults to `styl`
* `force`: Always re-compile. Defaults to `false`
* `cache`: This determines if the stylus parser will cache internally. Defaults to `false`
* `compress`: Whether the output .css files should be compressed. Defaults to `true`
* `firebug`: Emits debug infos in the generated css that can be used by the FireStylus Firebug plugin. Defaults to `false`
* `linenos`: Emits comments in the generated css indicating the corresponding stylus line. Defaults to `false`
* `sourcemap`: Generates a sourcemap in sourcemaps v3 format. Defaults to `false`
* `paths`: This is ideal when exposing external Stylus libraries which expose a path. Defaults to `[]`