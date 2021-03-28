const firebaseAdmin = require('firebase-admin')
const fs = require('fs')
const csv = require('fast-csv')
const serviceAccount = require('../serviceAccountKey.json')

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  })
}

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
})

/* TODO: 
    - after deleting all entries, you manually have to add the collection "devices" again, 
        or no devices will be imported */

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
  let devices = []
  let path = './scripts/Inventar_akvideo.csv'

  fs.createReadStream(path)
    .pipe(csv.parse({ headers: true, delimiter: ';' }))
    .on('error', (error) => {
      throw error.message
    })
    .on('data', (row) => {
      devices.push(row)
    })
    .on('end', () => {
      devicesNew = devices.map((obj) => {
        return {
          ...obj,
          category: obj.tags
            ? obj.category.split(',').join('+++') +
              '+++' +
              obj.tags.split(',').join('+++')
            : obj.category.split(',').join('+++'),
          buyDate: '',
          lastEdit: new Date().toISOString(),
        }
      })

      devicesNew.forEach((obj) => {
        delete obj.tags
        delete obj.Index
      })

      devicesNew.forEach((device) =>
        firebaseAdmin.firestore().collection('devices').add(device)
      )

      /*  Tutorial.bulkCreate(devices)
        .then(() => {
          res.status(200).send({
            message: 'Uploaded the file successfully: ' + req.file.originalname,
          })
        })
        .catch((error) => {
          res.status(500).send({
            message: 'Fail to import data into database!',
            error: error.message,
          })
        }) */
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

/* 
async function addDevice() {
  if (!req.cookies.token) {
    console.error('Request to /devices/add without token cookie.')
    res.status(401).end()
  }

  const db = firebaseAdmin.firestore()
  const {
    amount,
    brand,
    category,
    comments,
    container,
    description,
    location,
    location_prec,
    price,
    store,
    buyDate,
  } = req.body
  if (!location || !description) {
    res.status(400).end()
  }
  await db.collection('devices').add({
    amount: Math.max(amount, 1),
    brand: brand || '',
    category: category || '',
    comments: comments || '',
    container: container || '',
    location,
    description,
    location_prec: location_prec || '',
    price: price || '',
    status: Status.NotOnLoan,
    store: store || '',
    lastEdit: new Date().toISOString(),
    buyDate: buyDate || '',
  })
  res.status(200).end()
}
 */
