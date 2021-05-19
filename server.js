const express = require('express');
const app = express()
const fs = require('fs');
const { htmlToDocx, convertJSONToHTML } = require('./utils');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https')
const querystring = require('querystring');

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


var postData = querystring.stringify({
    'msg': 'Hello World!'
});

var options = {
    hostname: 'auth.anuvaad.org',
    path: '/anuvaad/content-handler/v0/fetch-content?record_id=A_FBTTR-klzyu-1618806774810%7C0-16188068061294107.json&start_page=0&end_page=0',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'auth-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyTmFtZSI6InJvc2hhbi5zaGFoQHRhcmVudG8uY29tIiwicGFzc3dvcmQiOiJiJyQyYiQxMiRIQ1R0T1FWVUZMUkcvOGhJd0d5cU9POG5VbVo0bFVRM1RUMFA5RE05MjFCanVUVHFrYWV0LiciLCJleHAiOjE2MjE1MzEyNzZ9.p3Qr1uemypiagovvPi8fdQzpCwXfRAnZ2bF9GCTvfSA'
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
        fs.writeFile('./source.json', data, (err) =>{
        if (!err) convertJSONToHTML(); })
    })
});

req.on('error', (e) => {
    console.error(e);
});

req.end();