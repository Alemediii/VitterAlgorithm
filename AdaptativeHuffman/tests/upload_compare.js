const fs = require('fs');
const http = require('http');
const path = require('path');

const samplePath = path.join(__dirname, 'upload-sample.txt');
const sample = fs.readFileSync(samplePath);
console.log('sample len', sample.length, 'hexPrefix', sample.slice(0,16).toString('hex'));

// local encode
const VitterEncoder = require('../models/VitterEncoder');
const localOut = new VitterEncoder().encodeToBuffer(sample);
fs.writeFileSync(path.join(__dirname, 'local.vitt'), localOut);
console.log('local.vitt len', localOut.length, 'hexPrefix', localOut.slice(0,32).toString('hex'));

// multipart POST to server
const boundary = '----WebKitFormBoundaryCompare123';
const header = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="upload-sample.txt"\r\nContent-Type: application/octet-stream\r\n\r\n`);
const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
const body = Buffer.concat([header, sample, footer]);

const opts = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/compress/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': body.length
  }
};

const req = http.request(opts, (res) => {
  const chunks = [];
  res.on('data', (c) => chunks.push(c));
  res.on('end', () => {
    const serverBuf = Buffer.concat(chunks);
    fs.writeFileSync(path.join(__dirname, 'server.vitt'), serverBuf);
    console.log('server.vitt status', res.statusCode, 'len', serverBuf.length, 'hexPrefix', serverBuf.slice(0,32).toString('hex'));
    console.log('equal?', serverBuf.equals(localOut));
    if (!serverBuf.equals(localOut)) {
      console.log('server.vitt hex:', serverBuf.toString('hex'));
      console.log('local.vitt  hex:', localOut.toString('hex'));
    }
  });
});
req.on('error', (e) => console.error(e));
req.write(body);
req.end();

