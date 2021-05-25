const express = require('express');
const app = express()
const fs = require('fs');
const { generateDocx } = require('./generateDocx')
const https = require('https')
const { refactorSourceJSON } = require('./utils');
const bodyParser = require('body-parser');
const path = require('path')

app.use(bodyParser.json());

app.use((req, res, next) => {
    next();
})

app.post('/download-docx', (request, response) => {
    let { fname, jobId, authToken } = request.body
    var options = {
        hostname: 'users-auth.anuvaad.org',
        path: `/anuvaad/content-handler/v0/fetch-content?record_id=${jobId}&start_page=0&end_page=0`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': authToken
        }
    };

    var req = https.request(options, (res) => {
        let data = ""
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);

        res.on('data', (d) => {
            data = data + d.toString()
        });

        res.on('end', e => {
            data = JSON.stringify(refactorSourceJSON(JSON.parse(data).data))
            fs.writeFile('./source.json', data, async (err) => {
                if (!err) {
                    generateDocx(fname);
                    fs.readFile(`./${fname}`, { encoding: 'utf-8' }, (err, data) => {
                        setTimeout(() => {
                            response.statusMessage = "Downloaded.."
                            response.statusCode = 201
                            response.sendFile(path.join(__dirname, `./${fname}`))
                        }, 2000)
                    })
                }
            })
        })
    });

    req.on('error', (e) => {
        response.statusCode = '302'
        response.statusMessage = 'Error while conversion'
    });

    req.end();
})
app.listen(3001)
