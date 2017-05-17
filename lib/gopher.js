/* globals play test */
const fs = require('fs')
const vm = require('vm')
const chalk = require('chalk')
const jsmin = require('jsmin').jsmin

// handle 'message' event from parent
process.on('message', files => {
  try {
    let [inputFile, outputFile] = files
    console.log(chalk.bold('Loading script...'))
    vm.runInThisContext(fs.readFileSync(inputFile))
     // check for play function
    if (typeof play !== 'function') {
      throw new Error(`No 'play' function defined in ${inputFile}.`)
    }
    // now run test
    console.log(chalk.bold('Calling test function...'))
    if (typeof test === 'function') {
      // run test
      let success = test()
      console.log(`   ${success ? chalk.bgGreen('test passed') : chalk.bgRed('test failed')}`)
      if (!success) {
        let e = new Error('Test function reported a failure.')
        e.code = 'ETESTFAIL'
        throw e
      }
    } else {
      console.log(chalk.yellow('**No test function**'))
    }
    // determine strokes
    let script = `let play=${play.toString()}`
    let strokes = jsmin(script, 3).replace(/^\n+/, '').length
    console.log(`Completed in ${chalk.green.bold(strokes)} strokes`)
    // write out file
    fs.writeFile(outputFile, script, err => {
      if (err) { throw err }
      console.log(chalk.green(`Output written to ${outputFile}`))
      process.send('')
    })
  } catch (error) {
    if(error.code === 'ETESTFAIL'){
      console.log(chalk.red(`The 'test' function in your script returned a falsey value.`))
    }else {
      console.log(chalk.red(error.stack))
    }
    process.send({error: error})
  }
})
