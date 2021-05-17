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
    data = extractSource(data)
    fs.writeFileSync('./newSource.json', JSON.stringify(data))
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


const recursivelyExtractingText = (data, resultArr) => {
    let obj = Object.assign({}, JSON.parse(JSON.stringify(data)))
    let arr = Object.assign([], JSON.parse(JSON.stringify(resultArr)))
    if (obj.hasOwnProperty('children')) {
        obj.children.forEach((child, i) => {
            if (obj.children[i].hasOwnProperty('children') && obj.children[i].name !== 'img') {
                let data = recursivelyExtractingText(child, arr).arr
                let len = data.length
                arr.push(data[len - 1])
            }
        })
        if (obj.attrs.hasOwnProperty('id') && obj.children[0].type === 'text' && obj.children[0].content.replace(/\s/g, "").length) {
            arr.push({
                s_id: obj.attrs.id,
                textContent: obj.children[0].content
            })
        }
    }
    return { obj, arr }
}

const extractSource = (ast) => {
    let result = []
    ast.forEach(obj => {
        let data = recursivelyExtractingText(obj, result)
        result = data.arr
    })
    let jsonFileData = JSON.stringify(result)
    fs.writeFileSync('source.json', jsonFileData)
    return modifyHTMLTextAfterTranslation(ast);
}

const modifyHTMLTextAfterTranslation = (htmlElements) => {
    let result = []
    htmlElements.forEach(obj => {
        result.push(addingTranslatedSentences(obj))
    })
    return result;
}

const addingTranslatedSentences = (data) => {
    let obj = Object.assign({}, JSON.parse(JSON.stringify(data)))
    let sourceData = JSON.parse(fs.readFileSync('./source.json', { encoding: 'utf-8' }))
    if (obj.hasOwnProperty('attrs') && obj.attrs.hasOwnProperty('id')) {
        let isPresent = sourceData.filter(val => obj.attrs.id === val.s_id)
        if (!isPresent.length && obj.hasOwnProperty('children') && obj.children.length) {
            obj.children.forEach((child, i) => {
                if (child.name !== 'img') {
                    obj.children[i] = addingTranslatedSentences(child)
                }

            })
        } else {
            obj.children.forEach((val, i) => {
                if (val.type === 'text') {
                    val.content = `${val.content} Testing...`
                } else {
                    obj.children[i] = addingTranslatedSentences(val)
                }
            })
        }
    }
    return obj;
}

module.exports = {
    htmlToDocx,
    extractSource
}