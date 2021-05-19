const express = require('express');
const app = express()
const fs = require('fs');
const { htmlToDocx, convertJSONToHTML } = require('./utils');
const bodyParser = require('body-parser');
const path = require('path');

// app.use(bodyParser.json({ limit: '10mb' }))

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

convertJSONToHTML();