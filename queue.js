const path = require('path')
const receive = require('./receive')

class RequestQueue {
    constructor(handler) {
        this.handler = handler
        this.reset()
    }
    reset() {
        this.hash = {}
        this.timer = null
        this.count = 0
        this.lastCount = -1
    }
    enqueue(group, message, response) {
        this.count++
        if (!this.hash[group])
            this.hash[group] = []
        this.hash[group].push([message, response])
        this.schedule()
    }
    tryConsume() {
        if (this.count >= 100000 || this.count == this.lastCount) {
            this.consume()
            this.reset()
        } else {
            this.lastCount = this.count
            this.reschedule()
        }
    }
    consume() {
        for (var group in this.hash) {
            var queue = this.hash[group]
            for (var i = 0; i < queue.length; i++) {
                var a = queue[i]
                var message = a[0]
                var response = a[1]
                this.handler(message, response)
            }
        }
    }
    schedule() {
        if (this.timer === null) {
            this.timer = setTimeout(this.tryConsume.bind(this), 0)
        }
    }
    reschedule() {
        this.timer = null
        this.schedule()
    }
}

function main() {
    var requestQueue = new RequestQueue(receive.requestHandler)
    var requestHandler = createRequestHandler(requestQueue)
    return {
        requestHandler: requestHandler
    }
}

function createRequestHandler(requestQueue) {
    return function(message, response) {
        handleMessageErrors(message)
        message.normalizedURL = normalizeURL(message.url)
        var requestGroup = getRequestGroup(message)
        requestQueue.enqueue(requestGroup, message, response)
    }
}

function normalizeURL(url) {
    return path.posix.normalize(decodeURI(url).toLowerCase()).split(path.posix.sep).filter((str) => str != '')
}

function getRequestGroup(message) {
    return message.method + message.normalizedURL.join()
}

function handleMessageErrors(message) {
    message.on('error', function(e) {
        console.error(e)
    })
}

module.exports = main()
