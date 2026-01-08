require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

// Node fetch (works on all Node versions)
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const db = new sqlite3.Database('./database.db');

// ---------- MIDDLEWARE ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

// ---------- DATABASE ----------
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    content TEXT,
    created DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ---------- PUBLIC SEND PAGE ----------
app.get('/', (req, res) =>
  res.sendFile(__dirname + '/views/send.html')
);

app.post('/send', async (req, res) => {
  const { sender, content, 'g-recaptcha-response': captcha } = req.body;

  if (!sender || !content)
    return res.status(400).send('Missing fields');

  // CAPTCHA verification
  const verify = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}`,
    { method: 'POST' }
  );

  const data = await verify.json();
  if (!data.success)
    return res.status(403).send('Captcha failed');

  db.run(
    'INSERT INTO messages (sender, content) VALUES (?, ?)',
    [sender, content]
  );

  res.send('Message delivered successfully!');
});

// ---------- ADMIN LOGIN ----------
app.get('/admin', (req, res) =>
  res.sendFile(__dirname + '/views/admin-login.html')
);

app.post('/admin', async (req, res) => {
  const { password } = req.body;

  const match = await bcrypt.compare(
    password,
    process.env.ADMIN_PASSWORD_HASH
  );

  if (!match) return res.status(403).send('NOPE');

  req.session.admin = true;
  res.redirect('/inbox');
});

// ---------- ADMIN INBOX ----------
app.get('/inbox', (req, res) => {
  if (!req.session.admin) return res.redirect('/admin');
  res.sendFile(__dirname + '/views/admin-inbox.html');
});
