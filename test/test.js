let fs = require('fs-extra')
let fork = require('child_process').fork
let path = require('path')

const PLAY = `let play=a=>{//generated at ${new Date()}
return a}`
const BADPLAY = `let play=a=>{}/*EXTRA }*/}`
const TESTPASS = `let test = () => true`
const TESTFAIL = `let test = () => false`

const TEST_DIR = path.join(__dirname, '.TEST')
const INPUT_FILE = path.join(TEST_DIR, 't.js')
const OUTPUT_FILE = path.join(TEST_DIR, 't.caddy.js')

// a promise based sleep
let sleep = (time = 2000) => {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

// Empty testing dir
fs.emptyDir(TEST_DIR)
  // write testing file
  .then(() => fs.writeFile(INPUT_FILE, PLAY + '\n' + TESTPASS))
  // start caddy and sleep
  .then(() => {
    console.log('** WAITING FOR A FORK TO LAUNCH **')
    fork(path.join(__dirname, '../bin/caddy'), [INPUT_FILE])
    console.log('** TESTING THAT A FILE IS GENERATED FROM SUITABLE SCRIPT **')
    return sleep(3000)
  })
  // read output file
  .then(() => fs.readFile(OUTPUT_FILE, 'utf-8'))
  // compare expected
  .then(output => {
    if (output !== PLAY) {
      throw new Error('Output file should match the input file')
    }
    console.log('** TESTING THAT TEST FUNCTION WORKS **')
    return fs.writeFile(INPUT_FILE, PLAY + '\n' + TESTFAIL)
  })
  // wait for caddy
  .then(sleep)
  // read file again
  .then(() => fs.readFile(OUTPUT_FILE, 'utf-8'))
  // compare expected
  .then(output => {
    if (output !== PLAY) {
      throw new Error('Test function should have lead to test fail')
    }
    console.log('** TESTING THAT A MISSING PLAY FUNCITON LEADS TO AN ERROR **')
    return fs.writeFile(INPUT_FILE, TESTPASS)
  })
  // wait for caddy
  .then(sleep)
  // read file again
  .then(() => fs.readFile(OUTPUT_FILE, 'utf-8'))
  // compare expected
  .then(output => {
    if (output !== PLAY) {
      throw new Error('Play function should not have been found.')
    }
    console.log('** TESTING THAT A BAD PLAY FUNCTION LEADS TO AN ERROR **')
    return fs.writeFile(INPUT_FILE, BADPLAY)
  })
  // wait for caddy
  .then(sleep)
  // read file again
  .then(() => fs.readFile(OUTPUT_FILE, 'utf-8'))
  // compare expected
  .then(output => {
    if (output !== PLAY) {
      throw new Error('Script should not have parsed interpreter')
    }
    // all done
    console.log('** TESTING COMPLETE - PASS **')
    process.exit(0)
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
