fs = require('fs')
if (process.env.config) {
  fs.writeFile('../serviceAccountKey.json', process.env.config, function (err) {
    if (err) return console.log(err)
  })
} else {
  console.log(
    'Skip config write, env variable not found. Confirm /serviceAccountKey.json exists.'
  )
}
