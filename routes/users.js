var express = require('express');
var router = express.Router();

/* GET users listing. */

// "dbUrl": "mongodb://root:kaikili123@47.222.45.28:27017/KaikiliDB",

router.get('/user', function(req, res, next) {
  res.send('respond with a resource');
  console.log("Test Ketan")
});

module.exports = router;
