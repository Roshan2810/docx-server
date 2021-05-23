const fs = require('fs');

const refactorSourceJSON = (sourceJson) => {
    let index = -1
    let refactoredOutput = []
    sourceJson.data.forEach(src => {
        src.text_blocks.forEach(val => {
            if (val.attrib !== 'TABLE' && val.attrib !== 'BOLD,TABLE') {
                refactoredOutput.push(val)
            } else if (val.attrib === 'TABLE' || val.attrib === 'BOLD,TABLE') {
                if (index !== val.table_index) {
                    refactoredOutput.push({ attrib: 'TABLE_DATA', index: val.table_index, childrens: [val] })
                    index = val.table_index
                } else {
                    refactoredOutput[refactoredOutput.length - 1].childrens.push(val)
                }
            }
        })
    })
    return refactoredOutput;
}

const generateTableArray = (data) => {
    let tableArray = []
    let columns = []
    let rows = []
    let row_index = 0
    data.childrens.forEach(child => {
        if (child.cell_index[0] === 0) {
            let tgt = tokenized_sentences.map(val => val.tgt)
            columns.push({
                val: tgt.join(' '),
                opts: {
                    b: true,
                    sz: child.font_size + 'pt',
                    fontFamily: child.font_family
                }
            })
        } else if (row_index !== child.cell_index[0]) {
            let tgt = tokenized_sentences.map(val => val.tgt)
            if (columns.length) {
                tableArray.push(columns)
                columns = []
            }
            if (rows.length) {
                tableArray.push(rows)
                rows = []
            }
            rows.push(tgt.join(' '))
            row_index = child.cell_index[0]
        } else if (row_index === child.cell_index[0]) {
            rows.push(tgt.join(' '))
        }
    })
    return tableArray;
}
module.exports = {
    refactorSourceJSON,
    generateTableArray
}