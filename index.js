const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const router = require('./app/Route.js');


app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 'Authorization', 'custId', 'appId',
    'Origin', 'Cookie', 'X-CSRF-TOKEN', 'Accept', 'X-XSRF-TOKEN', 'X-Requested-With'
  ],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers',
    'custId, appId, Origin, Content-Type, Cookie, X-CSRF-TOKEN, Accept, Authorization, X-XSRF-TOKEN, Access-Control-Allow-Origin, X-Requested-With'
  );
  res.header('Access-Control-Expose-Headers', 'Authorization, authenticated');
  res.header('Access-Control-Max-Age', '1728000');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

app.use('/api', router);

app.use((req, res) => {
  res.status(404).json({ status: false, message: 'Endpoint tidak ditemukan' });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
