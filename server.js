const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const fs = require('fs');
const port = process.env.PORT || 3000;

// Route for home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Route for guestbook page
app.get("/guestbook", (req, res) => {
  const messages = require("./package.json");
  let tableHtml = `
  <nav>
  <a href="/">Home</a>
  <a href="/guestbook">Guestbook</a>
  <a href="/newmessage">New Message</a>
  <a href="/ajaxmessage">Ajax Message</a>
</nav>
    <h2>Guestbook</h2>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Username</th>
          <th scope="col">Country</th>
          <th scope="col">Date</th>
          <th scope="col">Message</th>
        </tr>
      </thead>
      <tbody>
  `;
  for (const message of messages) {
    tableHtml += `
      <tr>
        <td>${message.username}</td>
        <td>${message.country}</td>
        <td>${message.date}</td>
        <td>${message.message}</td>
      </tr>
    `;
  }
  tableHtml += `
      </tbody>
    </table>
  `;
  res.send(tableHtml);
});

// Route for new message page
app.get("/newmessage", (req, res) => {
  res.sendFile(path.join(__dirname, '/newmessage.html'));
});

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/newmessage", (req, res) => {
  const { username, country, message } = req.body;

  // Check that all fields are non-empty
  if (!username || !country || !message) {
    res.send("Error: All fields are required.");
    return;
  }

  // Generate a unique ID for the new message
  const id = Date.now().toString();

  // Create a new message object with the submitted data and the generated ID
  const newMessage = {
    id,
    username,
    country,
    date: new Date().toString(),
    message,
  };

  // Add the new message to the JSON file
  const messages = require("./package.json");
  messages.push(newMessage);
  fs.writeFileSync("./package.json", JSON.stringify(messages));

  // Redirect the user to the guestbook page
  res.redirect("/guestbook");
});

// Route for AJAX message page
app.get('/ajaxmessage', function(req, res) {
  res.sendFile(__dirname + '/ajaxmessage.html');
});

app.post('/ajaxmessage', function(req, res) {
  // get data from request body
  const { username, country, message } = req.body;

  // validate input fields
  if (!username || !country || !message) {
    res.status(400).send('Error: All fields are required');
    return;
  }

  // create new message object
  const newMessage = {
    id: uuidv4(),
    username,
    country,
    date: new Date().toUTCString(),
    message
  };

  // read current data from file
  const data = fs.readFileSync('data.json', 'utf8');
  let messages = JSON.parse(data);

  // add new message to messages array
  messages.push(newMessage);

  // write updated messages array to file
  fs.writeFileSync('data.json', JSON.stringify(messages), 'utf8');

  // send updated messages as response
  res.json(messages);
});

// Start the server
app.listen(port);

