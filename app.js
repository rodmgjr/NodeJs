const express = require('express');
const dotenv = require('dotenv');
const connect = require('./db');
const memberRouter = require('./routers/memberRouter.js');
const attendanceRouter = require('./routers/attendanceRouter.js');
const eventRouter = require('./routers/eventRouter.js');
const FileLogger = require('./fileLogger');

const app = express();

dotenv.config({ path: './config/config.env' });

connect();

const port = process.env.port || 3000;

const fileLogger = new FileLogger();

const date = new Date;

fileLogger.on('eventLog', fileLogger.eventLog);

app.use(express.json());

const log = async (req, res, next) => {
  const message = `${date.toLocaleDateString()}-${date.toLocaleTimeString()} : ${req.method} ${req.url}\n${Object.keys(req.body).length === 0 ? '' : JSON.stringify(req.body) + '\n'}\n`;

  fileLogger.emit('eventLog', message);
  next(); 
};

app.use(log);

app.use('/members', memberRouter);
app.use('/attendance', attendanceRouter);
app.use('/events', eventRouter);

// ERROR HANDLING
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.send({
    errorMessage: err.message,
    errorStack: err.stack
  });
});

app.listen(port, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port: ${port}`);
});