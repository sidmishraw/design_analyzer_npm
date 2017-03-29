/*
 * @Author: Sidharth Mishra
 * @Date:   2017-03-26 21:24:49
 * @Last Modified by:   Sidharth Mishra
 * @Last Modified time: 2017-03-28 22:35:05
 */

'use strict'



// NodeJS specific imports
const fs = require('fs')
const readline = require('readline')




// design analyzer specfic imports
const danalyzer = require("./analyzer.js")




// set stdin and stdout as the IO for this application
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const codec = 'utf8'




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
