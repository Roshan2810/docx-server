const fs = require('fs');
const htmlDocx = require("html-to-docx");
let htmlString = ""
const HTML = require('html-parse-stringify')
const { v4: uuidv4 } = require('uuid');

const htmlToDocx = async () => {
    try {
        addIdToHTMLElements()
        htmlString = fs.readFileSync('./new.html', { encoding: 'utf-8' })
        const fileBuffer = await htmlDocx(htmlString, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        });
        fs.writeFile("./test.docx", fileBuffer, (error) => {
            if (error) {
                console.log('Docx file creation failed');
                return;
            }
            console.log('Docx file created successfully');
        });
    } catch (err) {
        console.log("Error", err.message)
    }
};

const addIdToHTMLElements = async () => {
    htmlString = fs.readFileSync('./new.html', { encoding: null })
    var ast = HTML.parse(htmlString.toString())
    let result = traverseChildren(ast)
    let htmlData = HTML.stringify(result.result)
    fs.writeFileSync('./new.html', htmlData)
}


const traverseChildren = (htmlObjects) => {
    let data = []
    data = htmlObjects.map(obj => {
        return recursivelyAddingId(obj)
    })
    return { result: data }
}

const recursivelyAddingId = (data) => {
    let obj = Object.assign({}, JSON.parse(JSON.stringify(data)))
    if (obj.hasOwnProperty('children')) {
        obj.children.forEach((child, i) => {
            obj['attrs'] = { id: uuidv4() };
            if (obj.children[i].hasOwnProperty('children')) {
                obj.children[i] = recursivelyAddingId(child)
            }
        })
    }
    return obj
}


module.exports = {
    htmlToDocx
}