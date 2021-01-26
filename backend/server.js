const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const config = require('config');

const PORT = process.env.PORT || 4000;

const app = express();
// routes
const testAPIRouter = require('./routes/api/testAPI');
const CoreRouter = require('./routes/api/core');
const JobRouter = require('./routes/api/job');
const UserRouter = require('./routes/api/user');
const ApplicaitonRouter = require('./routes/api/application');
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connection to MongoDB
mongoose
  .connect(config.get('mongoURI'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => console.log(err));

// setup API endpoints
app.use('/api/testAPI', testAPIRouter);
app.use('/api/core', CoreRouter);
app.use('/api/job', JobRouter);
app.use('/api/user', UserRouter);
app.use('/api/application', ApplicaitonRouter);

app.listen(PORT, () => console.log(`Server is running on Port: ${PORT}`));
