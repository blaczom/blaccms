/**
 * Created by donghai4gmail on 2014/9/20.
 */

var sqlite3 = require('sqlite3');
var ex = require('./blac-bk-util.js');
var fs = require('fs');
var Q = require('q');
var gdbFile = 'blaccms.db'; // if exist exman.db, means the sql ddl have been execute.

var logInfo = ex.info;
var logErr = ex.err;

var createDB = function(adbFile){
  if (!adbFile) adbFile = gdbFile;
  if (!fs.existsSync(adbFile)){
    logInfo("---no databse file. will create it:---", gdbFile);
    var l_run = [];
    l_run.push( "CREATE TABLE if not exists USER(NAME NVARCHAR2(32) NOT NULL PRIMARY KEY,WORD CHAR(32) NOT NULL) WITHOUT ROWID;"   );

    l_run.push("CREATE TABLE if not exists COLUMN(ID CHAR(32) NOT NULL PRIMARY KEY, PARENTID CHAR(32),   " +
      " TITLE NVARCHAR2(200), KIND NVARCHAR2(100), LINK NVARCHAR2(200) ) WITHOUT ROWID;");

    l_run.push("CREATE TABLE if not exists ARTICLE(ID CHAR(32) NOT NULL PRIMARY KEY, PARENTID CHAR(32) NOT NULL,KIND NVARCHAR2(100)," +
      "TITLE NVARCHAR2(200),CONTENT NVARCHAR2(10000),VIDEOLINK NVARCHAR2(1000),IMGLINK NVARCHAR2(1000),RECNAME NVARCHAR2(20),RECTIME VARCHAR(20) ) WITHOUT ROWID;");
    l_run.push("CREATE INDEX if not exists [idx_article_id] ON [ARTICLE] ([ID] DESC);");
    l_run.push("CREATE INDEX if not exists [idx_article_parentid] ON [ARTICLE] ([PARENTID] DESC);");

    l_run.push("INSERT INTO USER VALUES('admin', '21232f297a57a5a743894a0e4a801fc3'); ");

    var ldb = new sqlite3.Database(adbFile);
    ldb.serialize( function() {
      for (var i in l_run) {
        ldb.run(l_run[i], function (err, row) {
          if (err) logErr(" 初始化创建数据库错误: ",err.message,l_run[i]);
        });
      }
    });
    ldb.close();
  }
  else console.log(gdbFile, '已经存在。没有操作。');
};

var gdb = new sqlite3.Database(gdbFile);

var genSave = function (aObj, aTable) {    //  _exState用来指示处理。 列名必须大写。第一字母小写的不生成。 返回sql和 执行参数。
  if (!aObj._exState) {
    logInfo("dbsqlite3 genSave get a wrong db object." + aObj);
    return [null, null];
  }
  var l_cols = [], l_vals = [], l_quest4vals=[],  l_pristine = [];
  for (var i in aObj) {    // 列名， i， 值 aObj[i]. 全部转化为string。
    var l_first = i[0];
    if (l_first != '_' && l_first!='$' && l_first == l_first.toUpperCase() ) { // 第一个字母_并且是大写。
      var lsTmp = (aObj[i]==null) ? "" : aObj[i];
      switch (typeof(lsTmp)) {
        case "string": case "boolean":case "object":
        l_cols.push(i);
        l_vals.push("'" + lsTmp + "'");
        l_quest4vals.push("?");
        l_pristine.push(lsTmp);
        break;
        case "number":
          l_cols.push(i);
          l_vals.push(lsTmp);
          l_quest4vals.push('?');
          l_pristine.push(lsTmp);
          break;
        case "function":
          break;
        default:
          logInfo("-- genSave don't now what it is-" + i + ":" + aObj[i] + ":" + typeof(lsTmp));
          process.exit(-100);
          l_cols.push(i);
          l_vals.push(aObj[i].toString());
          l_quest4vals.push('?');
          l_pristine.push(lsTmp);
          break;
      }
    }
  }
  var l_sql="";
  switch (aObj._exState) {
    case "new": // "INSERT INTO foo() VALUES (?)", [1,2,3]
      ls_sql = "insert into " + aTable + '(' + l_cols.join(',') + ") values ( " + l_quest4vals.join(',') + ')';
      break;
    case "dirty": // update table set col1=val, col2="", where uuid = "";
      var lt = [];
      for (i = 0 ; i < l_cols.length; i ++) lt.push(l_cols[i] + "=" + l_quest4vals[i] );
      if ('USER,'.indexOf(aTable.toUpperCase()) >= 0 )
        ls_sql = "update " + aTable + ' set ' + lt.join(',') + " where NICKNAME = '" + aObj['NICKNAME'] +"'";
      else
        ls_sql = "update " + aTable + ' set ' + lt.join(',') + " where uuid = '" + aObj['UUID'] +"'";
      break;
    default : // do nothing.
      ls_sql = "";
      logErr('i dont know why you call me with this ---,aObj');
  }
  return [ls_sql, l_pristine];   // 返回一个数组。前面是语句，后面是参数。f
};
var runSql = function (aSql, aParam,  aCallback){
  logInfo("db runSql with param ", aSql, aParam);
  if (aSql.trim().length > 4)  {
    if (aParam) {if (toString.apply(aParam) !== "[object Array]") aParam = [aParam];} else aParam = [];
    gdb.all(aSql, aParam, function (err, row){
      if (err) logErr("runSql",err,aSql,aParam);
      if (aCallback) aCallback(err, row);
    } );
  }
  else
    if (aCallback) aCallback("no sql", aParam);
};
var runSqlPromise = function (aSql, aParam) {
  logInfo("db runSqlPromise with param ", aSql, aParam);
  if (aParam) {if (toString.apply(aParam) !== "[object Array]") aParam = [aParam];} else aParam = [];
  var deferred = Q.defer();
  if (aSql.trim().length > 4)  {
    gdb.all(aSql, aParam, function (err, row) {
      if (err) {if (err) logErr("runSqlPromise",err,aSql,aParam);deferred.reject(err);} else deferred.resolve(row);
    });
  }
  else deferred.reject("no sql statement ");
  return deferred.promise;
};
var getPromise = function (aSql, aParam) {
  logInfo("db getPromise with param ", aSql, aParam);
  if (aParam) {if (toString.apply(aParam) !== "[object Array]") aParam = [aParam];} else aParam = [];
  var deferred = Q.defer();
  if (aSql.trim().length > 4)  {
    gdb.get(aSql, aParam, function (err, row) {
      if (err) {if (err) logErr("getPromise",err,aSql,aParam);deferred.reject(err);} else deferred.resolve(row);
    });
  }
  else deferred.reject("no sql statement ");
  return deferred.promise;
};
var comSave = function(aTarget, aTable, aCallback) {
  try {
    l_gen = genSave(aTarget, aTable);  // 返回一个数组，sql和后续参数。
    logInfo("com save run here with param: ", aTarget, aTable, l_gen);
    gdb.run(l_gen[0], l_gen[1], function (err, row) {
      row = this.changes;  // 影响的行。
      aCallback(err, row);
    });
  }
  catch (err) {
    logErr('comSave catch a error: ',err);
    if (aCallback) aCallback(err, err);
  }
};

