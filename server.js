"use strict";
const {PythonShell} = require('python-shell')
const express = require('express')
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');
const GridFsStorage = require('multer-gridfs-storage');

var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID

const storage = new GridFsStorage({ url : 'mongodb://localhost:27017/resumeParser',
  file: (req, file) => {
    return {
      filename: file.originalname
    };
  }
 });
const multer = require('multer');
const upload = multer({ storage });

const app = express()
const port = 3000

app.use('/', express.static(path.join(__dirname, 'public')));
app.get('/recruiter', function(req, res) {
  res.sendFile('/recruiter/index.html');
});

app.get('/applicant', function(req, res) {
  res.sendFile('/applicant/index.html');
});

app.get('/applicant/applied.html', (req, res) => {
  res.sendFile('/applicant/applied.html');
});


app.post('/applyJob', upload.single('resume'), (req, res) => {
  const formData = req.body;
  console.log('form data', formData);
  console.log('req.file', req.file);

  var applicant = {
    name: req.body.applicantName,
    email: req.body.applicantEmail,
    phone: req.body.applicantPhone,
    jobId: new ObjectID(req.body.jdId),
    resume: new ObjectID(req.file.id)
  }

  MongoClient.connect('mongodb://localhost:27017/resumeParser', function (err, client) {
    if (err) throw err
    var db = client.db('resumeParser')
    db.collection('applicant').insertOne(applicant, function(err, result) {
      console.log("New Applicant Registered" + result.insertedId)
    });
  })

  res.status(201);
  res.end("Job Applied Sucessfully");
});

app.get('/applicant/getJob', function (req, res) {
  var jdId = req.query.jd;
  MongoClient.connect('mongodb://localhost:27017/resumeParser', function (err, client) {
    if (err) throw err
    var db = client.db('resumeParser')
    db.collection('jobs').findOne({"_id" : new ObjectID(jdId)}, function(err, result) {
      if(err) res.send({error: err})
      res.send(result)
    });
  })
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
            db.collection('jobs').insertOne(jdModel, function(err, result) {
              console.log("New Job Posted" + result.insertedId)
            });
          })
        }
      });
    res.status(201);
    res.end("Job Posted Sucessfully");
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))