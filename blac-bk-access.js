/**
 * Created by donghai4gmail on 2014/11/17.
 */

var ex = require('./blac-bk-util');

var gdbFile = 'exman.db'; // if exist exman.db, means the sql ddl have been execute.
var fs = require('fs');
var gdbLib = require('./blac-bk-sqlite');
var Q = require('q');

var logInfo = ex.info;
var logErr = ex.err;
var funcErr = function(err) { logErr(err) };

var objUser = function() {
  this.NAME = '';
  this.WORD = '';
  this._exState = "new";  // new , clean, dirty.
};
objUser.prototype.new = function(){  return(new objUser()); };
objUser.prototype.save = gdbLib.helpUser.save;
objUser.prototype.delete = gdbLib.helpUser.delete;
objUser.prototype.getByName = gdbLib.helpUser.getByName;

var objColumn = function() {
  this.ID = '';
  this.PARENTID = '';
  this.TITLE = '';
  this.KIND = '';
  this.LINK = '';
  this._exState = 'new';
};
objColumn.prototype.new  = function(){  return(new objColumn()); };
objColumn.prototype.save  = gdbLib.helpColumn.save;
objColumn.prototype.delete = gdbLib.helpColumn.delete;
objColumn.prototype.getByID = gdbLib.helpColumn.getByID;
objColumn.prototype.getChildren = gdbLib.helpColumn.getChildren;

var objArticle = function() {
  this.ID = '';
  this.PARENTID = '';
  this.KIND = '';
  this.TITLE = '';
  this.CONTENT = '';
  this.VIDEOLINK = '';
  this.IMGLINK = '';
  this.RECNAME = '';
  this.RECTIME = '';
  this._exState = 'new';
};
objArticle.prototype.new = function(){  return(new objArticle()); };
objArticle.prototype.save = gdbLib.helpArticle.save;
objArticle.prototype.delete = gdbLib.helpArticle.delete;
objArticle.prototype.getByID = gdbLib.helpArticle.getByID;

exports.USER = new objUser();
exports.COLUMN = new objColumn();
exports.ARTICLE = new objArticle();
exports.setDirty = function(aParm) { aParm._exState = 'dirty' };
exports.setNew = function(aParm) { aParm._exState = 'new' };
exports.setClean = function(aParm) { aParm._exState = 'clean' };
exports.runSql = gdbLib.runSql;
exports.runSqlPromise = gdbLib.runSqlPromise;
exports.getPromise = gdbLib.getPromise;
exports.dbLib = gdbLib;