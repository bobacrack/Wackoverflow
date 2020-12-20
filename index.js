const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const db = new sqlite3.Database('./db/wack.db');

const port = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  db.all("SELECT TopicID, Headline, Tag, Username FROM Topic INNER JOIN User ON Topic.UserID = User.UserID", (err, rows) => {

    if (err) {
      throw err;
<<<<<<< HEAD
    } else {
      const data = [];

      rows.forEach(row => {
        topics.push({ "TopicID": row.TopicID, "Headline": row.Headline, "Tag": row.Tag, "Username": row.Username });
      })
      res.render('pages/index', {
        data: row
      });
      topics.forEach(x => {
        console.log(x)
      })
=======
    }else{
        const data = [];
        rows.forEach(row =>{
          data.push({"TopicID":row.TopicID, "Headline":row.Headline, "Tag": row.Tag, "Username": row.Username});
        })
>>>>>>> 33259dbfa99262c93ebf1d02135d07679dcc980c
    }

  })

});
app.get('/ask', function (req, res) {
  res.render('pages/ask');
});

<<<<<<< HEAD
app.get('/createAccount', function (req, res) {
  res.render('pages/createAccount');
=======
app.get('/createAccount', function(req, res) {
  res.render('pages/createAccount',{
    data: "d-none"
  });
>>>>>>> 33259dbfa99262c93ebf1d02135d07679dcc980c
});

app.get('/login', function (req, res) {
  res.render('pages/login', {
    data: "d-none"
  });
});

app.get('/question', function (req, res) {

  res.render('pages/question');
});

app.post('/ask', function (req, res) {
  const title = req.body.title;
  const body = req.body.body;
  const tag = req.body.tag;
  const UID = 1;

  db.run('INSERT INTO Topic (Headline, Content, Tag, UserID) VALUES (?, ?, ?, ?);', [title, body, tag, UID]);
  res.redirect('/');
})

app.post('/request', function (req, res) {

  const username = req.body.user;
  const password = req.body.pass;
<<<<<<< HEAD
  db.all('SELECT * from User WHERE Username=?;', [username], (err, row) => {
    if (err) {
      throw err
    }

    if (row.length == 0) {
      res.render('pages/login', {
        data: true
      });
    }
    else if (row[0].Password == password) {
      res.redirect('/')
    } else {
      res.render('pages/login', {
        data: true
=======
 db.all('SELECT * from User WHERE Username=?;',[username], (err, row) =>{
   if (err){
    throw err
   }
    
   if(row.length == 0 ){
      res.render('pages/login',{
        data: ""
>>>>>>> 33259dbfa99262c93ebf1d02135d07679dcc980c
      });

    }
<<<<<<< HEAD
  })

});

app.post('/create', function (req, res) {
=======
      else if(row[0].Password == password){
        res.redirect('/')
      }else {
        res.render('pages/login',{
          data: ""
        });
        
      }
 })

});

app.post('/createAccount', async function(req, res){

  const username = req.body.user;
  const password = req.body.pass;
  const passwordRe = req.body.passRe;

  if(password != passwordRe){
    res.render('pages/createAccount',{
      data: ""
    });
  }else {
      
     const isExisting = await existsUser("Levi1")
     if(isExisting){
      res.render('pages/createAccount',{
        data: ""
      });
     }else {
       
     } 

    }

})

app.post('/create', function(req, res){
>>>>>>> 33259dbfa99262c93ebf1d02135d07679dcc980c

  res.redirect('createAccount')
})

  function existsUser(username){

  return new Promise((resolve, reject) =>{
    db.all("SELECT * FROM User", (err, rows)=>{
      if (err){
        throw err;
      }else {
        rows.forEach(row=>{
          if(username === row.Username){
            resolve(true);
          }
        })
        resolve(false);
      }
    })
    
  });
}

const server = app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

module.exports = server
