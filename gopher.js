/* globals play test */
const fs = require('fs')
const vm = require('vm')
const chalk = require('chalk')

// handle 'message' event from parent
process.on('message', msg => {
  try {
    console.log(chalk.bold('Loading script...'))
    vm.runInThisContext(fs.readFileSync(msg.path))
     // check for play function
    if (typeof play !== 'function') {
      throw new Error(`No 'play' function defined in ${msg.path}.`)
    }
    // now run any tests
    console.log(chalk.bold('Calling test function...'))
    if (typeof test === 'function') {
      // run test
      let success = test()
      console.log(success ? chalk.green(`  test passed`) : chalk.red(`  test failed`))
      if(!success){
        throw new Error('Test function reported a failure.')
      }
    } else {
      console.log(chalk.yellow('**No test function**'))
    }
    // all done - send play function this way
    process.send({play: play.toString()})
  } catch (error) {
    console.log(chalk.red(error))
    process.send({error: error})
  }
})
