let fs = require('fs-extra')
let fork = require('child_process').fork
let path = require('path')

const PLAY = `let play=a=>{//generated at ${new Date()}
return a}`
const TESTPASS = `let test = () => true`
const TESTFAIL = `let test = () => false`

const TEST_DIR = path.join(__dirname,'.TEST')
const INPUT_FILE = path.join(TEST_DIR,'t.js')
const OUTPUT_FILE = path.join(TEST_DIR,'t.caddy.js')

// a promise based sleep
let sleep = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

let caddy = null;

// Empty testing dir
fs.emptyDir(TEST_DIR)
  // write testing file
  .then(()=> fs.writeFile(INPUT_FILE, PLAY + '\n' + TESTPASS))
  // start caddy and sleep
  .then( () =>{
    caddy = fork(path.join(__dirname, '../bin/caddy'), [INPUT_FILE])
    return sleep(2000)
  })
  //read output file
  .then(()=> fs.readFile(OUTPUT_FILE,'utf-8'))
  // compare expected
  .then(output =>{
    if (output !== PLAY) {
      throw new Error('Output file does not match input file')
    }
    return fs.writeFile(INPUT_FILE, PLAY + '\n' + TESTFAIL)
  })
  // wait for caddy
  .then(() => sleep(2000))
  // read file again
  .then(()=> fs.readFile(OUTPUT_FILE,'utf-8'))
  // compare expected
  .then(output =>{
    if (output !== PLAY) {
      throw new Error('Output file does not match input file')
    }
    //all done
    console.log('**TESTING COMPLETE - PASS**')
    process.exit(0)
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
