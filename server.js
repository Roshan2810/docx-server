const express = require('express');
const app = express()
const fs = require('fs');
const { htmlToDocx, convertJSONToHTML } = require('./utils');
const { testWithOOXML } = require('./generateDocx')
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https')
const querystring = require('querystring');
const { refactorSourceJSON } = require('./utils')

app.use(bodyParser.json({ limit: '10mb' }))

// app.post('/uploadHtml', (req, res) => {
//     fs.unlink("./new.html", (err) => {
//         console.log('wrting started...')
//         fs.writeFileSync('./new.html', String(req.body.data))
//         console.log('wrting completed...')
//         htmlToDocx()
//         res.statusCode = 200
//         res.statusMessage = "Uploaded successfully"
//         res.send()
//     })
// });

// app.get('/getDocx', (req, res) => {
//     res.sendFile(`${path.join(__dirname)}/test.docx`)
// })

// app.listen(8080)
// htmlToDocx();


// var postData = querystring.stringify({
//     'msg': 'Hello World!'
// });

var options = {
    hostname: 'auth.anuvaad.org',
    path: '/anuvaad/content-handler/v0/fetch-content?record_id=A_FBTTR-rMRWx-1621710849968%7C0-16217109529903913.json&start_page=0&end_page=0',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'auth-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyTmFtZSI6InJvc2hhbi5zaGFoQHRhcmVudG8uY29tIiwicGFzc3dvcmQiOiJiJyQyYiQxMiRHUjY3dkVSWlNKRzhRM1gzMGNaaGJPTDRMTkxUdnIxVG5YWFM0UGVBY0R6UzY0Uk8vSHV6NiciLCJleHAiOjE2MjE3ODc5ODh9.w7oPJRcq42xI9kraGmpA73bCSMUAir7d0jSiaElpmxQ'
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
        data = JSON.stringify(refactorSourceJSON(JSON.parse(data)))
        fs.writeFile('./source.json', data, (err) => {
            if (!err) testWithOOXML();
        })
        // if (!err) convertJSONToHTML();})
    })
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
