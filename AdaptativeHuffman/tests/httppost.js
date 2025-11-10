const fs = require('fs');
const http = require('http');
const file = fs.readFileSync('tests/uploaded.vitt');
const boundary = '----WebKitFormBoundaryTest456';
const header = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="uploaded.vitt"\r\nContent-Type: application/octet-stream\r\n\r\n`);
const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
const body = Buffer.concat([header, file, footer]);
const opts = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/decompress/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': body.length
  }
};

const req = http.request(opts, (res) => {
  const ch = [];
  res.on('data', (c) => ch.push(c));
  res.on('end', () => {
    const buf = Buffer.concat(ch);
    console.log('status', res.statusCode, 'len', buf.length);
    console.log('hex', buf.toString('hex'));
    fs.writeFileSync('tests/roundtrip2.txt', buf);
  });
});
req.on('error', (e) => console.error(e));
req.write(body);
req.end();

