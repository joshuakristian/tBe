const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const path = require('path')
const app = express();

// Konfigurasi CORS untuk development
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(express.json())
app.use(cors())
const router = require('./app/Route.js')
app.use(bodyParser.json() );   
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'assets')))
app.use('/api', router)



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
