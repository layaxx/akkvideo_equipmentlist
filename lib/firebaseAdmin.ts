import * as firebaseAdmin from 'firebase-admin'
import serviceAccount from '../serviceAccountKey.json'

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(
      serviceAccount.admin as firebaseAdmin.ServiceAccount
    ),
  })
}

export { firebaseAdmin }
