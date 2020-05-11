async function requestHandler(message, response) {
    if (message.method == 'POST' || message.method == 'PUT') {
        message.data = await message.json()
    }
}

module.exports = {
    requestHandler: requestHandler
}
