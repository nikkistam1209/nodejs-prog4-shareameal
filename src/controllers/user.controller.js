const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');

const userController = {

  // UC-201 nieuwe user registreren
  createUser:((req, res, next) => {
    logger.info('register user')
    const user = req.body;
    logger.debug('user = ', user)

    try {
        // validation: fields must be valid and filled out
                // ik weet niet of straat/stad/phonenumber/roles etc. verplichte velden zijn 
        assert(typeof user.firstName === 'string' && user.firstName.trim().length > 0 , 'firstName must be a string')
        assert(typeof user.lastName === 'string' && user.lastName.trim().length > 0 , 'lastName must be a string')
        // email address validation
        assert(typeof user.emailAdress === 'string', 'emailAdress must be a string')
        assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.emailAdress), 'emailAdress is not valid')
        // password validation
        assert(typeof user.password === 'string', 'password must be a string')
        assert(user.password.length >= 8, 'password must be at least 8 characters long')
        assert(/[a-z]/i.test(user.password), 'password must contain at least one letter')
        assert(/[0-9]/.test(user.password), 'password must contain at least one number')
        assert(/[^a-z0-9]/i.test(user.password), 'password must contain at least one special character')

        pool.query('SELECT * FROM `user` WHERE `emailAdress` = ?', [user.emailAdress], (err, result) => {
            if (err) {
                logger.error(err.message);
                res.status(500).json({ 
                    status: 500, 
                    message: 'Failed to search for emailAdress in the database' 
                });
                return;
            }   
            try {
                assert(result.length === 0, 'emailAdress already exists in the database')
                const sqlStatement = 'INSERT INTO `user` SET ?'
                pool.getConnection((err, conn) => {
                    if (err) {
                        logger.error(err.message);
                        res.status(500).json({ 
                            status: 500, 
                            message: 'Failed to connect to the database' 
                        });
                        return;
                    }
                    conn.query(sqlStatement, user, (err, result) => {
                        if (err) {
                            logger.error(err.message);
                            res.status(500).json({ 
                                status: 500, 
                                message: 'Failed to insert user data into the database' 
                            });
                            return;
                        }
                        user.id = result.insertId;
                        logger.info('User registered successfully with ID:', result.insertId)
                        res.status(201).json({ 
                            status: 201, 
                            message: 'Successfully registered user', 
                            data: user 
                        });
                    })
                    pool.releaseConnection(conn);
                });
            } catch (err) {
                logger.warn(err.message)
                res.status(403).json({
                    status: 403,
                    message: err.message // this is the assert message: the user/email already exists
                });
                return;
            }
        });
    } catch (err) {
        logger.warn(err.message)
        res.status(400).json({
            status: 400,
            message: err.message // this is the assert message
        });
        return;
    }
  }),





  
  // UC-202 opvragen alle users
  getAllUsers:(req, res, next) => {
    logger.info('get all users')

    const queryField = Object.entries(req.query)
    logger.info(`Queryfield 1 ${queryField[0][0]} = ${queryField[0][1]}`)
    logger.info(`Queryfield 2 ${queryField[1][0]} = ${queryField[1][1]}`)

    let sqlStatement = '';

    if (queryField.length == 2) {
        sqlStatement = 'SELECT * FROM `user` WHERE '
    } else if (queryField.length = 1) {
        sqlStatement = 'SELECT * FROM `user` WHERE  AND '
    } else {
        sqlStatement = 'SELECT * FROM `user`'
    }

    //let sqlStatement = 'SELECT * FROM `user`'

    pool.getConnection(function (err, conn) {
        if (err) {
          logger.error(err.message)
          next({
            status: 500,
            message: 'Failed to connect to the database' 
          })
        }
        if (conn) {
          conn.query(sqlStatement, function (err, results, fields) {
            if (err) {
              logger.error(err.message)
              next({
                status: 500,
                message: 'Failed to retrieve user data'
              })
            }
            if (results) {
              logger.info('Found', results.length, 'results');
              res.status(200).json({
                status: 200,
                message: 'User data endpoint',
                data: results
              })
            }
          })
          pool.releaseConnection(conn);
        }
    });
  },


  // UC-203 opvragen gebruikersprofiel
  getUserProfile:((req, res) => {
    res.status(501).json({ 
        status: 501, 
        message: 'This function has not been implemented'
    });
  })
  ,


  // UC-204 opvragen gegevens van een user
  getUserById:( (req, res, next) => {
    logger.info('get user by id');

    const id = req.params.userId;

    if (!/^\d+$/.test(id)) {
        res.status(401).json({ 
            status: 401, 
            message: 'Invalid token' 
        });
        return;
    }

    const sqlStatement = 'SELECT * FROM `user` WHERE id = ?';

    pool.getConnection((err, conn) => {
        if (err) {
            logger.error(err.message);
            next({ 
                status: 500, 
                message: 'Failed to connect to the database' 
            });
            return;
        }
        conn.query(sqlStatement, id, (err, result) => {
            if (err) {
                logger.error(err.message);
                next({ 
                    status: 500, 
                    message: 'Failed to retrieve user data from the database' 
                });
                return;
            }
            if (result.length === 0) {
                res.status(404).json({ 
                    status: 404, 
                    message: 'Unable to find user' 
                });
                return;
            }
            const user = result[0];
            logger.info('User found:', user);
            res.status(200).json({ 
                status: 200, 
                message: 'User data', 
                data: user 
            });
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
            next({ 
                status: 500, 
                message: 'Failed to connect to the database' 
            });
            return;
        }
        conn.query(sqlStatement, [updatedUser, id], (err, result) => {
            if (err) {
                logger.error(err.message);
                next({ 
                    status: 500, 
                    message: 'Failed to update user data in the database' 
                });
                return;
            }
            if (result.affectedRows === 0) {
                logger.warn('No user found with ID:', id);
                res.status(404).json({ 
                    status: 404, 
                    message: `User with ID ${id} not found` 
                });
                return;
            }
            logger.info('User updated successfully with ID:', id);
            res.status(200).json({ 
                status: 200, 
                message: `Successfully updated user with ID ${id}`, 
                data: { id, ...updatedUser } 
            });
        });
        pool.releaseConnection(conn);
    });
  },
  








  // UC-206 verwijderen van een user
  deleteUser:(req, res, next) => {

    const userId = parseInt(req.params.userId);
    const sqlStatement = `DELETE FROM \`user\` WHERE id=${userId}`;
  
    pool.getConnection(function (err, conn) {
      if (err) {
        logger.error(err.message);
            next({ 
                status: 500, 
                message: 'Failed to connect to the database' 
            });
            return;
      }
      if (conn) {
        conn.query(sqlStatement, function (err, results, fields) {
          if (err) {
            logger.error(err.message);
            next({
              status: 500,
              message: 'Failed to delete user data from the database' 
            });
          }
          if (results.affectedRows === 0) {
            logger.info(`Unable to find user with ID ${userId}`);
            res.status(404).json({ 
                status: 404,
                message: `Unable to find user with ID ${userId}` 
            });
          } else {
            logger.info(`Successfully deleted user with ID ${userId}`);
            res.status(200).json({ 
                status: 200,
                message: `Successfully deleted user with ID ${userId}` 
            });
          }
        });
        pool.releaseConnection(conn);
      }

    });

  }
  
}
  
module.exports = userController
  