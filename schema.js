const util = require('util')
const assert = require('assert')
const sql = require('./sql')
const datatypes = ['integer', 'real', 'text']
const idDatatypes = ['integer', 'text']

function isRequestSchema(message) {
    return message.normalizedURL.length > 0 && message.normalizedURL[0] == 'resources'
}

async function handleRequest(message, response) {
    if (message.method == 'GET') {
        response.ok(getResources())
    } else if (message.method == 'POST') {
        let resource = await message.json()
        validate(resource)
        addResource(resource)
        response.ok()
    } else {
        response.badRequest()
    }
}

function addResource(resource) {
    sql().insertInto('resources', ['hierarchy', 'fields']).prepare().run({
        hierarchy: resource.hierarchy,
        fields: JSON.stringify(resource.fields)
    })
}

function getResources() {
    return sql().select('*').from('resources').prepare().all()
}

function validate(resource) {
    assert(resource.hierarchy, 'Missing hierarchy')
    assert(resource.hierarchy.match(/^[a-z]+(\/[a-z]+)*$/), 'Invalid hierarchy')
    assert(resource.fields, 'Missing fields')
    assert(resource.fields.id, 'Missing fields.id')
    assert(~idDatatypes.indexOf(resource.fields.id), 'Invalid fields.id datatype')
    for (var key in resource.fields) {
        var value = resource.fields[key]
        assert(~datatypes.indexOf(value), util.format('Invalid fields.%s datatype', key))
    }
}

module.exports = {
    isRequestSchema: isRequestSchema,
    handleRequest: handleRequest
}
