/**
 * Created by pzheng on 9/02/2017.
 */
'use strict';
var Schema = require('./firebird-model');

var options = {
    host: "derekw7",
    port: 3050,
    user: "aimhd",
    password: "WebUser",
    role: null,
    pagesize: 8192,
    charset: "UTF8",
    database: "hdesk"
};

var Model = Schema.defineModel(options, "users");

//var user = new Model({tableName: "users"});
//var User = Model.extend({tableName: "users"});
//var user = new User();
var user = new Model({id: 37, username: "zz", email: "test@gmail.com"});
//user.find( "field", { fields: ['LASTNAME', 'USERNAME'], where: " id <> 1 "}, function(err, results, fields) {
//   console.log(results);
   //console.log(fields);
//});
//console.log(typeof user);
user.remove(function(err, results, db) {
    console.log(err);
    db.detach();
});
//user.set('provider', 'local');
//user.save();