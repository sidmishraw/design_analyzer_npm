/*
 * @Author: Sidharth Mishra
 * @Date:   2017-03-27 15:41:57
 * @Last Modified by:   Sidharth Mishra
 * @Last Modified time: 2017-04-05 16:58:09
 */

'use strict'

// constants
// attributes of mdj objects
const __TYPE__ = "_type"
const __ID__ = "_id"
const __NAME__ = "name"
const __OWNEDELEMENTS__ = "ownedElements"
const __PARENT__ = "_parent"
const __REF__ = "$ref"
const __ELEMENT_TYPE__ = "type"
const __ASSOCIATION_END1__ = "end1"
const __ASSOCIATION_END2__ = "end2"
const __ASSOCIATION_REFERENCE__ = "reference"
const __NAVIGABLE__ = "navigable"
const __SOURCE__ = "source"
const __TARGET__ = "target"
const __UMLPARAMETER_DIRECTION__ = 'direction'
const __IN__ = "in"
const __RETURN__ = "return"
const __UMLPARAMETER_TYPE__ = "type"
const __OPERATIONS__ = "operations"
const __PARAMETERS__ = 'parameters'



// design analyzer metric constants
const __RESPONSIBILITY__ = "responsibility"
const __STABILITY__ = "stability"
const __DEVIANCE__ = "deviance"


// mdj types
const __UMLPACKAGE__ = "UMLPackage"
const __UMLCLASS__ = "UMLClass"
const __UMLASSOCIATION__ = "UMLAssociation"
const __UMLATTRIBUTE__ = "UMLAttribute"
const __UMLOPERATION__ = "UMLOperation"
const __PROJECT__ = "Project"
const __UMLGENERALIZATION__ = "UMLGeneralization"
const __UMLINTERFACE__ = "UMLInterface"
const __UMLMODEL__ = "UMLModel"
const __UMLASSOCIATIONEND__ = "UMLAssociationEnd"
const __UMLINTERFACEREALIZATION__ = 'UMLInterfaceRealization'
const __UMLPARAMETER__ = 'UMLParameter'


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




// Unpacks the `UMLPackage` or `UMLModel`object and extracts the `UMLClass` objects from it
// populating the __classes__ dictionary/map

/*
 * Unpacks the contents of the `UMLPackage` or `UMLModel`, adding the `UMLClass` and `UMLInterface`
 * into __classes__ dict.
 *
 * @param package_object - The package object that needs to be unpacked - `Object`
 * 
 * @return `undefined`
 */
function __unpack_package__(package_object) {

    package_object[__OWNEDELEMENTS__].map((owned_element) => {

        if ((owned_element[__TYPE__] === __UMLCLASS__) ||
            (owned_element[__TYPE__] === __UMLINTERFACE__)) {

            __classes__[owned_element[__ID__]] = owned_element
        }
    })
}



// add to __providers__
/*
* Adds the providers of the client class into the __providers__ dict with the client's ref Id as the key
* and the set of provider's ref Ids as it's value.
*
* @param client - The refId of the client class/interface whose provider is being added - `String`
* @param provider - The refID of the provider of the client that needs to be added into the set - `String`

* @return - `undefined`
*/
function __add_to_providers__(client, provider) {

    if (__providers__[client] === undefined) {

        __providers__[client] = new Set([provider])
    } else {

        __providers__[client].add(provider)
    }

    // console.log('added to providers')
}




// add to __clients__
/*
* Adds the clients of the provider class into the __clients__ dict with the provider's ref Id as the key
* and the set of client's ref Ids as it's value.
*
* @param provider - The refId of the provider class/interface whose client is being added - `String`
* @param client - The refID of the client of the provider that needs to be added into the set - `String`

* @return - `undefined`
*/
function __add_to_clients__(provider, client) {

    if (__clients__[provider] === undefined) {

        __clients__[provider] = new Set([client])
    } else {

        __clients__[provider].add(client)
    }

    // console.log('added to clients')
}




/*
 Parses the `UMLAssociation`s of a class and populates the __providers__ and __clients__ dicts.

{
    "_type": "UMLAssociation",
    "_id": "AAAAAAFbHF/qP/eiigo=",
    "_parent": {
        "$ref": "AAAAAAFbHF6zd/ZijE0="
    },
    "end1": {
        "_type": "UMLAssociationEnd",
        "_id": "AAAAAAFbHF/qQPejSMU=",
        "_parent": {
            "$ref": "AAAAAAFbHF/qP/eiigo="
        },
        "reference": {
            "$ref": "AAAAAAFbHF6zd/ZijE0="
        },
        "visibility": "public",
        "navigable": false,
        "aggregation": "none",
        "isReadOnly": false,
        "isOrdered": false,
        "isUnique": false,
        "isDerived": false,
        "isID": false
    },
    "end2": {
        "_type": "UMLAssociationEnd",
        "_id": "AAAAAAFbHF/qQPekXCI=",
        "_parent": {
            "$ref": "AAAAAAFbHF/qP/eiigo="
        },
        "reference": {
            "$ref": "AAAAAAFbHF67Wvbdnk0="
        },
        "visibility": "public",
        "navigable": true,
        "aggregation": "none",
        "isReadOnly": false,
        "isOrdered": false,
        "isUnique": false,
        "isDerived": false,
        "isID": false
    },
    "visibility": "public",
    "isDerived": false
}

 @param owned_element - The owned_element is an element in the `ownedElement` list of `UMLClass` or
 `UMLInterface` objects - `Object`

 @return - `undefined`
*/
function __build_uml_association__(owned_element) {

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
    }
}




