const express = require('express');
const app = express()
const fs = require('fs');
const { htmlToDocx } = require('./utils');
const bodyParser = require('body-parser')

app.use(bodyParser.json({ limit: '10mb' }))

app.post('/uploadHtml', (req, res) => {
    fs.unlink("./new.html", (err) => {
        console.log('wrting started...')
        fs.writeFileSync('./new.html', String(req.body.data))
        console.log('wrting completed...')
        htmlToDocx()
    })
});

app.listen(3001)