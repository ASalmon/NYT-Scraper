require("dotenv").config();
const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');


const app = express();
const PORT = process.env.PORT || 3000;

// Setup Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// DB config
const db = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Setup Handlebars
app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main'
  })
);
app.set('view engine', 'handlebars');

// Require routes
require('./routes/api')(app);
require('./routes/html')(app);

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true },
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(`Error connecting to DB: ${err}`));

app.listen(PORT, () => console.log(
  `==> 🌎  Listening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`,
));
  