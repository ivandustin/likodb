const http = require('http')
const assert = require('assert')
const schema = require('./schema')
const resource = require('./resource')

function main() {
    return {
        requestHandler: requestHandler
    }
}

async function requestHandler(message, response) {
    try {
        assert(isHTTPMethodSupported(message), 'HTTP method not supported')
        message.resource = getResource(message.normalizedURL)
        message.resourceID = getResourceID(message.normalizedURL)
        message.resourceHierarchy = getResourceHierarchy(message.normalizedURL)
        if (schema.isRequestSchema(message)) {
            await schema.handleRequest(message, response)
        } else {
            await resource.handleRequest(message, response)
        }
    } catch(e) {
        console.error(e)
        response.badRequest(e.message)
    }
}

function isHTTPMethodSupported(message) {
    var method = message.method
    return method == 'GET' || method == 'POST' || method == 'PUT' || method == 'DELETE'
}

function getResource(normalizedURL) {
    var len = normalizedURL.length
    if (len % 2 == 0)
        return normalizedURL.slice(0, len - 1).join('/')
    return normalizedURL.join('/')
}

function hasResourceID(normalizedURL) {
    return normalizedURL.length % 2 == 0
}

function getResourceID(normalizedURL) {
    var len = normalizedURL.length
    if (len % 2 == 0)
        return normalizedURL[len - 1]
    return null
}

function getResourceHierarchy(normalizedURL) {
    var len = normalizedURL.length
    var resources = []
    for (var i = 0; i < len; i += 2) {
        var resource = normalizedURL[i]
        resources.push(resource)
    }
    return resources.join('/')
}

function status(response, code, msg) {
    response.statusCode = code
    if (msg) {
        if (typeof msg == 'object') {
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify(msg, null, 4))
        } else {
            response.end(msg)
        }
    } else {
        response.end(http.STATUS_CODES[code])
    }
}

function ok(response, msg) {
    status(response, 200, msg)
}

function badRequest(response, msg) {
    status(response, 400, msg)
}

module.exports = main()
