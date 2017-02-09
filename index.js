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

var Model = Schema.createConnection(options);


//var user = new Model({tableName: "users"});
var user = new Model();
user.query("select * from users", function(err, results, fields) {
    console.log(results);
});
//console.log(typeof user);