const uglify = require('uglify-es')

console.log(uglify.minify(__dirname+'\\example.js',{}))
