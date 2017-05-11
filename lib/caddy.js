const fork = require('child_process').fork
const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')

// grab a copy of template
const template = fs.readFileSync(path.join(__dirname, 'template.js'))
// define a fileChanged function
let fileChanged = (inputFile, outputFile, callback) => {
  // create some storage vars
  let watchdog = null
  let result = null
  // create a child process to run script
  let gopher = fork(path.join(__dirname, 'gopher'))
    .on('message', msg => {
      // store message and terminate child
      result = msg
      gopher.kill()
    })
    .on('exit', (code, signal) => {
      if (watchdog) { clearTimeout(watchdog) }
      if (typeof callback === 'function') {
        callback(result.error || null)
      }
    })

// start watchdog
  watchdog = setTimeout(() => {
    gopher.kill() // ouch
    throw new Error(`Running script took longer than 5 seconds.`)
  }, 5000)

// send path to get gopher started
  gopher.send([inputFile, outputFile])
}

let watch = file => {
  // create file from template if it does not exist
  fs.writeFileSync(file, template, {flags: 'wx'})
  // determine output file path
  let p = path.parse(file)
  let outputFile = path.join(p.dir, `${p.name}.caddy${p.ext}`)
  // force-call change function
  fileChanged(file, outputFile, () => {
  // start wathcing files for changes
    chokidar.watch(file)
    .on('change', () => { fileChanged(file, outputFile) })
    .on('error', (err) => { throw err })
  })
}

module.exports = {watch}
