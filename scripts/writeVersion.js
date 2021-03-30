const fs = require('fs')
const exec = require('child_process').exec
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
            console.log(err)
          }
          console.log('The file was saved!')
        }
      )
      console.log(stdout)
    } else {
      console.log(stderr)
    }
  }
)
