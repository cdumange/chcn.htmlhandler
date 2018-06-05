const http = require('http');
const MSG_ERREUR = "Erreur Interne";


function debug(text){
  if(process.env.debug)
    console.log(text);
}

function HTMLHandler(server, port){

  this.server = null;
  this.port = null;
  this.aut = null;
  this.suffix = null;
}

HTMLHandler.prototype.init = function (server, port){

  if (typeof server == 'object'){
    if (!(typeof server.address ==="undefined"))
      this.server = server.address;

      if (!(typeof server.server ==="undefined"))
        this.server = server.server;

    if (!(typeof server.port=== "undefined"))
      this.port = server.port;

    if (!(typeof server.suffix === "undefined"))
      this.suffix = server.suffix;
  }
  else{
    this.server = server;

    if (!(typeof port=== "undefined"))
      this.port = port;
  }
}

HTMLHandler.prototype.getURL = function(url){
  const surl =  ((url.indexOf('http') >= 0 || this.server.indexOf('http')) >=0 ? ""  : 'http://')
    + this.server +
    ((this.port == undefined) ? "" : (":"+ this.port)) +
    ((this.suffix == undefined) ? "" : ("/"+ this.suffix))
    + url;

    debug('url : ' + surl);

    return surl;
}

const manageReturnCode = async function (res, val, url) {
  return new Promise((resolve, reject) => {
    if (res.statusCode == undefined)
      reject(new Error('wrong res parameter'));

    if (res.statusCode == 200
      || (res.statusCode == 404 && val == MSG_ERREUR)){
        return resolve({
          body : val,
          code : res.statusCode,
          url : url
        });
      }

    return reject({
      err : new Error('Erreur éxécution requête ' + url + ' statusCode :' + res.statusCode),
      code : res.statusCode
    });
  })
}

HTMLHandler.prototype.GET = function (url, next){
  return new Promise((resolve, reject) => {
    let surl = this.getURL(url);
    let retour = '';

    let options = {
      host: this.server,
      method : "GET",
      path : surl,
      headers : {
        "content-type" : "application/json"
      }
    };

    if(this.port)
      options.port = this.port;

    if (this.aut)
      options.headers.Authorization = this.aut;

    debug(options);

    let hreq = http.request(options, function(res){
      res.setEncoding('utf8');
      res.on('data', function (chunk){
        retour += chunk;
      });

      res.on('end', function(){
        if (next != undefined) next(manageReturnCode(res, retour, surl));
        else return resolve(manageReturnCode(res, retour, surl));
      });

    }).on('error', function (e){
      hreq.end();
      reject(e);
    });
    hreq.end();
  });
}


HTMLHandler.prototype.POST = function (url, sbody, next){
  return new Promise((resolve, reject) => {
    //On transforme en string si autre type
    if (typeof sbody != "string"){
      sbody = JSON.stringify(sbody);
    }
    let surl = this.getURL(url);

    let retour = '';
    let options = {
      host: this.server,
      method : "POST",
      path : surl,
      headers : {
        "content-type" : "application/json"
      }
    };

    if(this.port)
      options.port = this.port;

    if (this.aut)
      options.headers.Authorization = this.aut;

    debug(options);

    let hreq = http.request(options,function(res){
      res.setEncoding('utf8');
      res.on('data', function (chunk){
        retour += chunk;
      });

      res.on('end', function(){
        let ret = manageReturnCode(res, retour, surl);
        if (next != undefined) next(ret);
        else return resolve(ret);
      });
    });

    hreq.on('error', function(err){
      hreq.end();
      return reject('Erreur POST ' + err.message);
    });

    hreq.write(sbody);
    hreq.end();
  })

}

HTMLHandler.prototype.PUT = function (url, sbody, next){
  return new Promise((resolve, reject) => {

    //On transforme en string si autre type
    if (typeof sbody != "string"){
      sbody = JSON.stringify(sbody);
    }

    let surl = this.getURL(url);

    let retour = '';
    let options = {
      host : this.server,
      path : surl,
      method : "PUT",
      headers : {
        "content-type" : "application/json"
      }
    };

    if(this.port)
      options.port = this.port;

    if (this.aut)
        options.headers.Authorization = this.aut;

    debug(options);

    let hreq = http.request(options, function(res){
      res.setEncoding('utf8');
      res.on('data', function (chunk){
        retour += chunk;
      });

      res.on('end', function(){
        let ret = manageReturnCode(res, retour, surl);
        if (next != undefined) next(ret);
        else return resolve(ret);
      });
    });

    hreq.on('error', function(err){
      hreq.end();
      return reject('Erreur PUT ' + err.message);
    });
    hreq.write(sbody);
    hreq.end();
  });
}

HTMLHandler.prototype.DELETE = function (url, next){
  return new Promise((resolve, reject) => {
    let surl = this.getURL(url);
    let retour = '';
    let options = {
      host : this.server,
      method : "DELETE",
      path : surl
    };

    if(this.port)
      options.port = this.port;

    if (this.aut)
      options.headers.Authorization = this.aut;

    debug(options);

    let hReq = http.request(options, function(res){
      res.setEncoding('utf8');
      res.on('data', function (chunk){
        retour += chunk;
      })

      res.on('end', function(){
        let ret = manageReturnCode(res, retour, surl);
        if (next != undefined) next(ret);
        else return resolve(ret);
      });
    }).on('error', function(err){
      hReq.end();
      reject('Erreur DELETE ' + err.message);
    });
    hReq.end();
  })

}

module.exports = HTMLHandler;
