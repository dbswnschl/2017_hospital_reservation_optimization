/**
 * Created by awesometic on 17. 5. 31.
 * Last updated: 20170607
 */
var ReservationManager = ReservationManager || (function() {

        var mysql = require('mysql');
        var schedule = require('node-schedule');
        var moment = require('moment-timezone');

        var pool;

        var startDatetime;

        var expiredHoldingMin = 30;
        var timezone = "Asia/Seoul";

        var reservationDic = {};
        var scheduleCron;

        var initDatabase = function() {
            pool = mysql.createPool({
                connectionLimit: 100,
                host: 'localhost',
                user: 'root',
                password: 'root', // root
                database: 'hospital',
                port: '3307' // 3307
            });
        };

        var getCurrent = function(callback) {
            pool.getConnection(function(err, connection) {
                if (err)
                    console.error(err);

                connection.query('SELECT * FROM reservation', function(err, rows) {
                    connection.release();

                    if (err)
                        console.error(err);

                    var reservations = [];
                    var startDatetimeMSec = new Date(startDatetime).getTime();
                    for (var i = 0; i < rows.length; i++) {
                        var expiredDatetime = getExpiredDatetimeFromTable(rows[i].reservationtime);
                        var expiredDatetimeMSec = new Date(expiredDatetime).getTime();

                        if (startDatetimeMSec < expiredDatetimeMSec) {
                            var reservation = {};

                            reservation.id = rows[i].id;
                            reservation.datetime = expiredDatetime;

                            reservations.push(reservation);
                        }
                    }

                    if (typeof callback === "function") {
                        callback(reservations);
                    }
                });
            });
        };

        var getExpired = function(callback) {
            pool.getConnection(function(err, connection) {
                if (err)
                    console.error(err);

                connection.query('SELECT * FROM reservation', function (err, rows) {
                    connection.release();

                    if (err)
                        console.error(err);

                    var reservations = [];
                    var startDatetimeMSec = new Date(startDatetime).getTime();
                    for (var i = 0; i < rows.length; i++) {
                        var expiredDatetime = getExpiredDatetimeFromTable(rows[i].reservationtime);
                        var expiredDatetimeMSec = new Date(expiredDatetime).getTime();

                        if (startDatetimeMSec >= expiredDatetimeMSec) {
                            var reservation = {};

                            reservation.id = rows[i].id;
                            reservation.datetime = expiredDatetime;

                            reservations.push(reservation);
                        }
                    }

                    if (typeof callback === "function") {
                        callback(reservations);
                    }
                });
            });
        };

        var findFromTable = function(usernumber, reservationtime, callback) {
            pool.getConnection(function(err, connection) {
                if (err)
                    console.error(err);
                connection.query('SELECT id FROM reservation WHERE usernumber=? AND reservationtime=?', [usernumber, reservationtime], function (err, rows) {
                    connection.release();

                    if (err)
                        console.error(err);
                    if (rows.length == 0) {
                        console.error(getCurrentDatetime() + " ReservationManager: reservation we are looking for is not existed");
                    } else if (rows.length > 1) {
                        console.error(getCurrentDatetime() + " ReservationManager: reservation we are looking for is not unique");
                    } else {
                        if (typeof callback === "function") {
                            callback(rows[0].id);
                        }
                    }
                })
            });
        };

        var getCurrentDatetime = function() {
            return moment().tz(timezone).format("YYYY-MM-DD HH:mm:ss");
        };

        var getExpiredDatetimeFromTable = function(rawReservedTimeString) {
            // reservationtime format: "YYYY-MM-DD HH:mm ~ HH:mm"
            var spaceSplit = String(rawReservedTimeString).split(' ');

            var reservedDate = spaceSplit[0];
            var reservedDatetime = new Date(reservedDate + " " + spaceSplit[1] + ':00'); // YYYY-MM-DD HH:mm:00

            return moment(reservedDatetime).tz(timezone).add(expiredHoldingMin, 'm').format("YYYY-MM-DD HH:mm:ss");
        };

        var remove = function(id) {
            pool.getConnection(function(err, connection) {
                if (err)
                    console.error(err);
                connection.query('DELETE FROM reservation WHERE id=?', [id], function (err) {
                    connection.release();

                    if (err)
                        console.error(err);

                    console.log(getCurrentDatetime() + " ReservationManager: remove expired reservation " + id);
                });
            });
        };

        var addToDictionary = function(id, datetime) {
            if (moment(datetime, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
                reservationDic[datetime] = id;

                console.log(getCurrentDatetime() + " ReservationManager: add reservation " + id + ", expired at " + datetime);
            } else {
                console.log(getCurrentDatetime() + " ReservationManager: failed to add " + id + ", expired at " + datetime);
            }
        };

        var startCron = function() {
            scheduleCron = schedule.scheduleJob('*/1 * * * *', function() {
                var currentDatetime = getCurrentDatetime();
                if (typeof reservationDic[currentDatetime] !== "undefined") {

                    remove(reservationDic[currentDatetime]);
                    delete reservationDic[currentDatetime];
                }
            });

            console.log(getCurrentDatetime() + " ReservationManager: cron service start");
        };

        var stopCron = function() {
            reservationDic = null;
            scheduleCron.cancel();

            console.log(getCurrentDatetime() + " ReservationManager: cron service stop");
        };

        return {
            startObserver: function() {
                initDatabase();

                startDatetime = getCurrentDatetime();
                console.log(getCurrentDatetime() + " ReservationManager: started at " + startDatetime);

                getExpired(function(reservations) {
                    for (var i = 0; i < reservations.length; i++) {
                        remove(reservations[i].id);
                    }
                });

                getCurrent(function(reservations) {
                    for (var i = 0; i < reservations.length; i++) {
                        addToDictionary(reservations[i].id, reservations[i].datetime);
                    }
                });

                startCron();
            },
            stopObserver: function() {
                stopCron();
            },
            addReservation: function(usernumber, reservationtime) {
                findFromTable(usernumber, reservationtime, function(id) {
                    var expiredDatetime = getExpiredDatetimeFromTable(reservationtime);

                    addToDictionary(id, expiredDatetime);
                });
            },
            getObserverStartDatetime: function() {
                return new Date(startDatetime);
            },
            getReservedToString: function() {
                return reservationDic.toString();
            }
        };
    })();

module.exports.ReservationManager = ReservationManager;