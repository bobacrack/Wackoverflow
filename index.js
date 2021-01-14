const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;
const db = new sqlite3.Database('./db/wack.db');
const session = require('express-session')
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const {window} = new JSDOM();
const {document} = (new JSDOM('')).window;
global.document = document;
const $ = require('jquery')(window);

const port = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'anything',
                resave: true,
                saveUninitialized: true 
              }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/public', express.static(process.cwd() + '/public'));

passport.use(new LocalStrategy(
  async function(username, password, done) {
      try{
        const user = await getUser(username)
        if(user == null){
          return done(null, false, { message: "No user with that name"})
        }

        if(password == user.password){
          return done(null, user)
        } else {
          return done(null, false, { message: 'Password incorrect'})
        }
      }catch(e) {
        return done(e)
      }
  }
));

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try {
    let user = await getUserByID(id);
    if(user == null){
      return done(new Error('user not found'))
    }
    done(null, user);
  }catch(e){
    done(e);
  }
})



app.get('/:search?', async function (req, res) {
  const topics = await getAllTopics();
  if(typeof req.params.search !== 'undefined'){
    const topic = await getTopicByTag(req.params.search);
    if(typeof req.user !== 'undefined'){
      res.render('pages/index', {
        data: topic,
        user: req.user
      })
    }else{
      res.render('pages/index', {
        data: topic,
        user: null
      })
    }
  }
  else {
    if(typeof req.user !== 'undefined'){
      res.render('pages/index', {
        data: topics,
        user: req.user
      })
    }else{
      res.render('pages/index', {
        data: topics,
        user: null
      })
    }
  }
});


app.get('/ask', function (req, res) {
  if(typeof req.user !== 'undefined'){
    res.render('pages/ask', {
      user: req.user
    })
  }else{
    res.redirect('/login')
  }
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


app.get('/question/:id?',async function (req, res) {
  const dat = await getTopic(req.params.id);
  const allComments = await getComments(req.params.id);

  if(typeof req.user !== 'undefined'){
    res.render('pages/question', {
      data: dat,
      user: req.user,
      comments: allComments
    })
  }else{
    res.render('pages/question', {
      data: dat,
      user: null,
      comments: allComments
    })
  }
});

app.get('/user/:id?', async function(req, res){

  const userData = await getUserDataByID(req.params.id);
  const userTopics = await getTopicsByUser(req.params.id);

  if(typeof req.user !== 'undefined'){
    res.render('pages/user', {
      userAccount: userData,
      userLoggedIn: req.user,
      data: userTopics
    })
  }else{
    res.render('pages/user', {
      userAccount: userData,
      userLoggedIn: null,
      data: userTopics
    })
  }
   
});

app.post('/question', function(req, res) {
    console.log(req.body);

    const UID = req.body.UserID;
    const content = req.body.content;
    const TID = req.body.TopicID;

    db.run('INSERT INTO Comments (Content, UserID, TopicID) VALUES (?, ?, ?);', [content, UID, TID]);
    res.redirect(req.get('referer'));

})

app.post('/ask', function (req, res) {
  const title = req.body.title;
  const body = req.body.body;
  const tag = req.body.tag;
  const UID = req.body.UserID;

  db.run('INSERT INTO Topic (Headline, Content, Tag, UserID) VALUES (?, ?, ?, ?);', [title, body, tag, UID]);
  res.redirect('/');
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

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

function getTopicsByUser(id){

  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM Topic WHERE Topic.UserID=?",[id], (err, rows)=>{
      if(err){
        throw err;
      }else{
        const topics = [];
        rows.forEach(row =>{
          topics.push({ "TopicID": row.TopicID, "Headline": row.Headline, "Tag": row.Tag});
        })
        resolve(topics);
      }
    })
  })

}

function getUser(username){

  return new Promise((resolve, reject) =>{
    db.all("SELECT * FROM User", (err, rows)=>{
      if (err){
        throw err;
      }else {
        rows.forEach(row=>{
          if(username === row.Username){
            const user = {username: row.Username, password: row.Password, id: row.UserID}
            resolve(user);
          }
        })
        resolve(null);
      }
    })
    
  });
}

function getUserByID(id){

  return new Promise((resolve, reject) =>{
    db.all("SELECT * FROM User", (err, rows)=>{
      if (err){
        throw err;
      }else {
        rows.forEach(row=>{
          if(id === row.UserID){
            const user = {username: row.Username, password: row.Password, id: row.UserID}
            resolve(user);
          }
        })
        resolve(null);
      }
    })
    
  });
}

function getUserDataByID(id){

  return new Promise((resolve, reject) =>{
    db.all("SELECT * FROM User", (err, rows)=>{
      if (err){
        throw err;
      }else {
        rows.forEach(row=>{
          if(id == row.UserID){
            const user = {"Username": row.Username, "UserID": row.UserID};
            resolve(user);
          }
        })
        resolve(null);
      }
    })
    
  });
}

function getComments(TID){
  return new Promise((resolve, reject) =>{

    db.all('SELECT Comments.Content, User.Username FROM Comments INNER JOIN User ON Comments.UserID=User.UserID WHERE Comments.TopicID = ?',[TID], (err, rows)=>{
        if(err){
          throw err
        }else {
          const comments = []
          var count = 0;
          rows.forEach(row =>{
            count++;
            comments.push({"Count":count, "Content": row.Content, "Username": row.Username})
          })
          resolve(comments);
        }
    })

  });
}

function getAllTopics(){
  return new Promise((resolve, reject) =>{
    db.all("SELECT TopicID, Headline, Tag, Username, Topic.UserID FROM Topic INNER JOIN User ON Topic.UserID = User.UserID", (err, rows) => {

      if (err) {
        throw err;
      } else {
        const topics = [];
  
        rows.forEach(row => {
          topics.push({ "TopicID": row.TopicID, "Headline": row.Headline, "Tag": row.Tag, "Username": row.Username, "UserID": row.UserID });
        })
        resolve(topics);
      }
  
    })
  })
}

function getTopicByTag(TAG){

  return new Promise((resolve, reject) => {
    db.all('SELECT * from Topic WHERE Tag=?', [TAG], (err, rows) => {
      if(err){
        throw err
      }
      else {
        const topics = [];
  
        rows.forEach(row => {
          topics.push({ "TopicID": row.TopicID, "Headline": row.Headline, "Tag": row.Tag, "Username": row.Username, "UserID": row.UserID });
        })
        resolve(topics);
      }
    })
  })
}

function getTopic(ID){

  return new Promise((resolve, reject) =>{
    db.all('SELECT * from Topic WHERE TopicID=?;', [ID], (err, row) => {
      if(err) {
        throw err
      }
      const dat = row;
      resolve(dat)
    })
  });
}


const server = app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

module.exports = server
