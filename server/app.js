const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const promptsRoute = require('./routes/Prompts');
const imagesRoute = require('./routes/images');

const app = express();

// Middleware
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP for development
app.use(compression());
app.use(express.json());

// Static files - make uploads accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/prompts', promptsRoute);
app.use('/api/images', imagesRoute);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

module.exports = app;
