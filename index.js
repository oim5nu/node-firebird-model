/**
 * Created by pzheng on 9/02/2017.
 */
'use strict';
var Schema = require('./firebird-model');

var options = {
    host: "localhost",
    port: 3050,
    user: "aimhd",
    password: "WebUser",
    role: null,
    pagesize: 8192,
    charset: "UTF8",
    database: "helpdesk"
};

var Model = Schema.createConnection(options);


//var user = new Model({tableName: "users"});
var user = new Model({tableName: "users"});
user.find( "first", { where: " id = 36 "}, function(err, results, fields) {
   console.log(results);
   //console.log(fields);
});
//console.log(typeof user);