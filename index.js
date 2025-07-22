const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const path = require('path')
const app = express();

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const router = require('./app/Route.js')
app.use(bodyParser.json());   
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.json())
// app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'assets')))

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Methods',
    'POST, GET, OPTIONS, PUT, DELETE, HEAD',
  )
  res.header(
    'Access-Control-Allow-Headers',
    'custId, appId, Origin, Content-Type, Cookie, X-CSRF-TOKEN, Accept, Authorization, X-XSRF-TOKEN, Access-Control-Allow-Origin, X-Requested-With',
  )
  res.header('Access-Control-Expose-Headers', 'Authorization, authenticated')
  res.header('Access-Control-Max-Age', '1728000')
  res.header('Access-Control-Allow-Credentials', 'true')
  next()
})  

app.use('/api', router)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
