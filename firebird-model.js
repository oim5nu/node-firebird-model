/**
 * Created by pzheng on 9/02/2017.
 */
'use strict';
var _ = require('underscore')._;
var Backbone = require('backbone');
var Firebird = require('node-firebird');


var createConnection = function(options) {
    var sql, check, id, tableName, database;
    var SQLModel = Backbone.Model.extend({
        constructor: function() {
            console.log("constructor called");
            Firebird.attach(options, function(err, db) {
                if (err) {
                    console.log(err.message);
                    throw new Error(err.message);
                } else {
                    //db.query("select * from users", function(err, results, fields) {
                    //    console.log("Database Query Result: 'User'", results);
                    database = db;

                    //db.detach();
                    //});
                }
            });
        },

        initialize: function() {
            console.log("Initialise called" );
        },

        setSQL: function(sql) {
            for(var key in sql) {
                if( typeof sql.key !== "function" ) {
                    this.set(key, sql.key);
                }
            }
        },
        // Function for creating custom queries
        query: function(sql, callback) {
            database.query(sql, function(err, results, fields) {
                if (callback) {
                    callback(err, results, fields);
                }
            });
        }/*,
        // Function returning one set of results and setting it to model it was used on
        read: function(id, callback) {
            var root = this;
            if( this.tableName ) {
                tableName = this.tableName;
            } else {
                tableName = this.attributes.tableName;
            }
            if(!id) {
                id = this.attributes.id;
            } else if( typeof id === "function") {
                callback = id;
                id = this.attributes.id;
            }
            var sql = " select * from " + tableName + " where id=" + id;

            Firebird.attach(options,
                function(err, db) {
                    if (err) {
                        //console.log(err.message);
                        throw new Error(err.message);
                    } else {
                        db.query(sql,
                            function (err, results, fields) {
                                //console.log("database.query result 'staff'", results);
                                //helpers.wrapJson(results, fields, jsondata);
                                root.setSQL(results[0]);
                                if( callback ) {
                                    callback(err, results, fields );
                                }
                                db.detach();
                            }
                        );
                    }
                }
            );
        },

        // Function with set of methods to return records from database
        find: function(method, conditions, callback) {
            if( typeof method === "function" ) {
                callback = method;
                method = 'all';
                conditions = {};
            } else if( typeof conditions === "function") {
                callback = conditions;
                conditions = {};
            }
            if( this.tableName ) {
                tableName = this.tableName;
            } else {
                tableName = this.attributes.tableName;
            }
            // Building query conditions
            var qcond = "";
            var fields = "*";
            if( conditions.fields ) {
                fields = conditions.fields;
            }
            if( conditions.where ) {
                qcond+=" where " + conditions.where;
            }
            if( conditions.group) {
                qcond += " group by " + conditions.group;
                if( conditions.groupDESC ) {
                    qcond += " DESC";
                }
            }
            if( conditions.having ) {
                qcond +=" having " + conditions.having;
            }
            if( conditions.order ) {
                qcond += " order by " + conditions.order;
                if( conditions.orderDESC ) {
                    qcond += " DESC";
                }
            }
            if( conditions.limit ) {
                qcond += " LIMIT " + conditions.limit;
            }

            switch(method) {
                //default method
                case "all":
                    sql = "select " + fields + " from " + tableName + qcond;
                    Firebird.attach(options,
                        function(err, db) {
                            if (err) {
                                console.log(err.message);
                                throw new Error(err.message);
                            } else {
                                db.query(sql,
                                    function (err, results, fields) {
                                        //console.log("database.query result 'staff'", results);
                                        //helpers.wrapJson(results, fields, jsondata);
                                        if( callback ) {
                                            callback(err, results, fields );
                                        }
                                        db.detach();
                                    }
                                );
                            }
                        }
                    );
                    break;
                case "count":
                    sql = "select count(*) as count_field from " + tableName + qcond;
                    Firebird.attach(options,
                        function(err, db) {
                            if (err) {
                                console.log(err.message);
                                throw new Error(err.message);
                            } else {
                                db.query(sql,
                                    function (err, results, fields) {
                                        //console.log("database.query result 'staff'", results);
                                        //helpers.wrapJson(results, fields, jsondata);
                                        if( callback ) {
                                            callback(err, results[0].count_field, fields );
                                        }
                                        db.detach();
                                    }
                                );
                            }
                        }
                    );
                    break;
                case "first":
                    sql = "select first(1) " + fields +" from " + tableName + qcond;
                    Firebird.attach(options,
                        function(err, db) {
                            if (err) {
                                console.log(err.message);
                                throw new Error(err.message);
                            } else {
                                db.query(sql,
                                    function (err, results, fields) {
                                        //console.log("database.query result 'staff'", results);
                                        //helpers.wrapJson(results, fields, jsondata);
                                        if( callback ) {
                                            callback(err, results[0], fields );
                                        }
                                        db.detach();
                                    }
                                );
                            }
                        }
                    );
                    break;
                case "field":
                    sql = "select " + fields +" from " + tableName + qcond;
                    Firebird.attach(options,
                        function(err, db) {
                            if (err) {
                                console.log(err.message);
                                throw new Error(err.message);
                            } else {
                                db.query(sql,
                                    function (err, results, fields) {
                                        //console.log("database.query result 'staff'", results);
                                        //helpers.wrapJson(results, fields, jsondata);
                                        var key;
                                        for ( key in results[0]) {
                                            break;
                                        }

                                        if( callback ) {
                                            callback(err, results[0].[key], fields );
                                        }
                                        db.detach();
                                    }
                                );
                            }
                        }
                    );
                    break;
            }
        },
        // Function saving your model attributes
        save: function(where, callback) {
            var tableName;
            if( typeof where === "function" ) {
                callback = where;
                where = null;
            }

            if( this.tableName ) {
                tableName = this.tableName;
            } else {
                tableName = this.tableName;
            }
            if( where ) {
                var id = null;
                if( this.has('id')) {
                    id = this.get('id');
                    delete this.attributes.id;
                }
                var sql = " update " + tableName + " set " + this.attributes + " where " + where;
                if( id ) {
                    this.set('id', id);
                }
                var check = " select first(1) * from " + tableName + " where " + where;
                Firebird.attach(options,
                    function(err, db) {
                        if (err) {
                            console.log(err.message);
                            throw new Error(err.message);
                        } else {
                            db.query(check,
                                function (err, results, fields) {
                                    if( results[0] ) {
                                        db.query(sql, function(err, result) {
                                            if(callback) {
                                                callback(err, result, db);
                                            }
                                        });
                                    } else {
                                        err = "ERROR: Record not found";
                                        callback(err, results, db);
                                    }

                                    db.detach();
                                }
                            );
                        }
                    }
                );
            } else {
                if( this.has('id') ) {
                    id = this.get('id');
                    delete this.attributes.id;
                    sql = "update " + tableName + " set " + this.attributes + " where id= " + id;
                    this.set('id', id);
                    check = " select first(1) * from " + tableName + " where id=" + id;
                    Firebird.attach(options,
                        function(err, db) {
                            if (err) {
                                console.log(err.message);
                                throw new Error(err.message);
                            } else {
                                db.query(check,
                                    function (err, results, fields) {
                                        if( results[0] ) {
                                            db.query(sql, function(err, result) {
                                                if(callback) {
                                                    callback(err, result, db);
                                                }
                                            });
                                        } else {
                                            err = "ERROR: Record not found";
                                            callback(err, results, db);
                                        }
                                        db.detach();
                                    }
                                );
                            }
                        }
                    );
                } else {
                    //Create new record
                    var q = "insert into " + tableName + " set " + this.attributes;
                    Firebird.attach(options,
                        function(err, db) {
                            if (err) {
                                console.log(err.message);
                                throw new Error(err.message);
                            } else {
                                db.query(sql,
                                    function (err, results, fields) {
                                        //console.log("database.query result 'staff'", results);
                                        //helpers.wrapJson(results, fields, jsondata);
                                        if( callback ) {
                                            callback(err, results[0], fields );
                                        }
                                        db.detach();
                                    }
                                );
                            }
                        }
                    );
                }
            }

        },
        //Function for removing records
        remove: function(where, callback) {
            if( typeof where === "function" ) {
                callback = where;
                where = null;
            }
            if( this.tableName ) {
                tableName = this.tableName;
            } else {
                tableName = this.attributes.tableName;
            }
            if(where) {
                var q = "delete from " + tableName + " where " + where;
                var check = " select * from " + tableName + " where " + where;
                Firebird.attach(options,
                    function(err, db) {
                        if (err) {
                            console.log(err.message);
                            throw new Error(err.message);
                        } else {
                            db.query(check,
                                function (err, results, fields) {
                                    //console.log("database.query result 'staff'", results);
                                    //helpers.wrapJson(results, fields, jsondata);
                                    if( results[0]) {
                                        db.query(q, function(err, result) {
                                            if(callback) {
                                                callback(err, result, db);
                                            }
                                        });
                                    } else {
                                        err = "ERROR: Record not found";
                                        callback(err, result, db);
                                    }
                                    db.detach();
                                }
                            );
                        }
                    }
                );
            } else {
                if(this.has('id')) {
                    var q = "DELETE FROM "+tableName+" WHERE id="+this.attributes.id;
                    var check = "SELECT * FROM "+tableName+" WHERE id="+this.attributes.id;
                    this.clear();
                    Firebird.attach(options, function(err, db) {
                        db.query(check, function (err, results, fields) {
                            if (results[0]) {
                                db.query(q, function (err, result) {
                                    if (callback) {
                                        callback(err, result, db);
                                    }
                                });
                            } else {
                                err = "ERROR: Record not found";
                                callback(err, results, db);
                            }
                        });
                    });
                } else {
                    var err="ERROR: Model has no specified ID, delete aborted";
                    var result = null;
                    if(callback) {
                        callback(err, result);
                    }
                }
            }
        } */
    });
    return SQLModel;
};
exports.createConnection = createConnection;

