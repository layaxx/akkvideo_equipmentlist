const firebaseAdmin = require('firebase-admin')
const fs = require('fs')
const csv = require('fast-csv')

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
})

if (process.argv.length < 3) {
  console.error('Please specify a path to the serviceAccount.json file')
}

const serviceAccount = require('../' + process.argv[2])

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount.admin),
})

readline.question(
  'Do you want to delete every device currently saved?',
  (answer1) => {
    if (answer1 === 'yes') {
      readline.question('Really delete everything? (yes/no)', (answer2) => {
        if (answer2 === 'yes') {
          console.log('Importing after deleting every device')
          import_devices(true)
          readline.close()
        } else {
          console.log('Importing without deleting')
          import_devices(false)
          readline.close()
        }
      })
    } else {
      console.log('Importing without deleting')
      import_devices(false)
      readline.close()
    }
  }
)

function import_devices(deleteEverything) {
  if (deleteEverything) {
    deleteCollection(firebaseAdmin.firestore(), 'devices', 20)
  }
  const devices = []
  const path = './inventar.csv'

  fs.createReadStream(path, 'utf-8')
    .pipe(csv.parse({ headers: true, delimiter: ',' }))
    .on('error', (error) => {
      throw error.message
    })
    .on('data', (row) => {
      devices.push(row)
    })
    .on('end', () => {
      var devicesNew = devices.map((obj) => {
        const {
          associated,
          amount,
          description,
          location,
          location_prec,
          container,
          category,
          brand,
          price,
          store,
          tags,
          comments,
        } = obj
        return {
          associated,
          amount,
          description,
          location,
          location_prec,
          container,
          category: category + tags.split(',').join('+++'),
          brand,
          price,
          store,
          comments,
          lastEdit: new Date().toISOString(),
        }
      })

      devicesNew.forEach((device) =>
        firebaseAdmin
          .firestore()
          .collection('devices')
          .add(device)
          .catch(console.error)
      )
    })
}

async function deleteCollection(db, collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath)
  const query = collectionRef.orderBy('__name__').limit(batchSize)

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject)
  })
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get()

  const batchSize = snapshot.size
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve()
    return
  }

  // Delete documents in a batch
  const batch = db.batch()
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref)
  })
  await batch.commit()

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve)
  })
}
