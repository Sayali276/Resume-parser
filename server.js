"use strict";
let {PythonShell} = require('python-shell')
const express = require('express')
const bodyParser = require("body-parser");
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient
const app = express()
const port = 3000

app.use(express.static(__dirname + '/'));
app.get('/', (req, res) => {
    sendFile(__dirname + '/' + 'index.html');
})

var opt = {
    "type": "application/json"
}
app.use(bodyParser.text(opt));
app.post("/postJob", (req, res) => {
    var jdModel = JSON.parse(req.body);
    var options = {
        args: [jdModel.description]
    };
    PythonShell.run('jd-parser.py', options, function(err, results) {
        if (err) {
          console.log(err);
          res.status(500).send('Something broke!');
        } else {
          jdModel['topTokens'] = JSON.parse(results[0])
          MongoClient.connect('mongodb://localhost:27017/resumeParser', function (err, client) {
            if (err) throw err
            var db = client.db('resumeParser')
            db.collection('resumeParser').insertOne(jdModel, function(err, result) {
              console.log(result)
            });
          })
        }
      });
    res.status(201);
    res.end("Job Posted Sucessfully");
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))