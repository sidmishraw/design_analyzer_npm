/*
 * @Author: Sidharth Mishra
 * @Date:   2017-03-27 15:41:57
 * @Last Modified by:   Sidharth Mishra
 * @Last Modified time: 2017-03-28 22:44:56
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
const __ASSOCIATION_END1__ = "end1"
const __ASSOCIATION_END2__ = "end2"
const __ASSOCIATION_REFERENCE__ = "reference"
const __NAVIGABLE__ = "navigable"
const __UMLGENERALIZATION__ = "UMLGeneralization"
const __SOURCE__ = "source"
const __TARGET__ = "target"
const __RESPONSIBILITY__ = "responsibility"
const __STABILITY__ = "stability"
const __DEVIANCE__ = "deviance"




// globals
// dict containing the mapping between class `_id` and the class objects
var __classes__ = {}

// dicts containing the mapping between class `_id` and their providers
// this can be made by clubbing together all the association endpoint references
// for a particular class `_id`, these will be used to compute the metrics
var __providers__ = {}
var __clients__ = {}
var __result__ = {}

// might not be used in this phase of the application
var __associations__ = {}
var __attributes__ = {}
var __methods__ = {}




// Unpacks the `UMLPackage` object and extracts the `UMLClass` objects from it
// populating the __classes__ dictionary/map
function __unpack_package__(package_object) {

    package_object[__OWNEDELEMENTS__].map((owned_element) => {

        if (owned_element[__TYPE__] === __UMLCLASS__) {

            __classes__[owned_element[__ID__]] = owned_element
        }
    })
}




// add to __providers__
function __add_to_providers__(provider_of, the_provider) {

    if (__providers__[provider_of] === undefined) {

        __providers__[provider_of] = [the_provider]
    } else {

        __providers__[provider_of].push(the_provider)
    }

    // console.log('added to providers')
}




// add to __clients__
function __add_to_clients__(client_of, the_client) {

    if (__clients__[client_of] === undefined) {

        __clients__[client_of] = [the_client]
    } else {
        __clients__[client_of].push(the_client)
    }

    // console.log('added to clients')
}




// populate the __providers__ and __clients__ dict by parsing all the classes in the __classes__
// the associations will be used to determine/compute the metrics [stability, responsibility
// and deviance]
function __build_associations__() {

    Object.keys(__classes__).map((class_id) => {

        let uml_class_obj = __classes__[class_id]

        uml_class_obj[__OWNEDELEMENTS__].map((owned_element) => {

            if (owned_element[__TYPE__] === __UMLASSOCIATION__) {

                let source_reference_id = owned_element[__ASSOCIATION_END1__]
                    [__ASSOCIATION_REFERENCE__][__REF__]

                let destination_reference_id = owned_element[__ASSOCIATION_END2__]
                    [__ASSOCIATION_REFERENCE__][__REF__]

                if (source_reference_id !== destination_reference_id) {

                    if (owned_element[__ASSOCIATION_END1__][__NAVIGABLE__]) {

                        __add_to_providers__(destination_reference_id, source_reference_id)
                        __add_to_clients__(source_reference_id, destination_reference_id)
                    }

                    __add_to_providers__(source_reference_id, destination_reference_id)
                    __add_to_clients__(destination_reference_id, source_reference_id)
                }
            } else if (owned_element[__TYPE__] === __UMLGENERALIZATION__) {

                let source_reference_id = owned_element[__SOURCE__][__REF__]

                let destination_reference_id = owned_element[__TARGET__][__REF__]

                if (source_reference_id === destination_reference_id) {

                    throw {
                        name: "Bad Diagram Error",
                        message: "Bad diagram, class inheriting from itself...."
                    }
                }

                __add_to_providers__(source_reference_id, destination_reference_id)
                __add_to_clients__(destination_reference_id, source_reference_id)
            }
        })
    })
}




// computes stability for all classes in the package i.e __classes__
function __compute_stability__() {

    Object.keys(__classes__).map((class_id) => {

        let class_name = __classes__[class_id][__NAME__]

        let stability = 1 - ((__providers__[class_id] === undefined ? 0 :
            __providers__[class_id].length) / Object.keys(__classes__).length)

        // console.log(stability)

        if (__result__[class_name] === undefined) {

            __result__[class_name] = {
                [__STABILITY__]: stability
            }
        } else {

            __result__[class_name][__STABILITY__] = stability
        }
    })
}




// computes the responsibility of all classes in the package i.e __classes__
function __compute_responsibility__() {

    Object.keys(__classes__).map((class_id) => {

        let class_name = __classes__[class_id][__NAME__]

        let responsibility = (__clients__[class_id] === undefined ? 0 :
            __clients__[class_id].length) / Object.keys(__classes__).length

        // console.log(responsibility)

        if (__result__[class_name] === undefined) {

            __result__[class_name] = {
                [__RESPONSIBILITY__]: responsibility
            }
        } else {

            __result__[class_name][__RESPONSIBILITY__] = responsibility
        }
    })
}




// computes the deviance of all classes in the package i.e __classes__
function __compute_deviance__() {

    if (Object.keys(__result__).length === 0) {
        throw {
            name: "Deviance Computation Error",
            message: "Please compute the responsibility and stability before computing deviance"
        }
    }

    Object.keys(__result__).map((class_name) => {

        // deviance(A) = |responsibility(A) – stability(A)|
        let deviance = Math.abs(__result__[class_name][__RESPONSIBILITY__] -
            __result__[class_name][__STABILITY__])

        __result__[class_name][__DEVIANCE__] = deviance
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

    // build the associations
    __build_associations__()
    // :todo: build operations dependence and factor them into computation for
    // stability, responsibility and deviance

    // compute the metrics
    __compute_stability__()
    __compute_responsibility__()
    __compute_deviance__()

    return __result__
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
