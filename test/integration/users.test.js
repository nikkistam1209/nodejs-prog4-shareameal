

const dbconnection = require('../../src/util/mysql-db');

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const logger = require('../../src/util/utils').logger
const assert = require('assert')
chai.should()
chai.use(chaiHttp)

// test

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_USER =
'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
'(1, "Nikki", "Stam", "nikki@server.nl", "password123!", "straat", "stad"),' + 
'(2, "Naam", "Achternaam", "naam@server.nl", "secret1!", "straat", "stad");'



describe('UC-201', function() {

      beforeEach((done) => {
            logger.trace('beforeEach called');

            dbconnection.getConnection(function (err, connection) {
              if (err) {
                done(err);
                throw err; // no connection
              }
              // Use the connection
              connection.query(
                CLEAR_DB + INSERT_USER,
                function (error, results, fields) {
                  if (error) {
                    done(error);
                    throw error; // not connected!
                  }
                  logger.trace('beforeEach done');
                  // When done with the connection, release it.
                  dbconnection.releaseConnection(connection);
                  done();
                }
              );
            });
      });


      it('TC-201-1 - Required field missing', (done) => {

            const testUser = {
                  firstName: '', 
                  lastName: 'Jansen', 
                  emailAdress: 'kees@avans.nl',
                  password: 'testpassword1!',
                  phoneNumber: '0612345678',
                  roles: '',
                  street: 'teststreet', 
                  city: 'testcity'
            }
            chai.request(server)
            .post('/api/user')
            .send(testUser)
            .end((err,res)=>{
                  assert(err === null);
      
                  res.body.should.be.an('object')
                  let {status, message} = res.body;
      
                  status.should.equal(400)
                  message.should.equal('firstName must be a string')

                  done()
            })
      });

      it('TC-201-2 - Invalid email', (done) => {

            const testUser = {
                firstName: 'Kees', 
                lastName: 'Jansen', 
                emailAdress: 'notavalidemail',
                password: 'testpassword1!',
                phoneNumber: '0612345678',
                roles: '',
                street: 'teststreet', 
                city: 'testcity'
            }
            chai.request(server)
            .post('/api/user')
            .send(testUser)
            .end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object')
                  let {status, message} = res.body;

                  status.should.equal(400)
                  message.should.equal('emailAdress is not valid')

                  done()
            })
      });

      it('TC-201-3 - Invalid password', (done) => {

            const testUser = {
                firstName: 'Kees', 
                lastName: 'Jansen', 
                emailAdress: 'kees@avans.nl',
                password: 'notavalidpassword',
                phoneNumber: '0612345678',
                roles: '',
                street: 'teststreet', 
                city: 'testcity'
            }
            chai.request(server)
            .post('/api/user')
            .send(testUser)
            .end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object')
                  let {status, message} = res.body;

                  status.should.equal(400)
                  message.should.equal('password must contain at least one number')

                  done()
            })
      });

      it('TC-201-4 - Email already in use', (done) => {

            const testUser = {
                firstName: 'Kees', 
                lastName: 'Jansen', 
                emailAdress: 'nikki@server.nl',
                password: 'testpassword1!',
                phoneNumber: '0612345678',
                roles: '',
                street: 'teststreet', 
                city: 'testcity'
            }
            chai.request(server)
            .post('/api/user')
            .send(testUser)
            .end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object')
                  let {status, message} = res.body;

                  status.should.equal(403)
                  message.should.equal('emailAdress already exists in the database')

                  done()
            })
      });

      // zorgen dat kees er niet in staat 
	it('TC-201-5 - User registered successfully', (done) => {

            const testUser = {
                  firstName: 'Kees', 
                  lastName: 'Jansen', 
                  emailAdress: 'kees@avans.nl',
                  password: 'testpassword1!',
                  phoneNumber: '0612345678',
                  roles: '',
                  street: 'teststreet', 
                  city: 'testcity'
            }
		chai.request(server)
		.post('/api/user')
            .send(testUser)
		.end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object')
                  let {status, message, data} = res.body;

                  status.should.equal(201)
                  message.should.equal('Successfully registered user')
                  data.should.be.an('object')
                  //data.id.should.equal(6); index problemen zorgen ervoor dat het id niet altijd 6 zal zijn
                  data.firstName.should.equal('Kees');
                  data.lastName.should.equal('Jansen');
                  data.emailAdress.should.equal('kees@avans.nl');
                  data.password.should.equal('testpassword1!');
                  data.phoneNumber.should.equal('0612345678');
                  data.street.should.equal('teststreet');
                  data.city.should.equal('testcity');

                  done()
		})
	});
})







describe('UC-202', function() {

      beforeEach((done) => {
            logger.trace('beforeEach called');

            dbconnection.getConnection(function (err, connection) {
              if (err) {
                done(err);
                throw err; // no connection
              }
              // Use the connection
              connection.query(
                CLEAR_DB + INSERT_USER,
                function (error, results, fields) {
                  if (error) {
                    done(error);
                    throw error; // not connected!
                  }
                  logger.trace('beforeEach done');
                  // When done with the connection, release it.
                  dbconnection.releaseConnection(connection);
                  done();
                }
              );
            });
      });

	it('TC-202-1 - Return all user data', (done) => {
		chai.request(server)
		.get('/api/user')
		.end((err,res)=>{
            assert(err === null);

                  res.body.should.be.an('object');
                  let {status, message, data} = res.body;

                  status.should.equal(200);
                  message.should.equal('User data endpoint');
                  data.should.be.an('array');
                  data.length.should.be.above(1);

                  data.forEach(user => {
                  user.should.have.property('id');
                  user.should.have.property('firstName');
                  user.should.have.property('lastName');
                  user.should.have.property('emailAdress');
                  user.should.have.property('password');
                  });

                  done();
		})
	});
})

