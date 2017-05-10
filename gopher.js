/* globals play tests */
const fs = require('fs')
const vm = require('vm')
const equals = require('deep-equal')

// handle 'message' event from parent
process.on('message', msg => {
  try {
    vm.runInThisContext(fs.readFileSync(msg.path))
     // check for play function
    if (typeof play !== 'function') {
      throw new Error(`No 'play' function defined in ${msg.path}.`)
    }
    // now run any tests
    if (typeof tests !== 'undefined'){
      // run all tests and check if any failures occur
      failed = tests.reduce((fail,test,i) =>{
        let [input,output] = test
        let result = equals(output,play(input))
        // output results
        console.log(`${i}:  [${result?'PASS':'FAIL'}]`)
        if(!result){
          console.log(` Input:${input}`)
          console.log(` Output:${output}`)
        }
        return fail || !result
      }, false)
    }
    if(failed){
      throw new Error('Failed to pass all the specified tests')
    }
    // all done - send play function this way
    process.send({play: play.toString()})
  } catch (error) {
    process.send({error: error.toString()})
  }
})
