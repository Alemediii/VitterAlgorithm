const app = require('../app');
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3001; // use different port to avoid conflicts
const server = app.listen(port, '127.0.0.1', () => {
  console.log('Test server started on port', port);
  runTest();
});

function multipartRequest(options, filePath, callback) {
  const file = fs.readFileSync(filePath);
  const boundary = '----WebKitFormBoundaryTest123';
  const header = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${path.basename(filePath)}"\r\nContent-Type: application/octet-stream\r\n\r\n`);
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([header, file, footer]);
  const opts = Object.assign({}, options, {
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': body.length
    }
  });

  const req = http.request(opts, (res) => {
    const chunks = [];
    res.on('data', c => chunks.push(c));
    res.on('end', () => {
      const buf = Buffer.concat(chunks);
      callback(null, res, buf);
    });
  });
  req.on('error', (e) => callback(e));
  req.write(body);
  req.end();
}

function runTest() {
  const sample = path.join(__dirname, 'upload-sample.txt');
  const outCompressed = path.join(__dirname, 'server_uploaded.vitt');
  const outDecompressed = path.join(__dirname, 'server_roundtrip.txt');

  console.log('Uploading sample to /compress/upload...');
  multipartRequest({ hostname: '127.0.0.1', port, path: '/compress/upload', method: 'POST' }, sample, (err, res, buf) => {
    if (err) return console.error('Upload error', err);
    console.log('Compress status', res.statusCode, 'received', buf.length, 'bytes');
    fs.writeFileSync(outCompressed, buf);
    console.log('Saved', outCompressed);

    // Now POST the compressed file to decompress endpoint
    console.log('Uploading compressed file to /decompress/upload...');
    multipartRequest({ hostname: '127.0.0.1', port, path: '/decompress/upload', method: 'POST' }, outCompressed, (err2, res2, buf2) => {
      if (err2) return console.error('Decompress upload error', err2);
      console.log('Decompress status', res2.statusCode, 'received', buf2.length, 'bytes');
      fs.writeFileSync(outDecompressed, buf2);
      console.log('Saved', outDecompressed);

      const original = fs.readFileSync(sample);
      const round = fs.readFileSync(outDecompressed);
      console.log('Original hex:', original.toString('hex'));
      console.log('Roundtrip hex:', round.toString('hex'));
      console.log('equal?', original.equals(round));

      server.close(() => console.log('Test server stopped'));
    });
  });
}

