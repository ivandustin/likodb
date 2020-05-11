const http = require('http')
const assert = require('assert')
const querystring = require('querystring')
const settings = require('./settings')
const queue = require('./queue')
const preload = require('./preload')

function main() {
    var server = http.createServer(requestHandler)
    server.listen(settings.httpPort)
    handleServerErrors(server)
    return server
}

async function requestHandler(message, response) {
    if (message.method === 'OPTIONS') {
        var headers = {}
        headers["Access-Control-Allow-Origin"] = "*"
        headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS"
        headers["Access-Control-Allow-Credentials"] = false
        headers["Access-Control-Max-Age"] = '86400' // 24 hours
        headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
        response.writeHead(200, headers)
        return response.end()
    }
    decoupleQueryString(message)
    await preload.requestHandler(message, response)
    queue.requestHandler(message, response)
}

function handleServerErrors(server) {
    server.on('error', function(e) {
        console.error(e)
    })
}

function decoupleQueryString(message) {
    var url = message.url
    var parts = url.split('?')
    message.url = parts[0]
    message.query = querystring.parse(parts[1])
}

http.ServerResponse.prototype.status = function(code, msg) {
    this.statusCode = code
    if (msg) {
        if (typeof msg == 'object') {
            this.setHeader('Content-Type', 'application/json')
            this.end(JSON.stringify(msg, null, 4))
        } else {
            this.end(msg)
        }
    } else {
        this.end(http.STATUS_CODES[code])
    }
}

http.ServerResponse.prototype.ok = function(msg) {
    this.status(200, msg)
}

http.ServerResponse.prototype.badRequest = function(msg) {
    this.status(400, msg)
}

http.IncomingMessage.prototype.json = function() {
    var message = this
    assert(message.headers['content-type'] == 'application/json', 'The content-type is not application/json')
    return new Promise(function(resolve, reject) {
        var buffers = []
        message.on('data', function(buffer) {
            buffers.push(buffer)
        })
        message.on('end', function() {
            try {
                var buffer = Buffer.concat(buffers)
                var json = JSON.parse(buffer.toString())
                resolve(json)
            } catch(e) {
                reject(e)
            }
        })
    })
}

module.exports = main
