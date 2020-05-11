#!/usr/bin/env node
const package = require('./package.json')
const settings = require('./settings')
const http = require('./http')
const sql = require('./sql')

function main() {
    var argv = process.argv.slice(2)
    processArguments(argv)
    sql.init(settings.dbPath)
    http()
}

function processArguments(argv) {
    getopt(argv, function(option, value) {
        switch(option) {
            case 'help':
                console.log('Usage: likodb <database path>')
                console.log('Example: likodb path/to/database.likodb')
                console.log('')
                console.log('likodb - %s', package.description)
                process.exit(0)
            case 'V':
                console.log('%s %s', package.name, package.version)
                console.log('Copyright (C) 2020 Ivan Dustin B. Bilon')
                console.log('')
                console.log('This program is free software; you can redistribute it and/or modify')
                console.log('it under the terms of the GNU General Public License as published by')
                console.log('the Free Software Foundation; either version 3 of the License, or')
                console.log('(at your option) any later version.')
                console.log('')
                console.log('This program is distributed in the hope that it will be useful,')
                console.log('but WITHOUT ANY WARRANTY; without even the implied warranty of')
                console.log('MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the')
                console.log('GNU General Public License for more details.')
                console.log('')
                console.log('You should have received a copy of the GNU General Public License')
                console.log('along with this program. If not, see http://www.gnu.org/licenses/.')
                console.log('')
                console.log('GRACE AND PEACE TO YOU FROM OUR LORD JESUS CHRIST')
                process.exit(0)
            default:
                settings.dbPath = value
        }
    })
}

function getopt(argv, handle) {
    for(var i=0; i<argv.length; i++) {
        var arg = argv[i]
        var opt = '', value = ''
        if (!arg) return
        if (arg[0] == '-' && arg.length == 2) {
            opt = arg[1]
            value = argv[i+1]
        } else if (arg.substring(0, 2) == '--') {
            opt = arg.substring(2)
            value = argv[i+1]
        } else {
            opt = null
            value = arg
        }
        var hasValue = handle(opt, value)
        if (hasValue) i++
    }
}

main()
