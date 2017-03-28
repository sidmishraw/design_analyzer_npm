/*
 * @Author: Sidharth Mishra
 * @Date:   2017-03-27 15:41:57
 * @Last Modified by:   Sidharth Mishra
 * @Last Modified time: 2017-03-27 17:05:16
 */

'use strict'

// constants
const __TYPE__ = "_type"
const __ID__ = "_id"
const __NAME__ = "name"
const __OWNEDELEMENTS__ = "ownedElements"
const __PARENT__ = "_parent"
const __REF__ = "$ref"
const __ELEMENT_TYPE__ = "type"
const __UMLPACKAGE__ = "UMLPackage"
const __UMLCLASS__ = "UMLClass"
const __UMLASSOCIATION__ = "UMLAssociation"
const __UMLASSOCIATIONEND__ = "UMLAssociationEnd"
const __UMLATTRIBUTE__ = "UMLAttribute"
const __UMLOPERATION__ = "UMLOperation"
const __PROJECT__ = "Project"




// globals
var __classes__ = {}
var __associations__ = {}
var __attributes__ = {}
var __methods__ = {}




function __unpack_package__(package_object) {

    console.log(`unpacking package : ${package_object[__NAME__]}`)

    package_object[__OWNEDELEMENTS__].map((owned_element) => {

        if (owned_element[__TYPE__] === __UMLCLASS__) {

            __classes__[owned_element[__ID__]] = owned_element
        }
    })
}




// This function starts the analysis of the parsed JSON obtained by parsing the `.mdj` file
//
// :param parsed_mdj_json: The parsed JSON obtained by parsing the `.mdj` file :class: `Object`
//
function analyze_parsed_mdj(parsed_mdj_json) {

    if (parsed_mdj_json[__TYPE__] !== __PROJECT__) {

        throw {
            name: "Analyzer Error",
            message: "Malformed parsed JSON, missing `Project` top level object."
        }
    }

    parsed_mdj_json[__OWNEDELEMENTS__].map((owned_element) => {

        if (owned_element[__TYPE__] === __UMLPACKAGE__) {

            __unpack_package__(owned_element)
        }
    })

    console.log(JSON.stringify(__classes__, null, 4))
}




// module exports
// using this syntax since NodeJS still doesn't support
// ES6 export/import syntax
module.exports.TYPE = __TYPE__
module.exports.ID = __ID__
module.exports.NAME = __NAME__
module.exports.OWNEDELEMENTS = __OWNEDELEMENTS__
module.exports.PARENT = __PARENT__
module.exports.REF = __REF__
module.exports.analyze_parsed_mdj = analyze_parsed_mdj
