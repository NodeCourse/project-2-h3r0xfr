const fs = require('fs');
const express = require('express');
const formidable = require('formidable');
const Unirest = require('unirest');
require('express-group-routes');
const app = express();

const db = require('./database');

app.set('view engine', 'pug');
app.set('views', 'public/views');
app.use(express.static("public"));

// Gestion des dates
app.locals.moment = require('moment');
app.locals.moment.locale('fr');

function bytesToSize(bytes) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

app.get('/', (req, res) => {
    db.File.findAll().then((files) => {
        res.render('home', {
            files: files
        });
    });
});

app.get('/upload', (req, res) => {
    res.render('upload');
});

app.group('/api', (router) => {
    router.group('/file', (router) => {

        router.get('/:id(\\d+)/download', (req, res) => {
            let id = req.params.id;
            db.File.update({
                nbDownloads: db.Sequelize.literal('nbDownloads + 1')
            }, {
                where: { id }
            }).then(() => {
                return res.json({ status: true });
            });
        });

        router.post('/upload', (req, res) => {
            let form = new formidable.IncomingForm();
            form.maxFileSize = 10 * 1024 * 1024; // 10 MB

            form.parse(req, (err, fields, files) => {
                if(err) return console.log(err);

                let pFile = files['0'];
                let oldpath = pFile.path;
                let newpath = './public/uploads/' + Date.now() + '_' + pFile.name;

                fs.rename(oldpath, newpath, (err) => {
                    if (err) {
                        console.log(err);
                        return res.json({ error: 'Une erreur est survenue lors de l\'envoi du fichier.' });
                    }

                    Unirest.post('http://beta-eu.attachmentscanner.com/v0.1/scans')
                        .headers({
                            'Authorization': 'bearer 7cc37d196c6d1854441e',
                            'Accept': 'application/json',
                            'Content-Type': 'multipart/form-data'
                        })
                        .attach('file', newpath)
                        .end((response) => {
                            let data = response.body;
                            db.File.create({
                                name: pFile.name,
                                path: newpath,
                                size: pFile.size,
                                nbDownloads: 0,
                                scanId: data.id
                            }).then((file) => {
                                res.json({ file: file });
                            });
                        });
                });
            });
        });

    });
});

app.get('/file/:id(\\d+)/', (req, res) => {
    let id = req.params.id;

    db.File.findOne({
        where: { id }
    }).then((file) => {
        Unirest.get('http://beta-eu.attachmentscanner.com/v0.1/scans/' + file.scanId)
            .headers({
                'Authorization': 'bearer 7cc37d196c6d1854441e',
                'Accept': 'application/json'
            })
            .end((response) => {
                res.render('file', {
                    file: file,
                    size: bytesToSize(file.size),
                    scan: response.body
                });
            });
    });
});

app.listen(3000, () => {
    console.log('Application \x1b[32m%s\x1b[0m on port 3000.', 'started');
});
