const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');

describe('Visualization API', () => {
  describe('GET /api/visualization/tree', () => {
    it('returns 400 when source is missing', async () => {
      const res = await request(app).get('/api/visualization/tree');
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });

    it('returns a tree structure for a provided source', async () => {
      const res = await request(app).get('/api/visualization/tree').query({ source: 'ABAB' });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('tree');
      expect(res.body.data).to.have.property('meta');
      expect(res.body.data.meta).to.have.property('entropy');
    });
  });

  describe('POST /api/visualization/encode-roundtrip', () => {
    it('returns 400 when body.source missing', async () => {
      const res = await request(app).post('/api/visualization/encode-roundtrip').send({});
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('success', false);
    });

    it('encodes and decodes a string correctly', async () => {
      const src = 'Hello, World!';
      const res = await request(app).post('/api/visualization/encode-roundtrip').send({ source: src });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('original', src);
      expect(res.body.data).to.have.property('decoded', src);
    });
  });
});

