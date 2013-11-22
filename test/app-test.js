// Use the Node test environment
process.env.NODE_ENV = 'test';

// requirements
var http = require('http');
var should = require('should');
var request = require('supertest');

// get the express app
var app = require('../app');

 describe('GET /', function(){
  it('responds with error', function(done){
    request(app)
      .get('/')
      .expect(404, done);
  })
})


 describe('POST /sms', function(){
  it('requires a secret', function(done){
    request(app)
      .post('/sms?secret=notsosecret')
      .expect(403, done);
  })
})
