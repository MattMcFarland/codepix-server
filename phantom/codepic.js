
var page = require('webpage').create();
var parse = require('fs').read('./codeToSend.txt');

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};

var lines = parse.split(/\r\n|\r|\n/).length;

var settings = {
  operation: "POST",
  encoding: "utf8",
  headers: {
    "Content-Type": "application/json"
  },
  data: JSON.stringify({
    code: parse
  })
};
page.viewportSize = { width: 435, height: lines*20 };

page.open('http://localhost:3000/api', settings, function(status) {
  console.log('Status: ' + status);
  page.render('example.png');
  phantom.exit();
});



