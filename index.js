const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;
const db = new sqlite3.Database('./db/wack.db');

const port = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static(process.cwd() + '/public'));

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.get('/', async function (req, res) {
  
  const topics = await getAllTopics();
  
  res.render('pages/index', {
    data: topics
  })

});

function getAllTopics(){
  return new Promise((resolve, reject) =>{
    db.all("SELECT TopicID, Headline, Tag, Username FROM Topic INNER JOIN User ON Topic.UserID = User.UserID", (err, rows) => {

      if (err) {
        throw err;
      } else {
        const topics = [];
  
        rows.forEach(row => {
          topics.push({ "TopicID": row.TopicID, "Headline": row.Headline, "Tag": row.Tag, "Username": row.Username });
        })
        resolve(topics);
      }
  
    })
  })
}

app.get('/ask', function (req, res) {
  res.render('pages/ask');
});

app.get('/createAccount', function(req, res) {
  res.render('pages/createAccount',{
    data: "d-none"
  });
});

app.get('/login', function (req, res) {
  res.render('pages/login', {
    data: "d-none"
  });
});

app.get('/question', function (req, res) {

  const ID = req.body.TopicID;
  db.run('SELECT from Topic WHERE TopicID=?;', [ID], (err, row) => {
    if(err) {
      throw err
    }
    const dat = row;
    dat.forEach(x => { console.log(x)});
    res.render('pages/question', {
      data: dat,
    });
  })


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
  db.all('SELECT * from User WHERE Username=?;', [username], (err, row) => {
    if (err) {
      throw err
    }

    if (row.length == 0) {
      res.render('pages/login', {
        data: ""
      });
    }
    else if (row[0].Password == password) {
      res.redirect('/')
    } else {
      res.render('pages/login', {
        data: ""
      });

    }
  })

});

app.post('/create', function (req, res) {
     res.redirect('createAccount')
 })



app.post('/createAccount', async function(req, res){

  const username = req.body.user;
  const password = req.body.pass;
  const passwordRe = req.body.passRe;

  if(password != passwordRe){
    res.render('pages/createAccount',{
      data: ""
    });
  }else {
      
     const isExisting = await existsUser(username)
     if(isExisting){
      res.render('pages/createAccount',{
        data: ""
      });
     }else {
       db.run("INSERT INTO User(Username, Password) VALUES(?,?);", [username, password]);
       res.redirect("/");
     } 

    }

})

app.post('/create', function(req, res){

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
