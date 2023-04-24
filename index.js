const User = require('./user')

const express = require('express')
//const assert = require('assert')
const logger = require('./utils').logger;

const app = express()
const port = 3000
const hostname = '127.0.0.1';

app.use(express.json())

app.listen(port, () => {
  console.log(`Example app listening on port http://${hostname}:${port}/`)
})

// in memory database
let users = []
users.push(new User(1, 'Nikki', 'Stam', 'straat', 'Dordrecht', true, 'nikki.stam@hotmail.com', 'password', '06 29414389'))
users.push(new User(2, 'Henk', 'van den Adel', 'straat', 'Zwijndrecht', true, 'henk@gmail.com', '1234', '06 12345678'))
// index voor eerstvolgende user die toegevoegd wordt
let index = 3;



// algemene route 
app.use('*', (req, res, next) => {
  const method = req.method;
  const url = req.baseUrl;
  logger.info(`Received a ${method} request on url ${url}`);
  next();
})


// UC-101 inloggen
// app.get('api/login')


// UC-102 opvragen systeeminformatie
app.get('/api/info', (req, res)=> {
  logger.info('get server information')

  res.status(201).json({
  status:201,
  message: 'Server info-endpoint',
  data: {
    studentName: 'Nikki',
    studentNumber: 2145898,
    description: 'Welkom bij de API server van share a meal'
  },
  });
});


// UC-201 nieuwe user registreren
app.post('/api/user/register', (req, res) => {
  logger.info('register user')

  const user = req.body;
  logger.debug('user = ', user)


  const emailExists = users.some(existingUser => existingUser.emailAddress === user.emailAddress);
  if (emailExists) {
    res.status(403).json({status:403, error: 'Email already exists' });
    return;
  }

  user.id = index++;
  users.push(user);

  res.status(201).json({status:201, message: `Succesfully registered user`, data: user});

})



// UC-202 opvragen alle users
app.get('/api/user', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.status(200).json({status:200, message: `User data`, data: users})
})

// UC-203 opvragen gebruikersprofiel
app.get('/api/user/profile', (req, res) => {
  res.send('This function has not been implemented')
})

// UC-204 opvragen gegevens van een user
app.get('/api/user/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  if (!/^\d+$/.test(req.params.id)) return res.status(401).json({status:401, error: 'Invalid token'})

  try {
    let user = users.find(u => u.getId()===parseInt(req.params.id))
    if (!user) return res.status(404).json({status:404, error: 'Unable to find user'})
    res.status(200).json({status:200, message: `User data`, data: user})
  } catch {
    // 
  }
})




// UC-205 wijzigen gegevens van een user
app.put('/api/user/:id', (req, res) => {
  const userId = parseInt(req.params.id);

  let user = users.find(u => u.getId()===parseInt(req.params.id))
  if (!user) return res.status(404).json({status:404, error: 'Unable to find user'})

  Object.assign(user, req.body)

  res.status(200).json({ message: `Successfully updated userdata`, data: user });

})



// UC-206 verwijderen van een user
app.delete('/api/user/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.getId() === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Unable to find user' });
  }
  const deletedUser = users.splice(userIndex, 1)[0].getId();

  res.status(200).json({ message: `Succesfully deleted user with ID ${deletedUser}`});
})





// wanneer endpoint niet gevonden kan worden
app.use('*', (req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Endpoint not found',
    data: {}
  });
});


// app.use((req, res, next) => {
//   res.status(404).send("Sorry can't find that!")
// })

// app.use((err, req, res, next) => {
//   console.error(err.stack)
//   res.status(500).send('Something broke!')
// })




module.exports = app;