// not implemented
describe('UC-203', function() {
	// it.skip('TC-203-2 - User succesfully logged in', (done) => {
	// 	chai.request(server)
	// 	.get('/api/user/profile')
	// 	.end((err,res)=>{
      //       //
      //       done()
	// 	})
	// });
})

describe('UC-204', function() {

      beforeEach((done) => {
            logger.trace('beforeEach called');

            dbconnection.getConnection(function (err, connection) {
              if (err) {
                done(err);
                throw err; // no connection
              }
              // Use the connection
              connection.query(
                CLEAR_DB + INSERT_USER,
                function (error, results, fields) {
                  if (error) {
                    done(error);
                    throw error; // not connected!
                  }
                  logger.trace('beforeEach done');
                  // When done with the connection, release it.
                  dbconnection.releaseConnection(connection);
                  done();
                }
              );
            });
      });

      // it.skip('TC-204-1 - Invalid token', (done) => {
	// 	chai.request(server)
	// 	.get('/api/user/invalid')
	// 	.end((err,res)=>{
      //       assert(err === null);

      //             res.body.should.be.an('object')
      //             let {status, message} = res.body;

      //             status.should.equal(401)
      //             message.should.equal('Invalid token')

      //             done()
	// 	})
	// });

      it('TC-204-2 - User ID does not exist', (done) => {
		chai.request(server)
		.get('/api/user/3')
		.end((err,res)=>{
            assert(err === null);

                  res.body.should.be.an('object')
                  let {status, message} = res.body;

                  status.should.equal(404)
                  message.should.equal('Unable to find user')

                  done()
		})
	});
	it('TC-204-3 - User ID exists', (done) => {
		chai.request(server)
		.get('/api/user/1')
		.end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object')
                  let {status, message, data} = res.body;

                  status.should.equal(200)
                  message.should.equal('User data')
                  data.should.be.an('object')
                  data.id.should.equal(1);
                  data.firstName.should.equal('Nikki');
                  data.lastName.should.equal('Stam');
                  data.emailAdress.should.equal('nikki@server.nl')
                  data.password.should.equal('password123!')

                  done()
		})
	});
})

describe('UC-205', function() {

      beforeEach((done) => {
            logger.trace('beforeEach called');

            dbconnection.getConnection(function (err, connection) {
              if (err) {
                done(err);
                throw err; // no connection
              }
              // Use the connection
              connection.query(
                CLEAR_DB + INSERT_USER,
                function (error, results, fields) {
                  if (error) {
                    done(error);
                    throw error; // not connected!
                  }
                  logger.trace('beforeEach done');
                  // When done with the connection, release it.
                  dbconnection.releaseConnection(connection);
                  done();
                }
              );
            });
      });

      // tc 205-1

      it('TC-205-4 - User not found', (done) => {
            const id = 3
            const testUser = {
                  firstName: 'Klaas', 
                  lastName: 'Jansen', 
                  emailAdress: 'klaas@avans.nl',
            }
		chai.request(server)
		.put(`/api/user/${id}`)
            .send(testUser)
		.end((err,res)=>{
            assert(err === null);

            res.body.should.be.an('object');
            let {status, message} = res.body;

            status.should.equal(404);
            message.should.equal(`User with ID ${id} not found`);

            done();
		})
	});


      // zorgen dat het id van een user is die geupdate kan worden
	it('TC-205-6 - User successfully updated', (done) => {
            const id = 2
            const testUser = {
                  firstName: 'Klaas', 
                  lastName: 'Jansen', 
                  emailAdress: 'klaas@avans.nl',
            }
		chai.request(server)
		.put(`/api/user/${id}`)
            .send(testUser)
		.end((err,res)=>{
            assert(err === null);

            res.body.should.be.an('object');
            let {status, message} = res.body;

            status.should.equal(200);
            message.should.equal(`Successfully updated user with ID ${id}`);

            done();
		})
	});
})

describe('UC-206', function() {

      beforeEach((done) => {
            logger.trace('beforeEach called');

            dbconnection.getConnection(function (err, connection) {
              if (err) {
                done(err);
                throw err; // no connection
              }
              // Use the connection
              connection.query(
                CLEAR_DB + INSERT_USER,
                function (error, results, fields) {
                  if (error) {
                    done(error);
                    throw error; // not connected!
                  }
                  logger.trace('beforeEach done');
                  // When done with the connection, release it.
                  dbconnection.releaseConnection(connection);
                  done();
                }
              );
            });
      });

      it('TC-206-1 - User not found', (done) => {
            const id = 3
		chai.request(server)
		.delete(`/api/user/${id}`)
		.end((err,res)=>{
            assert(err === null);

            res.body.should.be.an('object');
            let {status, message} = res.body;

            status.should.equal(404);
            message.should.equal(`Unable to find user with ID ${id}`);

            done();
		})
	});


      // zorgen dat het id van een user is die verwijderd kan worden
	it('TC-206-4 - User successfully deleted', (done) => {
            const id = 2
		chai.request(server)
		.delete(`/api/user/${id}`)
		.end((err,res)=>{
            assert(err === null);

            res.body.should.be.an('object');
            let {status, message} = res.body;

            status.should.equal(200);
            message.should.equal(`Successfully deleted user with ID ${id}`);

            done();
		})
	});
})