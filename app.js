var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var servicesRouter = require('./routes/services');
var subServiceRouter = require('./routes/subservices');
var usersRouter = require('./routes/users');
var customerRouter = require('./routes/customer');

var comman = require('./models/Comman');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: 'application/*+json' }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static('app/public'));
app.use('/public', express.static(path.join(__dirname, 'public')));

const userSPUploadProfile = path.join(__dirname, "..", "public/SPProfile/");
const userCUUploadProfile = path.join(__dirname, "..", "public/CUProfile/");
const userSPUploadWork = path.join(__dirname,"..","public/SPWork/");
const userCUReviewWork = path.join(__dirname,"..","public/CUReview/");

app.use('/SPProfile', express.static(path.join(userSPUploadProfile, 'SPProfile')));
app.use('/CUProfile', express.static(path.join(userCUUploadProfile, 'CUProfile')));
app.use('/SPWork', express.static(path.join(userSPUploadWork, 'SPWork')));
app.use('/CUReview', express.static(path.join(userCUReviewWork, 'CUReview')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/customer', customerRouter);
app.use('/services', servicesRouter);
app.use('/subservices', subServiceRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var minutes = 1, the_interval = minutes * 60 * 1000;
setInterval(function() {
  console.log("====="+new Date(new Date()).toUTCString());
  console.log("I am doing my 5 minutes check");
comman.autoTimerService();
  // do your stuff here
}, the_interval);

module.exports = app;
