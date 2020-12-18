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

app.post('/ask', function(req,res){
  const title = req.body.title;
  const body = req.body.body;
  const tag = req.body.tag;
  const UID = 1;

  db.run('INSERT INTO Topic (Headline, Content, Tag, UserID) VALUES (?, ?, ?, ?);', [title, body, tag, UID]);
  res.redirect('/');
})

app.post('/login', function(req, res){
  
  const username = req.body.user;
  const password = req.body.pass;
 db.run('SELECT * from User WHERE Username=?;', [username], (err, rows) =>{
   if (err){
     throw err;
   }

   rows.forEach(row =>{
     
   })

 })

})


const server = app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

module.exports = server