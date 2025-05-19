const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

const bcrypt = require('bcrypt');


// ====== MIDDLEWARES ======
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'mySuperSecret',
  resave: false,
  saveUninitialized: false
}));


// ====== USER STORE ======
const users = {}; // In-memory for now, use DB or file for persistence

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (users[username]) {
    return res.send('Username already taken. <a href="/register.html">Try another</a>.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users[username] = { password: hashedPassword };

  console.log(`User registered: ${username}`);
  res.redirect('/login.html');
});




// ====== STATIC FILES ======
app.use(express.static(path.join(__dirname, 'public')));

// ====== AUTH ROUTES ======
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

if (users[username] && await bcrypt.compare(password, users[username].password)) {
    req.session.user = username;
    res.redirect('/index.html'); // Go to scheduler page after login
  } else {
    res.send('Login failed. <a href="/login.html">Try again</a>.');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// ====== LOGIN GUARD MIDDLEWARE ======
app.use((req, res, next) => {
  const publicPaths = ['/login.html', '/login', '/logout'];
  if (publicPaths.includes(req.path) || req.path.startsWith('/public') || req.path.endsWith('.css') || req.path.endsWith('.js')) {
    return next();
  }

  if (!req.session.user) {
    return res.redirect('/login.html');
  }

  next();
});


// ====== SCHEDULER API ======
let data = {};

app.post('/submit', (req, res) => {
  const { comment, day, attendance } = req.body;
  const key = String(day);

  if (!data[key]) data[key] = [];
  data[key].push({ comment, attendance });

  console.log(`Saved comment for day ${key}`);
  res.send(`Saved for day ${key}`);
});

app.get('/data', (req, res) => {
  res.json(data);
});

app.post('/clear', (req, res) => {
  for (let day in data) {
    data[day] = [];
  }
  console.log("All comments cleared");
  res.send("All comments cleared");
});

// ====== ROOT ======
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// ====== START ======
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});