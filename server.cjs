'use strict';
const { PythonShell } = require('python-shell')
const express = require('express')
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const pdfUtil = require('pdf-to-text');
const GridFsStorage = require('multer-gridfs-storage');
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const GridFSBucket = require('mongodb').GridFSBucket
const GridFSBucketReadStream = require('mongodb').GridFSBucketReadStream
const multer = require('multer');
const app = express()
const port = 3000
const storage = new GridFsStorage({
    url: 'mongodb://localhost:27017/resumeParser',
    file: (req, file) => {
        return {
            filename: file.originalname
        };
    }
});
const upload = multer({ storage });

/**
 * Serve Web pages
 */
app.use('/', express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
});
app.get('/recruiter', (req, res) => {
    res.sendFile('/recruiter/index.html');
});

app.get('/recruiter/applicants.html', (req, res) => {
    res.sendFile('/recruiter/applicants.html');
});

app.get('/applicant', (req, res) => {
    res.sendFile('/applicant/index.html');
});

app.get('/applicant/applied.html', (req, res) => {
    res.sendFile('/applicant/applied.html');
});


/**
 * HTTP POST API for applying job
 * Creates new Applicant in backend
 */
app.post('/applyJob', upload.single('resume'), (req, res) => {
    var applicant = {
        name: req.body.applicantName,
        email: req.body.applicantEmail,
        phone: req.body.applicantPhone,
        jobId: new ObjectID(req.body.jdId),
        resume: new ObjectID(req.file.id),
        resumeName: req.file.filename
    }

    MongoClient.connect('mongodb://localhost:27017/resumeParser', (err, client) => {
        if (err) throw err
        var db = client.db('resumeParser')
        const bucket = new GridFSBucket(db, {
            chunkSizeBytes: req.file.chunkSize,
            bucketName: req.file.bucketName
        });

        bucket.openDownloadStream(req.file.id)
        .pipe(fs.createWriteStream('./output.pdf'))
        .on('error', (error) => {
            console.log('ERROR in streaming file from GridFS - ' + error)
        }).on('finish', () => {
            pdfUtil.pdfToText('./output.pdf', (err, data) => {
                if (err) throw err
                var options = {
                    args: data
                };
                PythonShell.run('jd-parser.py', options, (err, results) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send('Something broke!');
                    } else {
                        applicant['topTokens'] = JSON.parse(results[0])
                        db.collection('applicant').insertOne(applicant, (err, result) => {
                            console.log('New Applicant Registered' + result.insertedId)
                        });
                    }
                });
            });
        });
    })
    res.status(201);
    res.end('Job Applied Sucessfully');
});

/**
 * HTTP POST API for posting job
 * Creates new Job in backend
 */
var opt = {
    'type': 'application/json'
}
app.use(bodyParser.text(opt));
app.post('/postJob', (req, res) => {
    var jdModel = JSON.parse(req.body);
    var options = {
        args: [jdModel.description]
    };
    PythonShell.run('jd-parser.py', options, (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send('Something broke!');
        } else {
            jdModel['topTokens'] = JSON.parse(results[0])
            MongoClient.connect('mongodb://localhost:27017/resumeParser', (err, client) => {
                if (err) throw err
                var db = client.db('resumeParser')
                db.collection('jobs').insertOne(jdModel, (err, result) => {
                    console.log('New Job Posted' + result.insertedId)
                    res.status(201);
                    res.send({"JobId": result.insertedId});
                });
            })
        }
    });
})

/**
 * REST API
 * Gets job description for the given jobId
 * Query Paramater - jd - MongoDb Id for retrieving Job
 */
app.get('/applicant/getJob', (req, res) => {
    var jdId = req.query.jd;
    MongoClient.connect('mongodb://localhost:27017/resumeParser', (err, client) => {
        if (err) throw err
        var db = client.db('resumeParser')
        db.collection('jobs').findOne({ '_id': new ObjectID(jdId) }, (err, result) => {
            if (err) res.send({ error: err })
            res.send(result)
        });
    })
})

/**
 * REST API
 * Gets List of applicants for the given jobId
 * Query Paramater - jd - MongoDb Id for retrieving Job
 */
app.get('/recruiter/getApplicants', (req, res) => {
    var jdId = req.query.jd;
    var noOfApplicants = parseInt(req.query.noOfApplicant);
    MongoClient.connect('mongodb://localhost:27017/resumeParser', (err, client) => {
        if (err) throw err
        var db = client.db('resumeParser')
        db.collection('applicant').find({'jobId': new ObjectID(jdId)}).limit(noOfApplicants).toArray((err, results) => {
            var applicants = results.map(applicant => {
                return ({
                    name : applicant.name,
                    email : applicant.email,
                    phone : applicant.phone,
                    resume: applicant.resume,
                    resumeName: applicant.resumeName
                });
            })
            res.send(applicants)
        });
    })
})

/**
 * REST API
 * Gets List of Jobs from Mongo DB
 */
app.get('/getJobs', (req, res) => {
    var jdId = req.query.jd;
    MongoClient.connect('mongodb://localhost:27017/resumeParser', (err, client) => {
        if (err) throw err
        var db = client.db('resumeParser')
        db.collection('jobs').find({}).toArray((err, results) => {
            var jobs = results.map(job => {
                return ({
                    id : job._id,
                    jobTitle : job.jobTitle,
                    jobPostingLink : '/applicant?jd=' + job._id,
                    listOfApplicants: 'recruiter/applicants.html?jd=' + job._id,
                });
            })
            res.send(jobs)
        });
    })
})

/**
 * REST API
 * Retrieves the applicant's resume from Grid FS
 * Query Paramater - jd - MongoDb Id for stored resume file
 */
app.get('/downloadResume',(req, res) => {
    var fileId = req.query.fileId;
    MongoClient.connect('mongodb://localhost:27017/resumeParser', (err, client) => {
        if (err) throw err
        var db = client.db('resumeParser')

        db.collection('fs.files').findOne({ '_id': new ObjectID(fileId) }, (err, result) => {
            if (err) res.status(500).end();

            const bucket = new GridFSBucket(db, {
                chunkSizeBytes: result.chunkSize,
                bucketName: 'fs'
            });

            bucket.openDownloadStream(result._id)
            .pipe(res)
            .on('error', () => {
                console.log("Some error occurred in download:"+error);
                res.end();
            })
            .on('finish', () => {
                res.end();
            });
        });        
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))