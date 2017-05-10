const fork = require('child_process').fork

module.exports = (path) => {
  // create a watchdog for misbehaving scripts
  let watchdog = null
  // create a child process to run script
  let gopher = fork('./gopher')
  // listen for messages from child
  gopher.on('message', msg => {

    if (typeof msg.error !== 'undefined'){
      console.log(msg.error)
    }
    console.log(msg.play)
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
