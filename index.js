/**
 * Created by Administrator on 2014/11/4.
 */

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();
app.set('port', 80);

app.use(session({ secret:'HapyFever', resave:true, saveUninitialized:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var ls_www = process.cwd();
app.use(express.static(ls_www + "/public" ));

var rest = require('./routes/rest');
app.use('/rest', rest);

var server = app.listen(app.get('port'), function() {
  console.log( server.address());
  console.log(ls_www );
});