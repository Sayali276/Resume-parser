"use strict";
let {PythonShell} = require('python-shell')
const express = require('express')
const bodyParser = require("body-parser");
var fs = require('fs');
const app = express()
const port = 3000

console.log(PythonShell)
console.log(PythonShell.run)

app.use(express.static(__dirname + '/'));
app.get('/', (req, res) => {
    sendFile(__dirname + '/' + 'index.html');
})

var opt = {
    "type": "application/json"
}
app.use(bodyParser.text(opt));
app.post("/postJob", (req, res) => {
    var body = JSON.parse(req.body);
    console.log(body);
    var options = {
        args: [body.description]
    };
    PythonShell.run('jd-parser.py', options, function(err, results) {
        if (err) {
          console.log(err);
          res.status(500).send('Something broke!');
        } else {
          console.log('Script Completed');
          console.log('------------------------------------');
          console.log(JSON.parse(results[0]));
          console.log('------------------------------------');
          //TODO: redirect here
          //res.redirect('');
        }
      });
    res.status(201);
    res.end("Job Posted Sucessfully");
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))