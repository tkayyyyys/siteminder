//process.env.NODE_ENV = 'test';
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
chai.use(chaiHttp);

describe('/POST mail: Input validation ', function() {
      
      it('Incorrect To email - missing @ ', function(done) {
        chai.request(server)
        	.post('/mail')
            .send({'to:':'tkobialkagmail', 'from': 'root@localhost.com', 'message': 'You should never see this!','subject': 'FAIL TEST'})
            .end((err, res) => {
                  res.should.have.status(422);
              	  done();
            });
      }); 

       it('Incorrect CC email - just a word', function(done) {
        chai.request(server)
        	.post('/mail')
            .send({'to:':'tkobialka@gmail.com', 'cc':'ttte', 'from': 'root@localhost.com', 'message': 'You should never see this!'})
            .end((err, res) => {
                  res.should.have.status(422);
              	  done();
            });
      });

       it('Incorrect BCC email - syntax error', function(done) {
        chai.request(server)
        	.post('/mail')
            .send({'to:':'tkobialka@gmail.com', 'bcc':'fred@@@ttte.com', 'from': 'root@localhost.com', 'message': 'You should never see this!'})
            .end((err, res) => {
                  res.should.have.status(422);
              	  done();
            });
      });

      it('Missing Subject:', function(done) {
        chai.request(server)
        	.post('/mail')
            .send({'to:':'tkobialka@gmail.com', 'from': 'root@localhost.com', 'message': 'You should never see this!'})
            .end((err, res) => {
                  res.should.have.status(422);
              	  done();
            });
      });

      it('Missing To: ', function(done) {
        chai.request(server)
        	.post('/mail')
            .send({'bcc:':'tkobialka@gmail.com', 'from': 'root@localhost.com', 'message': 'You should never see this!','subject': 'FAIL TEST'})
            .end((err, res) => {
                  res.should.have.status(422);
              	  done();
            });
      });

       it('Missing Message: ', function(done) {
        chai.request(server)
        	.post('/mail')
            .send({'to':'tkobialka@gmail.com', 'from': 'root@localhost.com','subject': 'FAIL TEST'})
            .end((err, res) => {
                  res.should.have.status(422);
              	  done();
            });
      }, 30000);

      /*
		 TODO:
		 	 Test outliner max / min input limits for subject, message
      */


  });
 

describe('/POST mail: Email validation ', function() {
	

	 it(' Accept Array of To', function(done) {
        chai.request(server)
        	.post('/mail')
            .send({'to':['tkobialka@gmail.com', 'glorious.rich@gmail.com'], 'from': 'root@localhost.com', 'message': 'You should see this!', 'subject': 'HELLO'})
            .end((err, res) => {
                  res.should.have.status(200);
              	  done();
            });
      });

	  it(' Accept Array of CC', function(done) {
        chai.request(server)
        	.post('/mail')
            .send({'to':['tomasz.kobialka@fintricity.com'], 'cc':['tkobialka@gmail.com', 'glorious.rich@gmail.com'], 'from': 'root@localhost.com', 'message': 'You see this!', 'subject': 'HELLO'})
            .end((err, res) => {
                  res.should.have.status(200);
              	  done();
            });
      });

       it(' Accept Array of BCC', function(done) {
        chai.request(server)
        	.post('/mail')
            .send({'to':['tomasz.kobialka@fintricity.com'], 'bcc':['tkobialka@gmail.com', 'glorious.rich@gmail.com'], 'from': 'root@localhost.com', 'message': 'You should see this!', 'subject': 'HELLO'})
            .end((err, res) => {
                  res.should.have.status(200);
              	  done();
            });
      });

       /*
       		 TODO:
       		 Stress test, high amount of emails all coming it at once
			 Test 1000 + emails in CC, BCC and TO
       */

 });
 
 