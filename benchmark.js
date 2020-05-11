function intersection(a1, a2) {
    var a = []
    for (var i = 0; i < a1.length; i++) {
        var x = a1[i]
        if (~a2.indexOf(x))
            a.push(x)
    }
    return a
}

function keys(object) {
    var a = []
    for (var key in object)
        a.push(key)
    return a
}

function test1() {
    var a = {a: null, b: null, c: null}
    var b = {a: null, c: null}
    return intersection(Object.keys(a), Object.keys(b))
}

function test2() {
    var a = {a: null, b: null, c: null}
    var b = {a: null, c: null}
    return intersection(keys(a), keys(b))
}

function benchmark(fn) {
    var start = new Date()
    for (var i = 0; i < 1000000; i++)
        fn()
    var end = new Date()
    console.log('%s: %dms', fn.toString().substring(9, 14), end - start)
}

benchmark(test1)
benchmark(test2)