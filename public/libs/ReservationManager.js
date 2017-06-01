/**
 * Created by awesometic on 17. 5. 31.
 */
var ReservationManager = ReservationManager || (function() {

        var mysql = require('mysql');
        var schedule = require('node-schedule');

        var pool;

        var startDatetime;

        var expiredHoldingMin = 30;
        var timezoneOffsetMin = 540;

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

        var findFromTable = function(userid, reservationtime, callback) {
            pool.getConnection(function(err, connection) {
                if (err)
                    console.error(err);
                connection.query('SELECT id FROM reservation WHERE userid=? AND reservationtime=?', [userid, reservationtime], function (err, rows) {
                    connection.release();

                    if (err)
                        console.error(err);
                    if (rows.length > 0)
                        console.error("ReservationManager: reservation we are looking for is not unique");

                    if (typeof callback === "function") {
                        callback(rows[0].id);
                    }
                })
            });
        };

        var getCurrentDatetime = function() {
            var date = new Date(new Date().getTime() + minToMSec(timezoneOffsetMin));

            return date.toISOString().slice(0, 19).replace(/T/g, ' ');
        };

        var getExpiredDatetimeFromTable = function(rawReservedTimeString) {
            var spaceSplit = String(rawReservedTimeString).split(' ');

            var reservedDate = spaceSplit[0];
            var hyphenSplit = String(reservedDate).split('-');
            reservedDate = hyphenSplit[2] + '-' + hyphenSplit[1] + '-' + hyphenSplit[0];

            var reservedTime = spaceSplit[1] + ':00';

            var reservedDatetime = reservedDate + " " + reservedTime;

            var expiredTimeMSec = new Date(reservedDatetime).getTime() + minToMSec(timezoneOffsetMin) + minToMSec(expiredHoldingMin);

            return new Date(expiredTimeMSec).toISOString().slice(0, 19).replace(/T/g, ' ');
        };

        var minToMSec = function(min) {
            return min * 60 * 1000;
        };

        var remove = function(id) {
            pool.getConnection(function(err, connection) {
                if (err)
                    console.error(err);
                connection.query('DELETE FROM reservation WHERE id=?', [id], function (err) {
                    connection.release();

                    if (err)
                        console.error(err);

                    console.log("ReservationManager: remove expired reservation: " + id);
                });
            });
        };

        var addToDictionary = function(id, datetime) {
            reservationDic[datetime] = id;

            console.log("ReservationManager: new reservation added: " + id + " / " + datetime);
        };

        var startCron = function() {
            scheduleCron = schedule.scheduleJob('*/1 * * * *', function() {
                var currentDatetime = getCurrentDatetime();
                if (typeof reservationDic[currentDatetime] !== "undefined") {

                    remove(reservationDic[currentDatetime]);
                    delete reservationDic[currentDatetime];
                }
            });

            console.log("ReservationManager: cron service start");
        };

        var stopCron = function() {
            reservationDic = null;
            scheduleCron.cancel();

            console.log("ReservationManager: cron service stop");
        };

        return {
            startObserver: function() {
                initDatabase();

                startDatetime = getCurrentDatetime();
                console.log("ReservationManager: started at " + startDatetime);

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
            addReservation: function(userid, reservationtime) {
                findFromTable(userid, reservationtime, function(id) {
                    var expiredDatetime = parseDatetimeFromTable(reservationtime);

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