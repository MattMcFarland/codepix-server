var Chance = require('chance');
var webserver = require('webserver');
var server = webserver.create();
var system = require('system');
var args = system.args;
var basePath = args[0] || '/tmp/';
var address = args[1] || '127.0.0.1:3002';
var pageSettings = [
  'javascriptEnabled',
  'loadImages',
  'localToRemoteUrlAccessEnabled',
  'userAgent',
  'userName',
  'password'
];



var chance = new Chance();

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file
        || t.sourceURL) + ': ' + t.line +
        (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }

  console.error(msgStack.join('\n'));
  phantom.exit(1);
}


var service = server.listen(address, function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === "GET") {
    if (req.url === '/healthCheck') {
      res.statusCode = 200;
      res.write('up');
      res.close();
      return;
    }
    res.statusCode = 404;
    res.write('{ "message": "Not Found" }');
    res.close();
    return;
  } else if (req.method === "POST") {

    switch(req.url) {

      case "/test-json":
        res.statusCode = 200;
        res.write(req.post);
        res.close();
        break;


      case "/test-code":
        res.statusCode = 200;
        res.write('{ "parsed_code": "' + JSON.parse(req.post).code + '"}');
        res.close();
        break;


      case "/test-filename":
        res.statusCode = 200;
        res.write('{ "filename": "' +
          basePath + '/' +
          chance.hash({length: 15}) + '.png' + '"}');
        res.close();
        break;


      case "/test-settings":
        var _settings = {
          operation: "POST", encoding: "utf8", headers: {
            "Content-Type": "application/json"
          }, code: JSON.parse(req.post).code
        };
        res.statusCode = 200;
        res.write('{ "settings":' + JSON.stringify(_settings) + '}');
        res.close();


      case "/test-size":
        var _lines = (JSON.parse(req.post).code).split(/\r\n|\r|\n/).length;
        var _size = { width: 435, height: _lines * 20 };
        res.statusCode = 200;
        res.write('{ "size":' + JSON.stringify(_size) + '}');
        res.close();
        break;


      case "/test-combined":

        var __settings = {
          operation: "POST", encoding: "utf8", headers: {
            "Content-Type": "application/json"
          }, code: JSON.parse(req.post).code
        };

        var __lines = (JSON.parse(req.post).code).split(/\r\n|\r|\n/).length;
        var __size = { width: 435, height: __lines * 20 };
        var __path = basePath + '/' +
          chance.hash({length: 15}) + '.png';
        res.statusCode = 200;
        res.write(
          '{ ' +
          '"__settings":' + JSON.stringify(__settings) + ',' +
          '"__size":' + JSON.stringify(__size) + ',' +
          '"__lines":' + __lines +  ',' +
          '"__path": "' + __path + '"' +
          '}'
        );
        res.close();
        break;


      case "/image":

        // { code: JSON.parse(req.post).code }

        var json = JSON.parse(req.post);
        var data = json.code;
        settings = {
          operation: "POST",
          encoding: "utf8",
          headers: {
            "Content-Type": "application/json"
          },
          data: JSON.stringify({
            code: data
          })
        };

        var lines = (JSON.parse(req.post).code).split(/\r\n|\r|\n/).length;
        var size = { width: 435, height: lines * 20 };
        var path = basePath + '/' +
          chance.hash({length: 15}) + '.png';


        var page = require('webpage').create();

        page.onResourceRequested = function (request) {
          console.log('Request ' + JSON.stringify(request, null, 2));
        };

        page.viewportSize = { width: 435, height: lines * 20 };


        page.open('http://localhost:3000/api', settings, function(status) {

          res.statusCode = 200;
          if (status === 'success') {
            page.render('example.png');
            res.write('success');
            page.release();
          } else {
            res.write('fail');
          }
          res.close();
            /*
            res.statusCode = 200;
            page.render(path);
            res.write('done');
            page.release();
            res.close();
            return;
          } else {
            res.statusCode = 500;
            res.write('{ ' +
              '"error": "Internal Server Error", ' +
              '"message": "' + page.error_reason + '",' +
              '}');
            page.release();
            res.close();
            break;
          }
          */
        });
        break;

      default:
        res.statusCode = 400;
        res.write('{ ' +
          '"error": "Bad Request", ' +
          '"url": "' + req.url + '", ' +
          '"POST JSON.code to these routes": [ ' +
            '"/image",' +
            '"/test-json",' +
            '"/test-code",' +
            '"/test-filename",' +
            '"/test-combined",' +
            '"/test-settings" ' +
          ']' +
          '}');
        res.close();
        break;


    }
    return;
  }
});

