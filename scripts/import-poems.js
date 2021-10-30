// Imports poems into the dummy server.

const xlsx = require('xlsx');
const path = require('path');
const crypto = require("crypto");
const fs = require('fs');

const POEMS_DIR = 'apollo-server/poems'
const PROCESSED_POEMS_FNAME = 'processed.json';

const PROCESSED_POEMS_PATH = path.join(POEMS_DIR, PROCESSED_POEMS_FNAME);

// We could generate this table using BlockType and StressType from the Constants file,
// but sharing code between the app and this script is... difficult.
// This is because the app uses webpack while this script simply uses node.
// There are advantages and disadvantages to using a framework, I suppose.
const SYMBOL_TABLE = {
    'u/': 'i',
    '/u': 't',
    '/uu': 'd',
    'uu/': 'a',
    '//': 's',
    'uu': 'p',
}

const LINE_LENGTH = 5;
const DIV_SMALL = '===================================================';
const DIV_LARGE = '\n';

const FALLBACK_BLOCK = 'i';

function parseStanzas(stanzaStr) {
    return stanzaStr.split(',').map(str => parseInt(str));
}

function parsePoem(worksheet) {
    // Worksheet format:
    // One line of 5 columns, each column describing the stresses of the foot
    // u for unstressed, / for stressed
    // Next line is also 5 column, with each containing text corresponding to a foot
    let data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    let lines = [];
    let lineIndex = 0;
    let numErrors = 0;
    for(let i = 0; i < data.length; i += 2) {
        // Skip empty line
        if (data[i].length == 0) continue;
        // Read in array of block types, then convert to code string
        const lineKey = data[i].slice(0, LINE_LENGTH).map((sym, symIndex) => {
            const blockCode = SYMBOL_TABLE[sym];
            if (!blockCode) {
                console.error(`Invalid stress pattern: ${sym} (Line: ${lineIndex+1}) (Foot: ${symIndex+1})`);
                numErrors += 1;
                return FALLBACK_BLOCK;
            }
            return blockCode;
        }).join('');
        // Check line length
        if (lineKey.length !== LINE_LENGTH) {
            console.error(`Invalid line length: ${lineKey.length} (Line: ${lineIndex})`);
            numErrors += 1;
        }
        const lineText = data[i+1].slice(0, LINE_LENGTH).join(' ');
        // Construct line
        const line = { text: lineText, key: lineKey };
        lines.push(line);
        lineIndex += 1;
    }
    // Construct poem
    return [{ lines }, numErrors];
}

function importPoems(inputPath, author, stanzas) {

    // Output status
    console.log(`Importing poems from: ${inputPath}`);
    console.log(DIV_LARGE);

    // Load workbook from unprocessed poem file
    const workbook = xlsx.readFile(inputPath);

    let stanzaBreaks = [];
    let line = stanzas[0];
    for (let stanzaSize of stanzas.slice(1)) {
        stanzaBreaks.push(line);
        line += stanzaSize;
    }
    const totalLines = line;

    let totalErrors = 0;
    const poems = workbook.SheetNames
        .map(name => {
                let [poem, numErrors] = parsePoem(workbook.Sheets[name]);
                // Check number of lines; if invalid, throw error
                // If valid, we can mark stanza breaks
                if (poem.lines.length !== totalLines) {
                    console.error(`Invalid line count: ${poem.lines.length}`);
                    numErrors += 1;
                }
                else {
                    for (let stanzaBreak of stanzaBreaks) {
                        poem.lines[stanzaBreak].stanzaBreak = true;
                    }
                }
                poem.name = `Sonnet ${name}`;
                poem.author = author;
                poem.id = crypto.randomBytes(8).toString('hex');
                // Output poem-specific error statistics
                if (numErrors > 0) {
                    console.error(`Encountered ${numErrors} error(s) while processing poem: ${name}`);
                    console.error(DIV_SMALL);
                }
                totalErrors += numErrors;

                return poem;
            });

    // Output statistics
    console.log(DIV_LARGE);
    console.log('Done!');
    console.log(`Total poems: ${poems.length}`);
    console.log(`Total errors: ${totalErrors}`);

    // Dump to processed poems
    const data = JSON.stringify(poems, null, 2);
    fs.writeFile(PROCESSED_POEMS_PATH, data, err => {
        if (err) throw err;
    });

}

// Parse arguments
// TODO IMPROVEMENT Can use actual arg parser
let args = process.argv.slice(2);
let inputPath = path.join(POEMS_DIR, args[0]);
let author = args[1];
let stanzas = parseStanzas(args[2]);
importPoems(inputPath, author, stanzas);