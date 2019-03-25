"use strict";

// MongoDB Database file

const mongoose = require("mongoose");

//constiable to set connection string
const mongoDBConnectinString = "mongodb://localhost:27017/common";

const host = "localhost:1337";

const secretKey = "a4f90771f-c973-4947-86e2";

/*create connection for the first time*/
const db = mongoose.createConnection(mongoDBConnectinString);

mongoose.connect(mongoDBConnectinString);

db.on("error", function(err) {
  console.log("Mongoose connection error: " + err);
});

db.on("connected", function() {
  console.log("Mongoose connected ");
});

db.on("disconnected", function() {
  console.log("Mongoose disconnected");
});

//export the module
module.exports = {
  db,
  mongoDBConnectinString,
  host,
  secretKey
};
