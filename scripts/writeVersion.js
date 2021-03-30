const fs = require('fs')
const exec = require('child_process').exec
new Promise((resolve, reject) => {
  exec(
    "git log -1 --pretty='%h'",
    { maxBuffer: 1024 * 500 },
    (error, stdout, stderr) => {
      if (error) {
        console.warn(error)
      } else if (stdout) {
        fs.writeFile(
          './lib/version.ts',
          'export default ' + stdout,
          function (err) {
            if (err) {
              return console.log(err)
            }
            console.log('The file was saved!')
          }
        )
        console.log(stdout)
      } else {
        console.log(stderr)
      }
      resolve(stdout ? true : false)
    }
  )
})
