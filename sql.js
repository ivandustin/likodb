var Database = require('better-sqlite3')

class SQL {
    constructor(database) {
        this.sql = ''
        this.database = database
    }
    select(text) {
        this.sql += 'SELECT ' + text + ' '
        return this
    }
    delete() {
        this.sql += 'DELETE '
        return this
    }
    from(text) {
        this.sql += 'FROM "' + text + '" '
        return this
    }
    where(text) {
        this.sql += 'WHERE ' + text + ' '
        return this
    }
    and(text) {
        this.sql += 'AND ' + text + ' '
        return this
    }
    or(text) {
        this.sql += 'OR ' + text + ' '
        return this
    }
    orderBy(text) {
        this.sql += 'ORDER BY ' + text + ' '
        return this
    }
    asc() {
        this.sql += 'ASC '
        return this
    }
    desc() {
        this.sql += 'DESC '
        return this
    }
    limit(n) {
        this.sql += 'LIMIT ' + n + ' '
        return this
    }
    offset(n) {
        this.sql += 'OFFSET ' + n + ' '
        return this
    }
    create() {
        this.sql += 'CREATE '
        return this
    }
    table(text) {
        this.sql += 'TABLE' + (text ? '"' + text + '" ' : ' ')
        return this
    }
    unique(text) {
        this.sql += 'UNIQUE '
        return this
    }
    index(text) {
        this.sql += 'INDEX' + (text ? '"' + text + '" ' : ' ')
        return this
    }
    ifNotExists(text) {
        this.sql += 'IF NOT EXISTS "' + text + '" '
        return this
    }
    on(table, columns) {
        this.sql += 'ON "' + table + '" (' + columns.join(',') + ') '
        return this
    }
    schema(object) {
        var columns = []
        for (var key in object) {
            var value = object[key]
            columns.push(key + ' ' + value)
        }
        this.sql += '(' + columns.join(',') + ') '
        return this
    }
    insertInto(text, columns) {
        this.sql += 'INSERT INTO "' + text + '" (' + columns.join(',') + ') VALUES (' + columns.map((s)=> '@' + s).join(',') + ')'
        return this
    }
    update(text) {
        this.sql += 'UPDATE "' + text + '"'
        return this
    }
    set(columns) {
        this.sql += 'SET ' + columns.map((column)=> column + '=' + '@' + column).join(',') + ' '
        return this
    }
    prepare() {
        var statement = this.database.prepare(this.sql)
        return statement
    }
}

var database = null

var sql = function() {
    return new SQL(database)
}

sql.init = function(dbPath) {
    database = sql.database = new Database(dbPath)
    createResourcesTable()
}

function createResourcesTable() {
    sql().create().table().ifNotExists('resources').schema({
        id: 'INTEGER PRIMARY KEY',
        hierarchy: 'TEXT UNIQUE NOT NULL',
        fields: 'TEXT NOT NULL'
    }).prepare().run()
    sql().create().index().ifNotExists('resources_index').on('resources', ['hierarchy']).prepare().run()
}

module.exports = sql
