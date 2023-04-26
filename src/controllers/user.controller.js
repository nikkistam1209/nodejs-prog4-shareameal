// //const database = require('../util/database');
// const logger = require('../util/utils').logger;
// const assert = require('assert');

//const database = require('../util/database');
const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');





const userController = {

  // UC-201 nieuwe user registreren
  createUser:((req, res) => {
    logger.info('register user')
  
    // const user = req.body;
    // logger.debug('user = ', user)
  
  
    // const emailExists = users.some(existingUser => existingUser.emailAddress === user.emailAddress);
    // if (emailExists) {
    //   res.status(403).json({status:403, error: 'Email already exists' });
    //   return;
    // }
  
    // user.id = index++;
    // users.push(user);
  
    // res.status(201).json({status:201, message: `Succesfully registered user`, data: user});


    const user = req.body;
    logger.debug('user = ', user);

    const sqlStatement = 'INSERT INTO `user` SET ?';
    pool.getConnection((err, conn) => {
        if (err) {
            logger.error(err.message);
            next({ code: 500, message: 'Failed to connect to the database' });
            return;
        }
        conn.query(sqlStatement, user, (err, result) => {
            if (err) {
                logger.error(err.message);
                next({ code: 500, message: 'Failed to insert user data into the database' });
                return;
            }
            logger.info('User registered successfully with ID:', result.insertId);
            user.id = result.insertId;
            res.status(201).json({ status: 201, message: 'Successfully registered user', data: user });
        });
        pool.releaseConnection(conn);
    });
  
  }),
  
  // UC-202 opvragen alle users
  getAllUsers:(req, res, next) => {
    //res.setHeader('Content-Type', 'application/json')
    //res.status(200).json({status:200, message: `User data`, data: users})

    logger.info('get all users')

    let sqlStatement = 'SELECT * FROM `user`';


    pool.getConnection(function (err, conn) {
        if (err) {
          console.log('error', err);
          next('error: ' + err.message);
        }
        if (conn) {
          conn.query(sqlStatement, function (err, results, fields) {
            if (err) {
              logger.err(err.message);
              next({
                code: 409,
                message: err.message
              });
            }
            if (results) {
              logger.info('Found', results.length, 'results');
              res.status(200).json({
                statusCode: 200,
                message: 'User data endpoint',
                data: results
              });
            }
          });
          pool.releaseConnection(conn);
        }
    });
  },


  // UC-203 opvragen gebruikersprofiel
  getUserProfile:((req, res) => {
    res.send('This function has not been implemented')
  })
  ,


  // UC-204 opvragen gegevens van een user
  getUserById:( (req, res) => {
    //res.setHeader('Content-Type', 'application/json')
  
    // if (!/^\d+$/.test(req.params.id)) return res.status(401).json({status:401, error: 'Invalid token'})
  
    // try {
    //   let user = users.find(u => u.getId()===parseInt(req.params.id))
    //   if (!user) return res.status(404).json({status:404, error: 'Unable to find user'})
    //   res.status(200).json({status:200, message: `User data`, data: user})
    // } catch {
    //   // 
    // }

    logger.info('get user by id');

    const id = req.params.userId;

    if (!/^\d+$/.test(id)) {
        res.status(401).json({ status: 401, error: 'Invalid token' });
        return;
    }

    const sqlStatement = 'SELECT * FROM `user` WHERE id = ?';

    pool.getConnection((err, conn) => {
        if (err) {
            logger.error(err.message);
            next({ code: 500, message: 'Failed to connect to the database' });
            return;
        }
        conn.query(sqlStatement, id, (err, result) => {
            if (err) {
                logger.error(err.message);
                next({ code: 500, message: 'Failed to retrieve user data from the database' });
                return;
            }
            if (result.length === 0) {
                res.status(404).json({ status: 404, error: 'Unable to find user' });
                return;
            }
            const user = result[0];
            logger.info('User found:', user);
            res.status(200).json({ status: 200, message: 'User data', data: user });
        });
        pool.releaseConnection(conn);
    });
  }),
  
  // UC-205 wijzigen gegevens van een user
  updateUser:( (req, res) => {
    const userId = parseInt(req.params.id);
  
    let user = users.find(u => u.getId()===parseInt(req.params.id))
    if (!user) return res.status(404).json({status:404, error: 'Unable to find user'})
  
    Object.assign(user, req.body)
  
    res.status(200).json({ message: `Successfully updated userdata`, data: user });
  
  })
  
  ,
  
  // UC-206 verwijderen van een user
  deleteUser:((req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.getId() === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Unable to find user' });
    }
    const deletedUser = users.splice(userIndex, 1)[0].getId();
  
    res.status(200).json({ message: `Succesfully deleted user with ID ${deletedUser}`});
  })
  
}
  
module.exports = userController
  