/*
  Parses the `UMLGeneralization`s of a class and populates the __providers__ and __clients__ dicts.

{
    "_type": "UMLGeneralization",
    "_id": "AAAAAAFbP72DAb2P5WA=",
    "_parent": {
        "$ref": "AAAAAAFbHCDamPYxKtk="
    },
    "source": {
        "$ref": "AAAAAAFbHCDamPYxKtk="
    },
    "target": {
        "$ref": "AAAAAAFbP70SfLoapDs="
    },
    "visibility": "public"
}

  @param owned_element - The owned_element is an element in the `ownedElement` list of `UMLClass` or
    `UMLInterface` objects - `Object`

  @return - `undefined`
*/
function __build_uml_generalization__(owned_element) {

    if (owned_element[__TYPE__] === __UMLGENERALIZATION__) {

        let source_reference_id = owned_element[__SOURCE__][__REF__]

        let destination_reference_id = owned_element[__TARGET__][__REF__]

        if (source_reference_id === destination_reference_id) {

            throw {
                name: "Bad Diagram Error",
                message: "Bad diagram, class inheriting from itself...."
            }
        } else if ((__classes__[source_reference_id][__TYPE__] === __UMLCLASS__ &&
                __classes__[destination_reference_id][__TYPE__] === __UMLINTERFACE__) ||
            (__classes__[source_reference_id][__TYPE__] === __UMLINTERFACE__ &&
                __classes__[destination_reference_id][__TYPE__] === __UMLCLASS__)) {

            throw {
                name: "Bad Diagram Error",
                message: "Interfaces can generalize other Interfaces but \
            not classes and Classes can only realize Interfaces."
            }
        }

        __add_to_providers__(source_reference_id, destination_reference_id)
        __add_to_clients__(destination_reference_id, source_reference_id)
    }
}




/*
Parses the `UMLInterfaceRealization`s of a class and populates the __providers__ and __clients__ dicts.

{
    "_type": "UMLInterfaceRealization",
    "_id": "AAAAAAFbOvYAv74uzKw=",
    "_parent": {
        "$ref": "AAAAAAFbHF64cva0l4g="
    },
    "source": {
        "$ref": "AAAAAAFbHF64cva0l4g="
    },
    "target": {
        "$ref": "AAAAAAFbHCDamPYxKtk="
    },
    "visibility": "public"
}

  @param owned_element - The owned_element is an element in the `ownedElement` list of `UMLClass` or
    `UMLInterface` objects - `Object`

  @return - `undefined`
*/
function __build_uml_interfacerealization__(owned_element) {

    if (owned_element[__TYPE__] === __UMLINTERFACEREALIZATION__) {

        let source_reference_id = owned_element[__SOURCE__][__REF__]

        let destination_reference_id = owned_element[__TARGET__][__REF__]

        if (source_reference_id === destination_reference_id) {

            throw {
                name: "Bad Diagram Error",
                message: "Bad diagram, Interface realizing itself."
            }
        }

        __add_to_providers__(source_reference_id, destination_reference_id)
        __add_to_clients__(destination_reference_id, source_reference_id)
    }
}




/*
  Populate the __providers__ and __clients__ dict by parsing all the classes/interfaces in the 
  __classes__. The associations will be used to determine/compute the metrics [stability, 
  responsibility and deviance]

  @return - `undefined`
*/
function __build_associations__() {

    Object.keys(__classes__).map((class_id) => {

        let uml_class_obj = __classes__[class_id]

        if (uml_class_obj[__OWNEDELEMENTS__] === undefined ||
            uml_class_obj[__OWNEDELEMENTS__] === null) {

            return
        }

        uml_class_obj[__OWNEDELEMENTS__].map((owned_element) => {

            switch (owned_element[__TYPE__]) {

                case __UMLASSOCIATION__:
                    {
                        __build_uml_association__(owned_element)
                        break
                    }
                case __UMLGENERALIZATION__:
                    {
                        __build_uml_generalization__(owned_element)
                        break
                    }
                case __UMLINTERFACEREALIZATION__:
                    {
                        __build_uml_interfacerealization__(owned_element)
                        break
                    }
                default:
                    break
            }
        })
    })
}




