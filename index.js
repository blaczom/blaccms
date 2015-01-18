/**
 * Created by Administrator on 2014/11/4.
 */

var express = require('express');
var path = require('path');
var app = express();
app.set('port', 80);

var ls_www = process.cwd();
console.log(ls_www);
app.use(express.static(ls_www + "/public" ));

var rest = require('./routes/rest');
app.use('/rest', rest);

var server = app.listen(app.get('port'), function() {
  console.log( server.address());
  console.log(ls_www );
});