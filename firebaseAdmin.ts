import * as firebaseAdmin from 'firebase-admin'

import serviceAccount from './serviceAccountKey.json'

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount as any),
  })
}

export { firebaseAdmin }
