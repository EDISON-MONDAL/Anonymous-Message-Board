const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  // Define the board name and thread ID (replace with actual values)
  const board = 'test-board';
  let threadId = '';

  
    test('Creating a new thread: POST request to /api/threads/{board}', function(done) {
        this.timeout(4000)
      chai
        .request(server)
        .post('/api/threads/' + board)
        .send({ text: 'New thread', delete_password: 'password' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    }); 

    test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function(done) {
        this.timeout(4000)
      chai
        .request(server)
        .get('/api/threads/' + board)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          
          assert.property(res.body[0], '_id')
          assert.property(res.body[0], 'text')
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'bumped_on')
          assert.property(res.body[0], 'replies')
          assert.property(res.body[0], 'replycount')

          assert.equal( res.body[0].text, 'New thread')
          
          threadId = res.body[0]._id; // Store the thread ID for future tests
          done();
        });
    });    

    test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', function(done) {
        this.timeout(4000)
      chai
        .request(server)
        .delete('/api/threads/' + board)
        .send({ thread_id: threadId, delete_password: 'incorrect' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password')
          done();
        });
    });
/*
    test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', function(done) {
        this.timeout(4000)
      chai
        .request(server)
        .delete('/api/threads/' + board)
        .send({ thread_id: threadId, delete_password: 'password' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success')
          done();
        });
    });

  
    test('Reporting a thread: PUT request to /api/threads/{board}', function(done) {
        this.timeout(4000)
      chai
        .request(server)
        .put('/api/threads/' + board)
        .send({ thread_id: threadId })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported')
          done();
        });
    });
    
    test('Creating a new reply: POST request to /api/replies/{board}', function(done) {
        this.timeout(4000)
        chai
          .request(server)
          .post('/api/replies/' + board)
          .send({ thread_id: threadId, text: 'first reply', delete_password: 'delete first reply' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            done();
          });
    });

    test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function(done) {
        this.timeout(4000)
        chai
          .request(server)
          .get(`/api/replies/${board}?thread_id=${threadId}`)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            console.log('is array -------------- '+ res.body)
            done();
          });
    });
    */

});
