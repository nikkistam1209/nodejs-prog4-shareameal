# nodejs-prog4-shareameal

<h1>Share-a-meal API</h1>

<p>This API server allows users to access the database used to share meals. Users can register, login, and perform various operations such as creating, deleting, and retrieving meals from the database.</p>

<h2>Features</h2>

<ul>
  <li>User registration and authentication with JSON Web Tokens</li>
  <li>Meal management: create, delete, and retrieve meals</li>
</ul>

<h2>Installation</h2>

<ol>
  <li>Clone this project to your local machine:</li>
  <pre><code>git clone https://github.com/nikkistam1209/nodejs-prog4-shareameal.git</code></pre>
  <li>Install the required modules:</li>
  <pre><code>npm install</code></pre>
  <li>Start the server:</li>
  <pre><code>npm run dev</code></pre>
</ol>

<h2>Running tests</h2>
<p>The API uses Mocha as a framwork and Chai for assertions for testing. Tests can be run with <code>npm run test</code>.</p>

<h2>API Routes</h2>

<h3>Info</h3>

<ul>
  <li><code>GET /api/info</code>: Info endpoint</li>
</ul>

<h3>Users</h3>

<ul>
  <li><code>POST /api/login</code>: User login</li>
  <li><code>POST /api/user</code>: Register a new user</li>
  <li><code>GET /api/user</code>: Retrieve all users</li>
  <li><code>GET /api/user/profile</code>: Retrieve your profile</li>
  <li><code>GET /api/user/:userId</code>: Retrieve user by ID</li>
  <li><code>PUT /api/user/:userId</code>: Update a user by ID</li>
  <li><code>DELETE /api/user/:userId</code>: Delete a  user by ID</li>
</ul>

<h3>Meals</h3>

<ul>
  <li><code>POST /api/meal</code>: Create new meal</li>
  <li><code>GET /api/meal</code>: Retrieve all meals</li>
  <li><code>GET /api/meal/:mealId</code>: Retrieve a meal by ID</li>
  <li><code>DELETE /api/meal/:mealId</code>: Delete a meal by ID</li>
</ul>

<h2>Error Handling</h2>

<p>The API has comprehensive error handling. Users receive appropriate status codes and messages in case of an error.</p>

