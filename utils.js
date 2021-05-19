const fs = require('fs');
const htmlDocx = require("html-to-docx");
let htmlString = ""
const HTML = require('html-parse-stringify')
const { v4: uuidv4 } = require('uuid');
// let table_index = -1

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
    fs.writeFileSync('./throughUI.json', JSON.stringify(result.result))
    let htmlData = HTML.stringify(result.result)
    fs.writeFileSync('./new.html', htmlData)
}


const traverseChildren = (htmlObjects) => {
    let data = []
    data = htmlObjects.map(obj => {
        return recursivelyAddingId(obj)
    })
    // data = extractSource(data)
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


const getTag = (isBold, fontSize) => {
    if (isBold) {
        if (fontSize > 24) {
            return 'h1'
        } else if (fontSize > 24) {
            return 'h2'
        } else if (fontSize > 18.72) {
            return 'h3'
        } else if (fontSize > 16) {
            return 'h4'
        } else if (fontSize > 13.28) {
            return 'h5'
        } else {
            return 'h6'
        }
    }
    return 'p';
}

const getTableData = (tableData, tokens, row, previous_row, col, previous_col) => {
    let result = []
    tokens !== undefined && tokens.tokenized_sentences.forEach(data => {
        if (row === 0 && previous_row === -1) {
            result.push({
                type: 'tag',
                name: 'tr',
                voidElement: false,
                attrs: {
                    id: data.s_id,

                },
                children: [
                    {
                        type: 'tag',
                        name: 'th',
                        voidElement: false,
                        attrs: {
                            id: data.s_id,
                        },
                        children: [
                            {
                                type: 'text',
                                content: data.s0_tgt
                            }
                        ]
                    }
                ]
            })
        } else if (row === 0 && row === previous_row && col !== previous_col) {
            tableData[row].children.push({
                type: 'tag',
                name: 'th',
                voidElement: false,
                attrs: {
                    id: data.s_id,
                },
                children: [
                    {
                        type: 'text',
                        content: data.s0_tgt
                    }
                ]
            })
        } else if (row !== previous_row) {
            result.push({
                type: 'tag',
                name: 'tr',
                voidElement: false,
                attrs: {
                    id: data.s_id,
                },
                children: [
                    {
                        type: 'tag',
                        name: 'td',
                        voidElement: false,
                        attrs: {
                            id: data.s_id,
                        },
                        children: [
                            {
                                type: 'text',
                                content: data.s0_tgt
                            }
                        ]
                    }
                ]
            })
        } else {
            tableData[row].children.push({
                type: 'tag',
                name: 'td',
                voidElement: false,
                attrs: {
                    id: data.s_id,
                },
                children: [
                    {
                        type: 'text',
                        content: data.s0_tgt
                    }
                ]
            })
        }

    })
    return result;
}

const convertJSONToHTML = async () => {
    let jsonData = fs.readFileSync('./source.json', { encoding: 'utf-8' });
    let parsedData = JSON.parse(jsonData);
    let htmlObjects = []
    let tableArrOfObj = []
    let previous_row = -1
    let previous_col = -1
    parsedData.data.forEach((textBlocks) => {
        let table_index = -1
        let index = 0;
        textBlocks.text_blocks.forEach((tokens, i) => {
            const is_bold = tokens.attrib === 'BOLD' ? true : false;
            const is_table = tokens.attrib === 'TABLE' || tokens.attrib === 'BOLD,TABLE' ? true : false
            const { font_color, font_size } = tokens
            tokens.tokenized_sentences.forEach(token => {
                if (!is_table) {
                    if (tableArrOfObj.length) {
                        htmlObjects.push({
                            type: "tag",
                            name: 'table',
                            voidElement: false,
                            attrs: {
                                id: textBlocks.text_blocks[i].block_identifier
                            },
                            children: tableArrOfObj
                        })
                        tableArrOfObj = []
                    }
                    htmlObjects.push({
                        type: "tag",
                        name: `${getTag(is_bold, font_size)}`,
                        voidElement: false,
                        attrs: {
                            id: token.s_id,
                            style: `font-size:${16}px; font-family:MS Unicode Arial; color:${font_color}`
                        },
                        children: [
                            {
                                type: "text",
                                content: String(token.s0_tgt)
                            }
                        ]
                    })
                } else {
                    if (table_index !== textBlocks.text_blocks[i].table_index && table_index === -1) {
                        // console.log('if', textBlocks.text_blocks[i].table_index)
                        table_index = textBlocks.text_blocks[i].table_index
                        let row = textBlocks.text_blocks[i].cell_index[0]
                        let col = textBlocks.text_blocks[i].cell_index[1]
                        tableArrOfObj.push(...getTableData(tableArrOfObj, textBlocks.text_blocks[i], row, previous_row, col, previous_col))
                        previous_row = row
                        previous_col = col
                    } else if (table_index === textBlocks.text_blocks[i].table_index) {
                        // console.log('first else if', textBlocks.text_blocks[i].table_index)
                        let row = textBlocks.text_blocks[i].cell_index[0]
                        let col = textBlocks.text_blocks[i].cell_index[1]
                        tableArrOfObj.push(...getTableData(tableArrOfObj, textBlocks.text_blocks[i], row, previous_row, col, previous_col))
                        previous_row = row
                        previous_col = col
                    }
                    else if (table_index !== textBlocks.text_blocks[i].table_index) {
                        // console.log('final else if', textBlocks.text_blocks[i].table_index)
                        htmlObjects.push({
                            type: "tag",
                            name: 'table',
                            voidElement: false,
                            attrs: {
                                id: textBlocks.text_blocks[i].block_identifier
                            },
                            children: tableArrOfObj
                        })
                        tableArrOfObj = []
                        let row = textBlocks.text_blocks[i].cell_index[0]
                        let col = textBlocks.text_blocks[i].cell_index[1]
                        previous_row = -1
                        previous_col = -1
                        table_index = textBlocks.text_blocks[i].table_index
                        tableArrOfObj.push(...getTableData(tableArrOfObj, textBlocks.text_blocks[i], row, previous_row, col, previous_col))
                        previous_row = row
                        previous_col = col
                    }
                }
                index = i
            })
        })
        if (tableArrOfObj.length) {
            htmlObjects.push({
                type: "tag",
                name: 'table',
                voidElement: false,
                attrs: {
                    id: textBlocks.text_blocks[index].block_identifier
                },
                children: tableArrOfObj
            })
            tableArrOfObj = []
        }
    })
    fs.writeFileSync('./newSource.json', JSON.stringify(htmlObjects))
    let htmlData = HTML.stringify(htmlObjects)
    fs.writeFileSync('./new.html', htmlData)
    const fileBuffer = await htmlDocx(htmlData, null, {
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
}

module.exports = {
    htmlToDocx,
    extractSource,
    convertJSONToHTML
}