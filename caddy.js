const fork = require('child_process').fork
const chokidar = require('chokidar')

module.exports = (path) => {
  // create a watchdog for misbehaving scripts
  let watchdog = null
  let defined = obj => typeof ob !== 'undefined'
  // create a child process to run script
  let gopher = fork('./gopher')
  // listen for messages from child
  gopher.on('message', msg => {
    if (defined(msg.error)) {
      // some error
    } else if (defined(msg.play)) {
      console.log(msg.play)
    }

    gopher.kill()
  })

  gopher.on('error', err => {
    console.log(err)
  })

  gopher.on('exit', (code, signal) => {
    if (watchdog) clearTimeout(watchdog)
  })

  // start watchdog
  watchdog = setTimeout(() => {
    gopher.kill() // ouch
    throw new Error(`Running script took longer than 5 seconds.`)
  }, 5000)

  // send path to get gopher started
  gopher.send({path})
}
