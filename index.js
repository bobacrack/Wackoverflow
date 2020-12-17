const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const db = new sqlite3.Database('./db/wack.db');

const port = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.render('pages/index');
});

app.get('/ask', function(req, res) {
  res.render('pages/ask');
});

app.get('/login', function(req, res) {
  res.render('pages/login');
});


const server = app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

module.exports = server