let play = a => {
  /*
    your solution code goes here
  */
  /*
  Notes:
    the server runs this function in an empty context
    so any require statements will not work!
    The empty context also means that console and any
    other global objects are probably missing. soz.
  */
  return a
}

let test = () => {
  /*
    your testing routine goes here
  */
  /*
  Notes:
    test is run using the normal context so you may
    require and console.log to your heart's content
  */
  return play('hello') === 'hello' // return a truthy value to indicate success
}
