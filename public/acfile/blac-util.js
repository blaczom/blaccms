/**
 * Created by Administrator on 2015/1/18.
 */
angular.module('blac-util', ['angular-md5'])
  .factory('blacUtil', function(md5){
    var UUID = function(){};
    UUID.prototype.createUUID = function(){
      var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
      var dc = new Date();
      var t = dc.getTime() - dg.getTime();
      var tl = UUID.prototype.getIntegerBits(t,0,31);
      var tm = UUID.prototype.getIntegerBits(t,32,47);
      var thv = UUID.prototype.getIntegerBits(t,48,59) + '1'; // version 1, security version is 2
      var csar = UUID.prototype.getIntegerBits(UUID.prototype.rand(4095),0,7);
      var csl = UUID.prototype.getIntegerBits(UUID.prototype.rand(4095),0,7);
      var n = UUID.prototype.getIntegerBits(UUID.prototype.rand(8191),0,7) +
        UUID.prototype.getIntegerBits(UUID.prototype.rand(8191),8,15) +
        UUID.prototype.getIntegerBits(UUID.prototype.rand(8191),8,15) +
        UUID.prototype.getIntegerBits(UUID.prototype.rand(8191),0,15); // this last number is two octets long
      //return tl + '-' + tm  + '-' + thv  + '-' + csar + '-' + csl + n;
      return tl + tm  + thv  + csar + csl + n;  // 32位。去掉-
    };
    UUID.prototype.getIntegerBits = function(val,start,end){
      var base16 = UUID.prototype.returnBase(val,16);
      var quadArray = new Array();
      var quadString = '';
      var i = 0;
      for(i=0;i<base16.length;i++){
        quadArray.push(base16.substring(i,i+1));
      }
      for(i=Math.floor(start/4);i<=Math.floor(end/4);i++){
        if(!quadArray[i] || quadArray[i] == '') quadString += '0';
        else quadString += quadArray[i];
      }
      return quadString;
    };
    UUID.prototype.returnBase = function(number, base){
      return (number).toString(base).toUpperCase();
    };
    UUID.prototype.rand = function(max){
      return Math.floor(Math.random() * (max + 1));
    };
    var getDateTime = function(aTime, aOnlyDate){
      // 向后一天，用 new Date( new Date() - 0 + 1*86400000)
      // 向后一小时，用 new Date( new Date() - 0 + 1*3600000)
      if (!aTime) aTime = new Date();
      var l_date = new Array(aTime.getFullYear(),aTime.getMonth()<9?'0'+(aTime.getMonth()+1):(aTime.getMonth()+1),aTime.getDate()<10?'0'+aTime.getDate():aTime.getDate());
      if (aOnlyDate)
        return( l_date.join('-')) ; // '2014-01-02'
      else {
        var l_time = new Array(aTime.getHours() < 10 ? '0' + aTime.getHours() : aTime.getHours(), aTime.getMinutes() < 10 ? '0' + aTime.getMinutes() : aTime.getMinutes(), aTime.getSeconds() < 10 ? '0' + aTime.getSeconds() : aTime.getSeconds());
        return( l_date.join('-') + ' ' + l_time.join(':')); // '2014-01-02 09:33:33'
      }
    };

    return {
      createUUID : UUID.prototype.createUUID,
      getDateTime : getDateTime,    // 向后一天，用 new Date( new Date() - 0 + 1*86400000)  1小时3600000
      getDate : function(arg1){ return getDateTime(arg1,true) },
      verifyBool : function (aParam){ return (aParam==true||aParam=="true"||aParam=="True")?true:false;  } ,
      md5String: md5.createHash,
      shareCache: { global:{} }
    }
  })
  .factory('blacStore', function(){
    var _debug = true;
    if(window.localStorage) console.log("check success -- > localStorage support!");
    else window.alert('This browser does NOT support localStorage. pls choose allow localstorage');
    var l_store = window.localStorage;
    var _storeUser = 'blacStoreLocalAdminUser',
        _storeWord = 'blacStoreLocalAdminWord',
        _storeRememberMe = 'blacStoreLocalAdminRem',
        _storeErr = 'blacStoreLocalErr';
    var verifyBool = function (aParam){ return (aParam==true||aParam=="true"||aParam=="True")?true:false;  };
    // typeof 返回的是字符串，有六种可能："number"、"string"、"boolean"、"object"、"function"、"undefined"

    return{
      localRem: function(aArg){
        if (aArg===undefined) return(verifyBool(l_store.getItem(_storeRememberMe)||"false")); else return(l_store.setItem(_storeRememberMe, aArg));
      },
      localUser : function(aArg){
        if (aArg===undefined) return(l_store.getItem(_storeUser)||""); else return(l_store.setItem(_storeUser, aArg));
      },
      localWord: function(aArg) {  // 设置当前用户，名称，密码和保存密码。
        if (aArg===undefined) return(l_store.getItem(_storeWord)||""); else return(l_store.setItem(_storeWord, aArg));
      },
      getErr: function(){ return(l_store.getItem(_storeErr)); },
      setErr: function(){ if (_debug) console.log(arguments);
        if (arguments.length > 0) l_store.setItem(_storeErr, JSON.stringify(arguments)); else l_store.setItem('blacStoreLocalErr', '');
      },
      appendErr: function(aArg){ if (_debug) console.log(arguments);
        if (arguments.length > 0) l_store.setItem(_storeErr, l_store.getItem(_storeErr) + JSON.stringify(arguments));
      },
      customGet:function(aKey){ return( JSON.parse( l_store.getItem(aKey)||'{}' ) ); },
      customSet:function(aKey, aObj) { return(l_store.setItem(aKey, JSON.stringify(aObj))) ;  }
    };
  })
  .factory('blacAccess', function($location,$http,$q,md5){
    var httpQ = function(aUrl, aObject){
      var deferred = $q.defer();
      $http.post(aUrl, aObject)
        .success(function (data, status, headers, config) {
          deferred.resolve(data || []);
        })
        .error(function (data, status, headers, config) {
          deferred.reject(status);
        });
      return deferred.promise;
    };
    var userLogin = function(aUser, aWord) {
      var lUser = { uuu: aUser, www: aWord };
      lUser.md5 = md5.createHash( aUser + aWord ); // 防止网络传输明码。
      // { uuu: aUser, www: aWord, md5:xxx };
      return httpQ('/rest',  { func: 'userlogin',  ex_parm: { user: lUser } });
    };
  })
;