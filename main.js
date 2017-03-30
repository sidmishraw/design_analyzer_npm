/*
 * @Author: Sidharth Mishra
 * @Date:   2017-03-26 21:24:49
 * @Last Modified by:   Sidharth Mishra
 * @Last Modified time: 2017-03-30 15:01:57
 */

'use strict'



// NodeJS specific imports
const fs = require('fs')
const readline = require('readline')
const util = require('util')

// adding console.table for table like formatting in CLI.
require('console.table')




// design analyzer specfic imports
const danalyzer = require("./analyzer.js")




// set stdin and stdout as the IO for this application
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const codec = 'utf8'




// constants
const __CLASS__ = "class"
const RESPONSIBILITY = danalyzer.RESPONSIBILITY
const STABILITY = danalyzer.STABILITY
const DEVIANCE = danalyzer.DEVIANCE



// creates the output table structure from the result JSON obtained
function display_table(result) {

    let table_result = []

    Object.keys(result).map((class_name) => {

        let table_row = {}

        table_row[__CLASS__] = class_name
        table_row[RESPONSIBILITY] = result[class_name][RESPONSIBILITY]
        table_row[STABILITY] = result[class_name][STABILITY]
        table_row[DEVIANCE] = result[class_name][DEVIANCE]

        table_result.push(table_row)
    })

    console.table(table_result)
}




// analyzes the `.mdj` file to compute the design metrics
function analyze(filename) {

    if (!filename) {

        console.log('Please enter a filename to analyze.')

        return false
    }

    let project_structure = null

    fs.readFile(filename, codec, (err, contents) => {

        if (err) throw err;

        project_structure = JSON.parse(contents)

        if (!project_structure) {

            console.log('The file may be bad! Please check!')
            return false
        }

        let result = danalyzer.analyze_parsed_mdj(project_structure)

        console.log(`Design metrics for ${filename}:`)
        console.log(JSON.stringify(result, null, 4));
        display_table(result)
    })

    return true
}




// point of entry for this application
function main() {

    console.log(':::Design Analyzer:::')

    rl.question('Enter file name:', (filename) => {

        let status = analyze(filename)

        rl.close()

        if (!status) {

            console.log('The file has some problem!')

            return
        }
    })
}



main()
