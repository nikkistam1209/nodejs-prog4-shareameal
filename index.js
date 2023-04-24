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


let users = []
users.push(new User(1, 'nikki.stam@hotmail.com', 'Nikki', 'Stam'))
users.push(new User(2, 'onno.stam@hotmail.com', 'Onno', 'Stam'))


// algemene route
app.use('*', (req, res, next) => {
  const method = req.method;
  logger.info(`Methode ${method} aangeroepen`);
  //res.status(200).json()
  next();
})

// UC-101 inloggen
// app.get('api/login')

// UC-102 opvragen systeeminformatie
app.get('/api/info', (req, res)=> {
  let pad = req.request.pad;
  logger.log(`op route ${pad}`)

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


// UC-201
app.post('/api/user/register', (req, res) => {
  // id laten genereren?

  logger.info('register user')

  const { id, email, firstname, lastname } = req.body;
  logger.debug('user = ', req.body)

  const emailExists = users.some(user => user.email === email);
  if (emailExists) {
    res.status(403).json({ error: 'Email already exists' });
    return;
  }

  const newUser = new User(id, email, firstname, lastname);
  users.push(newUser);
  res.json(newUser);
})

// UC-202
app.get('/api/user', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.json(users)
})

// UC-203
app.get('/user/profile', (req, res) => {
  res.send('This function has not been implemented')
})

// UC-204
app.get('/user/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  let user = users.find(u => u.getId()===parseInt(req.params.id))
  if (!user) return res.status(404).json({error: 'Unable to find user'})
  res.json(user)
})




// UC-205
app.put('/user/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { email, firstname, lastname } = req.body;
  const userIndex = users.findIndex(u => u.getId() === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Unable to find user' });
  }
  const updatedUser = { ...users[userIndex], email, firstname, lastname };
  users[userIndex] = updatedUser;
  res.json(updatedUser);
})

// UC-206
app.delete('/user/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.getId() === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Unable to find user' });
  }
  const deletedUser = users.splice(userIndex, 1)[0];
  res.json(deletedUser);
})







app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})










module.exports = app;