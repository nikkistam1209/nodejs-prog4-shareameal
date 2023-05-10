const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');

const userController = {

  // UC-201 nieuwe user registreren
  createUser:((req, res) => {
    logger.info('register user')

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
  updateUser: (req, res, next) => {
    logger.info('update user');

    const id = req.params.userId;
    const updatedUser = req.body;
    logger.debug('updatedUser = ', updatedUser);

    const sqlStatement = 'UPDATE `user` SET ? WHERE `id` = ?';
    pool.getConnection((err, conn) => {
        if (err) {
            logger.error(err.message);
            next({ code: 500, message: 'Failed to connect to the database' });
            return;
        }
        conn.query(sqlStatement, [updatedUser, id], (err, result) => {
            if (err) {
                logger.error(err.message);
                next({ code: 500, message: 'Failed to update user data in the database' });
                return;
            }
            if (result.affectedRows === 0) {
                logger.warn('No user found with ID:', id);
                res.status(404).json({ status: 404, message: `User with ID ${id} not found` });
                return;
            }
            logger.info('User updated successfully with ID:', id);
            res.status(200).json({ status: 200, message: 'Successfully updated user', data: { id, ...updatedUser } });
        });
        pool.releaseConnection(conn);
    });



  }
  
  ,
  
  // UC-206 verwijderen van een user
  deleteUser:(req, res) => {

    const userId = parseInt(req.params.userId);
    const sqlStatement = `DELETE FROM \`user\` WHERE id=${userId}`;
  
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
          if (results.affectedRows === 0) {
            logger.info(`Unable to find user with ID ${userId}`);
            res.status(404).json({ message: `Unable to find user with ID ${userId}` });
          } else {
            logger.info(`Successfully deleted user with ID ${userId}`);
            res.status(200).json({ message: `Succesfully deleted user with ID ${userId}` });
          }
        });
        pool.releaseConnection(conn);
      }

    });

  }
  
}
  
module.exports = userController
  