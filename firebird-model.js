/**
 * Created by pzheng on 9/02/2017.
 */
'use strict';
var _ = require('underscore')._;
var Backbone = require('backbone');
var Firebird = require('node-firebird');


var defineModel = function(options, tableName) {
    var sql, check, id, fields = [], values = [], fieldValues = [], fieldEqualValues = [];
    var SQLModel = Backbone.Model.extend({
        //constructor happen before model set up
        //constructor: function() {
            //console.log("constructor called");
       // },

        //Initialize happen before Model set up
        initialize: function() {
            console.log("Initialise called" );
            if( tableName ) {
                this.tableName = tableName;
            }
            /* Firebird.attach(options, function(err, db) {
                if (err) {
                    console.log(err.message);
                    throw new Error(err.message);
                } else {
                    db.query("select * from users", function(err, results, fields) {
                        console.log("Database Query Result: 'User'", results);
                        db.detach();
                    });
                }
            });*/
        },

        setSQL: function(data) {
            for(var key in data) {
                if( typeof data[key] !== "function" ) {
                    this.set(key, data[key]);
                }
            }
        },
        // Function for creating custom queries
        query: function(sql, callback) {
            Firebird.attach( options, function(err, db) {
                if (err) {
                    throw new Error(err.message);
                } else {
                    db.query(sql, function (err, results, fields) {
                        if (callback) {
                            callback(err, results, fields);
                        }
                        db.detach();
                    });

                }
            });
        },
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

            Firebird.attach(options, function(err, db) {
                if (err) {
                    throw new Error(err.message);
                } else {
                    db.query(sql, function (err, results, fields) {
                        root.setSQL(results[0]);
                        if( callback ) {
                            callback(err, results, fields );
                        }
                        db.detach();
                    });
                }
            });
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
            if( conditions.rows ) {
                qcond += " rows " + conditions.range;
            }

            switch(method) {
                //default method
                case "all":
                    sql = "select " + fields + " from " + tableName + qcond;
                    Firebird.attach(options, function(err, db) {
                        if (err) {
                            console.log(err.message);
                            throw new Error(err.message);
                        } else {
                            db.query(sql, function (err, results, fields) {
                                if( callback ) {
                                    callback(err, results, fields );
                                }
                                db.detach();
                            });
                        }
                    });
                    break;
                case "count":
                    sql = "select count(*) as count_field from " + tableName + qcond;
                    Firebird.attach(options, function(err, db) {
                        if (err) {
                            throw new Error(err.message);
                        } else {
                            db.query(sql, function (err, results, fields) {
                                if (callback) {
                                    callback(err, results[0]['COUNT_FIELD'], fields);
                                }
                                db.detach();
                            });
                        }
                    });
                    break;
                case "first":
                    sql = "select first(1) " + fields +" from " + tableName + qcond;
                    Firebird.attach(options, function(err, db) {
                        if (err) {
                            console.log(err.message);
                            throw new Error(err.message);
                        } else {
                            db.query(sql, function (err, results, fields) {
                                if (callback) {
                                    callback(err, results[0], fields);
                                }
                                db.detach();
                            });
                        }
                    });
                    break;
                case "field":
                    sql = "select " + fields +" from " + tableName + qcond;
                    Firebird.attach(options, function(err, db) {
                        if (err) {
                            throw new Error(err.message);
                        } else {
                            db.query(sql, function (err, results, fields) {
                                var key;
                                for (key in results[0]) {
                                    if (callback) {
                                        callback(err, results[0][key], fields);
                                    }
                                    //break;
                                }
                                db.detach();
                            });
                        }
                    });
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
                tableName = this.attributes.tableName;
            }
            if( where ) {
                id = null;
                if( this.has('id')) {
                    id = this.get('id');
                    delete this.attributes.id;
                }
                var fieldValues = this.attributes;
                var fields = Object.keys(fieldValues);
                var fieldEqualValues = fields.map(function(key) {
                    return key + " ='" + fieldValues[key] + "'";
                });
                sql = " update " + tableName + " set " + fieldEqualValues.join(",") + " where " + where.where;
                if( id ) {
                    this.set('id', id);
                }
                var check = " select first(1) * from " + tableName + " where " + where.where;
                Firebird.attach(options, function(err, db) {
                    if (err) {
                        throw new Error(err.message);
                    } else {
                        db.query(check, function (err, results, fields) {
                            if (results[0]) {
                                db.query(sql, function (err, result) {
                                    if (callback) {
                                        callback(err, result, db);
                                    }
                                    else {
                                        db.detach();
                                    }
                                });
                            } else {
                                err = "ERROR: Record not found";
                                if (callback) {
                                    callback(err, results, db);
                                }
                                else {
                                    db.detach();
                                }
                            }
                            //db.detach();
                        });
                    }
                });
            } else { //without where
                if( this.has('id') ) {
                    id = this.get('id');
                    delete this.attributes.id;

                    fieldValues = this.attributes;
                    fields = Object.keys(fieldValues);
                    fieldEqualValues = fields.map(function(key) {
                        return key + " ='" + fieldValues[key] + "'";
                    });
                    sql = "update " + tableName + " set " + fieldEqualValues.join(",") + " where id= " + id;
                    this.set('id', id);
                    check = " select first(1) * from " + tableName + " where id=" + id;
                    Firebird.attach(options, function(err, db) {
                        if (err) {
                            console.log(err.message);
                            throw new Error(err.message);
                        } else {
                            db.query(check, function (err, results, fields) {
                                if (results[0]) {
                                    db.query(sql, function (err, result) {
                                        if (callback) {
                                            callback(err, result, db);
                                        }
                                        else {
                                            db.detach();
                                        }
                                    });
                                } else {
                                    err = "ERROR: Record not found";
                                    if (callback) {
                                        callback(err, results, db);
                                    }
                                    else {
                                        db.detach();
                                    }
                                }
                                //db.detach();
                            });
                        }
                    });
                } else { //Create new record
                    fieldValues = this.attributes;
                    fields = Object.keys(this.attributes);
                    values = fields.map(function(key) {
                            return "'" + fieldValues[key] + "'";
                        });

                    sql = "insert into " + tableName + " ( " + fields.join(",") + " ) values( " + values.join(",") + " ) returning id";
                    Firebird.attach(options, function(err, db) {
                        if (err) {
                            throw new Error(err.message);
                        } else {
                            db.query(sql, function (err, results) {
                                if( callback ) {
                                    callback(err, results, db);
                                }
                                else {
                                    db.detach();
                                }
                            });
                        }
                    });
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
                sql = "delete from " + tableName + " where " + where.where;
                var check = " select * from " + tableName + " where " + where.where;
                Firebird.attach(options,
                    function(err, db) {
                        if (err) {
                            throw new Error(err.message);
                        } else {
                            db.query(check, function (err, results, fields) {
                                if (results[0]) {
                                    db.query(sql, function (err, result) {
                                        if (callback) {
                                            callback(err, result, db);
                                        }
                                        else {
                                            db.detach();
                                        }
                                    });
                                } else {
                                    err = "ERROR: Record not found";
                                    if (callback) {
                                        callback(err, results, db);
                                    }
                                    else {
                                        db.detach();
                                    }
                                }
                                //db.detach();
                            });
                        }
                    }
                );
            } else {
                if(this.has('id')) {
                    sql = "DELETE FROM " + tableName + " WHERE id=" + this.attributes.id;
                    check = "SELECT * FROM " + tableName +" WHERE id=" + this.attributes.id;
                    this.clear();
                    Firebird.attach(options, function(err, db) {
                        db.query(check, function (err, results, fields) {
                            if (results[0]) {
                                db.query(sql, function (err, result) {
                                    if (callback) {
                                        callback(err, result, db);
                                    }
                                    else {
                                        db.detach();
                                    }
                                });
                            } else {
                                err = "ERROR: Record not found";
                                if (callback) {
                                    callback(err, results, db);
                                }
                                else {
                                    db.detach();
                                }
                            }
                        });
                    });
                } else {
                    var err = "ERROR: Model has no specified ID, delete aborted";
                    var result = null;
                    if(callback) {
                        callback(err, result);
                    }
                }
            }
        }
    });
    return SQLModel;
};
exports.defineModel = defineModel;

