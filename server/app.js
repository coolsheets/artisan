const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const promptsRoute = require('./routes/Prompts');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/prompts', promptsRoute);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

module.exports = app;
