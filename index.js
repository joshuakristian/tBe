const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const path = require('path')
const app = express();


const router = require('./app/Route.js') 

let config
try {
  config = require('./config.js')
} catch (e) {
  console.log('No config file found')
  process.exit(0)
}

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json() );   
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'assets')))
app.use('/api', router)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