/*

  Populate the __providers__ and __clients__ dict by parsing all the classes/interfaces in the 
  __classes__. The parameters and return types of the operations will be used to determine/compute 
  the metrics [stability, responsibility and deviance]

{
    "_type": "UMLOperation",
    "_id": "AAAAAAFbP+u6zO3hQEs=",
    "_parent": {
        "$ref": "AAAAAAFbP70SfLoapDs="
    },
    "name": "pikachuBark",
    "visibility": "public",
    "isStatic": false,
    "isLeaf": false,
    "parameters": [{
        "_type": "UMLParameter",
        "_id": "AAAAAAFbP+wigu4wNfg=",
        "_parent": {
            "$ref": "AAAAAAFbP+u6zO3hQEs="
        },
        "name": "c",
        "visibility": "public",
        "isStatic": false,
        "isLeaf": false,
        "type": {
            "$ref": "AAAAAAFbHF6zd/ZijE0="
        },
        "isReadOnly": false,
        "isOrdered": false,
        "isUnique": false,
        "direction": "in"
    }, {
        "_type": "UMLParameter",
        "_id": "AAAAAAFbP+wig+4xQpY=",
        "_parent": {
            "$ref": "AAAAAAFbP+u6zO3hQEs="
        },
        "name": "d",
        "visibility": "public",
        "isStatic": false,
        "isLeaf": false,
        "type": {
            "$ref": "AAAAAAFbHF61YPaLMOQ="
        },
        "isReadOnly": false,
        "isOrdered": false,
        "isUnique": false,
        "direction": "in"
    }, {
        "_type": "UMLParameter",
        "_id": "AAAAAAFbP+wig+4y4+I=",
        "_parent": {
            "$ref": "AAAAAAFbP+u6zO3hQEs="
        },
        "visibility": "public",
        "isStatic": false,
        "isLeaf": false,
        "type": {
            "$ref": "AAAAAAFbHF64cva0l4g="
        },
        "isReadOnly": false,
        "isOrdered": false,
        "isUnique": false,
        "direction": "return"
    }],
    "concurrency": "sequential",
    "isQuery": false,
    "isAbstract": false
}


  @return - `undefined`
*/
function __build_direct_dependencies__() {

    Object.keys(__classes__).map((class_id) => {

        let uml_class_obj = __classes__[class_id]

        if (uml_class_obj[__OPERATIONS__] === undefined ||
            uml_class_obj[__OPERATIONS__] === null) {

            return
        }

        uml_class_obj[__OPERATIONS__].map((operation) => {

            if (operation[__PARAMETERS__] === undefined ||
                operation[__PARAMETERS__] === null) {

                return
            }

            operation[__PARAMETERS__].map((parameter) => {

                let parameter_type_id = parameter[__UMLPARAMETER_TYPE__][__REF__]

                // these are cases when the parameters are of primitive UML types
                if (parameter_type_id === undefined || parameter_type_id === null) {

                    return
                }

                if ((parameter_type_id !== class_id) &&
                    ((__classes__[parameter_type_id] !== undefined) ||
                        (__classes__[parameter_type_id] !== null))) {

                    __add_to_providers__(class_id, parameter_type_id)
                    __add_to_clients__(parameter_type_id, class_id)
                }
            })
        })
    })
}




// computes stability for all classes in the package i.e __classes__
function __compute_stability__() {

    Object.keys(__classes__).map((class_id) => {

        let class_name = __classes__[class_id][__NAME__]

        // Number((6.688689).toFixed(1))
        // going to round stability to 2 decimal places
        let stability = 1 - ((__providers__[class_id] === undefined ? 0 :
            __providers__[class_id].size) / Object.keys(__classes__).length)

        stability = Number(stability.toFixed(2))

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

        // going to round responsibility to 2 decimal places
        let responsibility = (__clients__[class_id] === undefined ? 0 :
            __clients__[class_id].size) / Object.keys(__classes__).length

        responsibility = Number(responsibility.toFixed(2))

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

        // going to round deviance to 2 decimal places
        deviance = Number(deviance.toFixed(2))

        __result__[class_name][__DEVIANCE__] = deviance
    })
}




// This function starts the analysis of the parsed JSON obtained by parsing the `.mdj` file
//
// :param parsed_mdj_json: The parsed JSON obtained by parsing the `.mdj` file :class: `Object`
//
// :return: __result__ :class: `Object` (JSON)
function analyze_parsed_mdj(parsed_mdj_json) {

    if (parsed_mdj_json[__TYPE__] !== __PROJECT__) {

        throw {
            name: "Analyzer Error",
            message: "Malformed parsed JSON, missing `Project` top level object."
        }
    }

    parsed_mdj_json[__OWNEDELEMENTS__].map((owned_element) => {

        if ((owned_element[__TYPE__] === __UMLPACKAGE__) ||
            (owned_element[__TYPE__] === __UMLMODEL__)) {

            __unpack_package__(owned_element)
        }
    })

    debugger

    // build the associations
    // console.log(JSON.stringify(__classes__, null, 2))
    __build_associations__()

    // build operations dependence and factor them into computation for
    // stability, responsibility and deviance
    __build_direct_dependencies__()

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
module.exports.RESPONSIBILITY = __RESPONSIBILITY__
module.exports.STABILITY = __STABILITY__
module.exports.DEVIANCE = __DEVIANCE__
