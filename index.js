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

app.get('/createAccount', function(req, res) {
  res.render('pages/createAccount');
});

app.get('/login', function(req, res) {
  res.render('pages/login', {
    data: false
  });
});

app.get('/question', function(req, res) {
  
  res.render('pages/question');
});

app.post('/ask', function(req,res){
  const title = req.body.title;
  const body = req.body.body;
  const tag = req.body.tag;
  const UID = 1;

  db.run('INSERT INTO Topic (Headline, Content, Tag, UserID) VALUES (?, ?, ?, ?);', [title, body, tag, UID]);
  res.redirect('/');
})

app.post('/request', function(req, res){
  
  console.log(req)
  console.log(res)
  const username = req.body.user;
  const password = req.body.pass;
 db.all('SELECT * from User WHERE Username=?;',[username], (err, row) =>{
   if (err){
    throw err
   }
    
   if(row.length == 0 ){
      res.render('pages/login',{
        data: true
      });
    }
      else if(row[0].Password == password){
        res.redirect('/')
      }else {
        res.render('pages/login',{
          data: true
        });
        
      }
 })

});

app.post('/create', function(req, res){

  res.redirect('createAccount')
})



const server = app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

module.exports = server