var helpUser = {
  save:function (aUser, aCallback){ comSave(aUser, 'USER', aCallback); },
  delete : function(aNickName, aCallback){
    runSql("delete from USER where NAME = ?", aNickName, aCallback); } ,
  getByName:function(aNickName, aCallback) {
    gdb.get("select * from user where NAME= ?" , aNickName, aCallback);
  }
};
var helpColumn = {
  save: function (aColumn, aCallback) {    comSave(aColumn, 'COLUMN', aCallback);  },
  delete: function (aID, aCallBack) {
    runSql("delete from TASK where ID = ?", aID, aCallBack);  },
  getByID : function (aID, aCallback) { gdb.get("select * from COLUMN where ID=?", aID, aCallback); },
  getChildren: function (rootTask, aCallback) {
    var statckCallback = [];
    function nextTask(aParent, aRow, aI, aCallFin)  // aRow, 是一个数组。aI作为索引。 alen作为结束判断。
    {
      if (aI < aRow.length) {
        aRow[aI].subTask = [];
        aParent.push(aRow[aI]);
        runSql("SELECT * FROM COLUMN where PARENTID='" + aRow[aI].ID + "'", function (err, row) {
          if (row.length > 0) {
            statckCallback.push({a: aParent, b: aRow, c: (aI + 1), d: aCallback });
            nextTask(aRow[aI].subTask, row, 0, aCallback);
          }
          else nextTask(aParent, aRow, ++aI, aCallback);//  console.log('没孩子的对象：');
        })
      }
      else {
        if (rootTask.subTask === aParent) {
          aCallFin(null, rootTask);  // 循环到最上层，就可以直接返回。
        }
        else {
          // 调用上层的next来继续。next(aParent, aRow, ++aI, aCallback);
          var tmp = statckCallback.pop(); // ({a:aParent, b:aRow, c:++aI, d:aCallback });
          nextTask(tmp.a, tmp.b, tmp.c, tmp.d);
        }
      }
    };
    runSql("SELECT * FROM COLUMN where PARENTID=?", rootTask.ID, function (err, row) {
      rootTask.subTask = [];
      if (row.length > 0) nextTask(rootTask.subTask, row, 0, aCallback); // 就调用一次over。
      else aCallback(null, rootTask);
    });

  }

};
var helpArticle = {
  save : function (aArticle, aCallback) {  comSave(aArticle, 'ARTICLE', aCallback); },
  getByID : function (aID, aCallback) { gdb.get("select * from ARTICLE where ID=?", aID, aCallback); },
  delete : function(aID, aCallback){ runSql("delete from ARTICLE where ID = ?", aID, aCallback); }
};

exports.helpUser = helpUser;
exports.helpColumn = helpColumn;
exports.helpArticle = helpArticle;
exports.runSql = runSql;
exports.getPromise = getPromise;
exports.runSqlPromise = runSqlPromise;
exports.genSave = genSave;
exports.gdb = gdb;
exports.createDB = createDB;

/*
test:
 sqlite = require('./blac-bk-sqlite.js');
 sqlite.getPromise('select * from user').then(function(data){console.log(data)});
 */