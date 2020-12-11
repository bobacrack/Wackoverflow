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

//TODO Magic


const server = app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

module.exports = server