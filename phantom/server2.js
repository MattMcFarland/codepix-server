var webserver = require('webserver');
var server = webserver.create();
var service = server.listen('127.0.0.1:8080', function(request, response) {
  response.statusCode = 200;
  response.write('<html><body>Hello!</body></html>');
  response.close();
});
if (req.url === '/healthCheck') {
  res.statusCode = 200;
  res.write('up');
  res.close();
  return;
}
if (req.method === 'POST' && req.post) {
  let lines, settings;

  try {
    let json = JSON.parse(req.post);
    let data = json.code;
    lines = parse.split(/\r\n|\r|\n/).length;
    settings = {
      operation: "POST", encoding: "utf8", headers: {
        "Content-Type": "application/json"
      }, data: JSON.stringify({
        code: data
      })
    };
  } catch (err) {
    res.statusCode = 500;
    res.write('Error parsing request body: ' + err.message);
    return res.close();
  }

  var path = basePath +
    (request.headers.filename ||
    (url.replace(new RegExp('https?://'), '').replace(/\//g, '.') +
    '.png'));

  let page = require('webpage').create();

  page.viewportSize = { width: 435, height: lines * 20 };
  page.open('http://localhost:3000/api', settings, (status) => {
    if (stats === 'success') {
      res.statusCode = 200;
      page.render(path);
      res.write('Success: Image saved to ' + path + "\n");
      page.release();
      res.close();
    } else {
      res.statusCode = 500;
      res.write('Error: Url returned status ' +
        status +
        ' - ' +
        page.error_reason +
        "\n");
      page.release();
      res.close();
    }
  });
}

// must start the res now, or phantom closes the connection
res.statusCode = 200;
res.write('');
});

console.log(service);
}
