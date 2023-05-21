const dbconnection = require('../../src/util/mysql-db');

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const logger = require('../../src/util/utils').logger
const assert = require('assert')
chai.should()
chai.use(chaiHttp)

// test

let token = ''

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

describe('User API tests', () => {

      // we use only one hook to set up the database  
      before((done) => {
            logger.trace('before called');

            dbconnection.getConnection(function (err, connection) {
              if (err) {
                done(err);
                throw err; // no connection
              }
              // Use the connection
              connection.query(
                CLEAR_DB + INSERT_USER + INSERT_MEALS,
                function (error, results, fields) {
                  if (error) {
                    done(error);
                    throw error; // not connected!
                  }
                  logger.trace('before done');
                  // When done with the connection, release it.
                  dbconnection.releaseConnection(connection);
                  done();
                }
              );
            });
      });

      // empty data objects fixen, should.be.eql ???
      // Use case 101 login
      describe('UC-101 - Login', function() {

            

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

                        

                        token = data.token

                        logger.debug('token ', token)

                        done()
                  })
            });

      })

      // empty data objects fixen
      // Use case 201 registering a new user
      describe('UC-201 - Register user', function() {

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

      // passwords fixen
      // Use case 202 requesting all users
      describe('UC-202 - Get all users', function() {

            it('TC-202-1 - Return all user data', (done) => {
                  logger.debug('token ', token)
                  chai.request(server)
                  .get('/api/user')
                  .set('Authorization', `Bearer ${token}`)
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
                        //user.should.have.property('password');
                        });

                        done();
                  })
            });

            it('TC-202-2 - Search for non existing fields', (done) => {
                  logger.debug('token ', token)
                  chai.request(server)
                  .get('/api/user?firstName=Pieter')
                  .set('Authorization', `Bearer ${token}`)
                  .end((err,res)=>{
                  assert(err === null);

                        res.body.should.be.an('object');
                        let {status, message, data} = res.body;

                        status.should.equal(200);
                        message.should.equal('User data endpoint');
                        data.should.be.an('array');
                        data.length.should.be.eql(0);

                        });

                        done();
                  
            });

            it('TC-202-3 - Search for inactive users', (done) => {
                  logger.debug('token ', token)
                  chai.request(server)
                  .get('/api/user?isActive=0')
                  .set('Authorization', `Bearer ${token}`)
                  .end((err,res)=>{
                  assert(err === null);

                        res.body.should.be.an('object');
                        let {status, message, data} = res.body;

                        status.should.equal(200);
                        message.should.equal('User data endpoint');
                        data.should.be.an('array');
                        data.length.should.be.eql(0);

                        });

                        done();
                  
            });

            it('TC-202-4 - Search for active users', (done) => {
                  logger.debug('token ', token)
                  chai.request(server)
                  .get('/api/user?isActive=1')
                  .set('Authorization', `Bearer ${token}`)
                  .end((err,res)=>{
                  assert(err === null);

                        res.body.should.be.an('object');
                        let {status, message, data} = res.body;

                        status.should.equal(200);
                        message.should.equal('User data endpoint');
                        data.should.be.an('array');
                        data.length.should.be.above(1);

                        });

                        done();
                  
            });

            it('TC-202-5 - Search for existing field', (done) => {
                  logger.debug('token ', token)
                  chai.request(server)
                  .get('/api/user?firstName=Nikki')
                  .set('Authorization', `Bearer ${token}`)
                  .end((err,res)=>{
                        assert(err === null);

                        res.body.should.be.an('object');
                        let {status, message, data} = res.body;

                        status.should.equal(200);
                        message.should.equal('User data endpoint');
                        data.should.be.an('array');
                        data.length.should.be.eql(1);

                        // data.firstName.should.equal('Nikki');
                        // data.lastName.should.equal('Stam');
                        // data.emailAdress.should.equal('n.stam@server.nl');
                        // //data.password.should.equal('Password123');
                        // data.phoneNumber.should.equal('06-29414389');
                        // data.street.should.equal('Amazone');
                        // data.city.should.equal('Dordrecht');

                  });

                  done();
                  
            });


      })

      // empty data object + inhoud gevulde data object met []
      // Use case 203 requesting user profile
      describe('UC-203 - Get user profile', function() {

            it('TC-203-1 - Invalid token', (done) => {
            	chai.request(server)
            	.get('/api/user/profile')
                  .set('Authorization', `Bearer noToken`)
            	.end((err,res)=>{
                  
                        assert(err === null);

                        res.body.should.be.an('object');
                        let {status, message, data} = res.body;

                        status.should.equal(401);
                        message.should.equal('Not authorized');
                        //data.should.be.an('array');
                        //data.length.should.be.eql(0);
            	})
                  
                  done()
            });

            it('TC-203-2 - Successfully retrieved profile', (done) => {
            	chai.request(server)
            	.get('/api/user/profile')
                  .set('Authorization', `Bearer ${token}`)
            	.end((err,res)=>{
                  
                        assert(err === null);

                        res.body.should.be.an('object');
                        let {status, message, data} = res.body;

                        status.should.equal(200);
                        message.should.equal('User data endpoint');
                        data.should.be.an('object');
                        //data.length.should.be.eql(1);

                        data.should.have.property('user');
                        data.should.have.property('meals');

                  
            	})

                  done()
            });
      })

      // data objecten
      // Use case 204 requesting a user by ID
      describe('UC-204 - Get user by id', function() {

            it('TC-204-1 - Invalid token', (done) => {
            	chai.request(server)
            	.get('/api/user/1')
                  .set('Authorization', `Bearer noToken`)
            	.end((err,res)=>{
                  
                        assert(err === null);

                        res.body.should.be.an('object');
                        let {status, message, data} = res.body;

                        status.should.equal(401);
                        message.should.equal('Not authorized');
                        //data.should.be.an('array');
                        //data.length.should.be.eql(0);
            	})
                  
                  done()
            });

            it('TC-204-2 - User ID does not exist', (done) => {
                  chai.request(server)
                  .get('/api/user/666')
                  .set('Authorization', `Bearer ${token}`)
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
                  .set('Authorization', `Bearer ${token}`)
                  .end((err,res)=>{
                        assert(err === null);

                        res.body.should.be.an('object')
                        let {status, message, data} = res.body;

                        status.should.equal(200)
                        message.should.equal('User data endpoint')
                        data.should.be.an('object')
                        //data.id.should.equal(1);
                        // data.firstName.should.equal('Nikki');
                        // data.lastName.should.equal('Stam');
                        // data.emailAdress.should.equal('n.stam@server.nl')
                        // data.password.should.equal('Password123')

                        done()
                  })
            });
      })

      // Use case 205 updating a user
      describe('UC-205 - Update user', function() {

            it('TC-205-1 - EmailAdress missing', (done) => {
                  const testUser = {
                        password: 'Password1234',
                        street: 'Lovensdijkstraat',
                        city: 'Breda',
                        phoneNumber: '0687654321'
                  }
                  chai.request(server)
                  .put(`/api/user/1`)
                  .set('Authorization', `Bearer ${token}`)
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

            it('TC-205-2 - Not the owner', (done) => {
                  // user 1 tries to update user 2
                  const testUser = {
                        emailAdress: 'n.stam@avans.nl',
                        password: 'Password1234',
                        street: 'Lovensdijkstraat',
                        city: 'Breda',
                        phoneNumber: '0687654321'
                  }
                  chai.request(server)
                  .put(`/api/user/2`)
                  .set('Authorization', `Bearer ${token}`)
                  .send(testUser)
                  .end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object');
                  let {status, message} = res.body;

                  status.should.equal(403);
                  message.should.equal(`Not authorized to update this user`);

                  done();
                  })
            });

            it('TC-205-3 - Invalid phoneNumber', (done) => {
                  const testUser = {
                        emailAdress: 'n.stam@avans.nl',
                        password: 'Password1234',
                        street: 'Lovensdijkstraat',
                        city: 'Breda',
                        phoneNumber: '0786172680'
                  }
                  chai.request(server)
                  .put(`/api/user/1`)
                  .set('Authorization', `Bearer ${token}`)
                  .send(testUser)
                  .end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object');
                  let {status, message, data} = res.body;

                  status.should.equal(400);
                  message.should.equal(`phoneNumber is not valid`);
                  // data.should

                  done();
                  })
            });

            it('TC-205-4 - User not found', (done) => {
                  const testUser = {
                        emailAdress: 'n.stam@server.nl',
                        password: 'Password1234',
                        street: 'Lovensdijkstraat',
                        city: 'Breda',
                        phoneNumber: '0687654321'
                  }
                  chai.request(server)
                  .put(`/api/user/666`)
                  .set('Authorization', `Bearer ${token}`)
                  .send(testUser)
                  .end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object');
                  let {status, message} = res.body;

                  status.should.equal(404);
                  message.should.equal(`User with ID 666 not found`);

                  done();
                  })
            });

            it('TC-205-5 - Not logged in', (done) => {
                  const testUser = {
                        emailAdress: 'n.stam@avans.nl',
                        password: 'Password1234',
                        street: 'Lovensdijkstraat',
                        city: 'Breda',
                        phoneNumber: '0687654321'
                  }
                  chai.request(server)
                  .put(`/api/user/1`)
                  .send(testUser)
                  .end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object');
                  let {status, message} = res.body;

                  status.should.equal(401);
                  message.should.equal(`No authorization header`);

                  done();
                  })
            });

            it('TC-205-6 - User successfully updated', (done) => {
                  const testUser = {
                        emailAdress: 'n.stam@avans.nl',
                        password: 'Password1234',
                        street: 'Lovensdijkstraat',
                        city: 'Breda',
                        phoneNumber: '0687654321'
                  }
                  chai.request(server)
                  .put(`/api/user/1`)
                  .set('Authorization', `Bearer ${token}`)
                  .send(testUser)
                  .end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object');
                  let {status, message} = res.body;

                  status.should.equal(200);
                  message.should.equal(`Successfully updated user with ID 1`);

                  done();
                  })
            });
      })

      // Use case 206 deleting a user
      describe('UC-206 - Delete user', function() {

            // we have to delete the meals from the database, or the user can not be deleted
            before((done) => {
                  logger.trace('before called');
      
                  dbconnection.getConnection(function (err, connection) {
                    if (err) {
                      done(err);
                      throw err; // no connection
                    }
                    // Use the connection
                    connection.query(
                      CLEAR_MEAL_TABLE,
                      function (error, results, fields) {
                        if (error) {
                          done(error);
                          throw error; // not connected!
                        }
                        logger.trace('before done');
                        // When done with the connection, release it.
                        dbconnection.releaseConnection(connection);
                        done();
                      }
                    );
                  });
            });

            it('TC-206-1 - User not found', (done) => {
                  chai.request(server)
                  .delete(`/api/user/666`)
                  .set('Authorization', `Bearer ${token}`)
                  .end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object');
                  let {status, message} = res.body;

                  status.should.equal(404);
                  message.should.equal(`Unable to find user with ID 666`);

                  done();
                  })
            });

            it('TC-206-2 - Not logged in', (done) => {
                  chai.request(server)
                  .delete(`/api/user/1`)
                  .end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object');
                  let {status, message} = res.body;

                  status.should.equal(401);
                  message.should.equal(`No authorization header`);

                  done();
                  })
            });

            it('TC-206-3 - Not the owner', (done) => {
                  chai.request(server)
                  .delete(`/api/user/2`)
                  .set('Authorization', `Bearer ${token}`)
                  .end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object');
                  let {status, message} = res.body;

                  status.should.equal(403);
                  message.should.equal(`Not authorized to delete this user`);

                  done();
                  })
            });

            it('TC-206-4 - User successfully deleted', (done) => {
                  chai.request(server)
                  .delete(`/api/user/1`)
                  .set('Authorization', `Bearer ${token}`)
                  .end((err,res)=>{
                  assert(err === null);

                  res.body.should.be.an('object');
                  let {status, message} = res.body;

                  status.should.equal(200);
                  message.should.equal(`Successfully deleted user with ID 1`);

                  done();
                  })
            });


      })

})