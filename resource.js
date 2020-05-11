const assert = require('assert')
const settings = require('./settings')
const sql = require('./sql')

function handleRequest(message, response) {
    let schema = getSchema(message.resourceHierarchy)
    assert(schema !== undefined, 'Resource not found')
    if (message.method == 'GET') {
        if (message.resourceID == null) {
            try {
                response.ok(index(message.resource, message.query.offset))
            } catch(e) {
                response.ok([])
            }
        } else {
            let resource = get(message.resource, message.resourceID)
            assert(resource, 'Resource not found')
            response.ok(resource)
        }
    } else if (message.method == 'POST') {
        var insertedID = null
        var columns = Object.keys(schema.fields)
        try {
            insertedID = post(message.data, message.resource, columns)
        } catch(e) {
            if (~e.message.indexOf('no such table')) {
                createTable(message.resource, schema.fields)
                insertedID = post(message.data, message.resource, columns)
            } else {
                throw(e)
            }
        }
        if (schema.fields.id == 'integer') {
            response.ok(insertedID)
        } else {
            response.ok(Array.isArray(message.data) ? [] : {})
        }
    } else if (message.method == 'PUT') {
        assert(message.resourceID !== null, 'Specify resource ID')
        var columns = intersection(Object.keys(schema.fields), Object.keys(message.data).filter((column)=> column != 'id'))
        assert(columns.length != 0, 'No input')
        put(message.data, message.resource, message.resourceID, columns)
        response.ok()
    } else if (message.method == 'DELETE') {
        assert(message.resourceID !== null, 'Specify resource ID')
        del(message.resource, message.resourceID)
        response.ok()
    } else {
        response.badRequest()
    }
}

function getSchema(hierarchy) {
    var schema = sql().select('*').from('resources').where('hierarchy=?').prepare().get(hierarchy)
    if (schema)
        schema.fields = JSON.parse(schema.fields)
    return schema
}

function createTable(name, fields) {
    fields.id += ' primary key'
    sql().create().table(name).schema(fields).prepare().run()
}

function index(resource, offset) {
    var query = sql().select('*').from(resource).orderBy('rowid').desc().limit(settings.indexLimit)
    if (offset)
        return query.offset('?').prepare().bind(offset).all()
    return query.prepare().all()
}

function get(resource, id) {
    return sql().select('*').from(resource).where('id=?').prepare().get(id)
}

function post(data, resource, columns) {
    var statement = sql().insertInto(resource, columns).prepare()
    if (Array.isArray(data)) {
        let ids = []
        sql.database.transaction(function(array) {
            for (var data of array) {
                let info = statement.run(data)
                ids.push({
                    id: info.lastInsertRowid
                })
            }
        })(data)
        return ids
    } else {
        let info = statement.run(data)
        return {
            id: info.lastInsertRowid
        }
    }
}

function del(resource, id) {
    sql().delete().from(resource).where('id=?').prepare().run(id)
}

function put(data, resource, id, columns) {
    sql().update(resource).set(columns).where('id=?').prepare().run(id, data)
}

function intersection(a1, a2) {
    var a = []
    for (var i = 0; i < a1.length; i++) {
        var x = a1[i]
        if (~a2.indexOf(x))
            a.push(x)
    }
    return a
}

module.exports = {
    handleRequest: handleRequest
}
