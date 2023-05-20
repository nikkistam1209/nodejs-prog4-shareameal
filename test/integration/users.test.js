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
'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `phoneNumber`, `street`, `city` ) VALUES' +
'(1, "Nikki", "Stam", "n.stam@server.nl", "Password123", "06-29414389", "Amazone", "Dordrecht"),' + 
'(2, "Naam", "Achternaam", "n.achternaam@server.nl", "Secret01", "0612345678", "Straat", "Stad");'

const INSERT_MEALS =
'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
"(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
"(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

describe('UC-101', function() {

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

      it('TC-101-1 - Required field  missing', (done) => {
            const testUser = {
                  password: 'Password123'
            }
            chai.request(server)
            .post('/api/login')
            .send(testUser)
            .end((err,res)=>{
                  assert(err === null);
      
                  res.body.should.be.an('object')
                  let {status, message, data} = res.body;
      
                  status.should.equal(400)
                  message.should.equal('emailAdress must be a string')
                  //data.length.should.equal(0)

                  done()
            })
      });

      it('TC-101-2 - Invalid password', (done) => {
            const testUser = {
                  emailAdress: 'n.stam@server.nl',
                  password: 'invalid'
            }
            chai.request(server)
            .post('/api/login')
            .send(testUser)
            .end((err,res)=>{
                  assert(err === null);
      
                  res.body.should.be.an('object')
                  let {status, message, data} = res.body;
      
                  status.should.equal(400)
                  message.should.equal('Not authorized')
                  //data.length.should.equal(0)

                  done()
            })
      });

      it('TC-101-3 - User does not exist', (done) => {
            const testUser = {
                  emailAdress: 'e.doesnot@exist.com',
                  password: 'Password123'
            }
            chai.request(server)
            .post('/api/login')
            .send(testUser)
            .end((err,res)=>{
                  assert(err === null);
      
                  res.body.should.be.an('object')
                  let {status, message, data} = res.body;
      
                  status.should.equal(404)
                  message.should.equal('User not found')
                  //data.should.equal(undefined)

                  done()
            })
      });

      it('TC-101-4 - User logged in successfully', (done) => {
            const testUser = {
                  emailAdress: 'n.stam@server.nl',
                  password: 'Password123'
            }
            chai.request(server)
            .post('/api/login')
            .send(testUser)
            .end((err,res)=>{
                  assert(err === null);
      
                  res.body.should.be.an('object')
                  let {status, message, data} = res.body;
      
                  status.should.equal(200)
                  message.should.equal('User logged in successfully')
                  data.should.be.an('object')
                  data.id.should.equal(1)
                  data.firstName.should.equal('Nikki');
                  data.lastName.should.equal('Stam');
                  data.emailAdress.should.equal('n.stam@server.nl');
                  //data.password.should.equal('Password123');
                  data.phoneNumber.should.equal('06-29414389');
                  data.street.should.equal('Amazone');
                  data.city.should.equal('Dordrecht');

                  data.should.have.property('token')

                  done()
            })
      });

})

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
                  emailAdress: 'k.jansen@avans.nl',
                  password: 'testPassword1!',
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
                password: 'testPassword1!',
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
                emailAdress: 'k.jansen@avans.nl',
                password: 'noLetters',
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
                emailAdress: 'n.stam@server.nl',
                password: 'testPassword1!',
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

	it('TC-201-5 - User registered successfully', (done) => {

            const testUser = {
                  firstName: 'Kees', 
                  lastName: 'Jansen', 
                  emailAdress: 'k.jansen@avans.nl',
                  password: 'testPassword1!',
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
                  //data.id.should.equal(3)
                  data.firstName.should.equal('Kees');
                  data.lastName.should.equal('Jansen');
                  data.emailAdress.should.equal('k.jansen@avans.nl');
                  data.password.should.equal('testPassword1!');
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
                  data.emailAdress.should.equal('n.stam@server.nl')
                  data.password.should.equal('Password123!')

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

      it('TC-205-1 - EmailAdress missing', (done) => {
            const id = 2
            const testUser = {
                  firstName: 'Klaas', 
                  lastName: 'Jansen'
            }
		chai.request(server)
		.put(`/api/user/${id}`)
            .send(testUser)
		.end((err,res)=>{
            assert(err === null);

            res.body.should.be.an('object');
            let {status, message} = res.body;

            status.should.equal(400);
            message.should.equal(`emailAdress is required`);

            done();
		})
	});

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

	it('TC-205-6 - User successfully updated', (done) => {
            const id = 2
            const testUser = {
                  firstName: 'Klaas', 
                  lastName: 'Jansen', 
                  emailAdress: 'k.jansen@avans.nl',
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

