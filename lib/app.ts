import firebase from 'firebase/app'
import 'firebase/firestore'
import { CLIENT_CONFIG, firebaseClient } from 'lib/firebaseClient'

let app: firebase.app.App
if (firebaseClient.apps.length === 0) {
  app = firebaseClient.initializeApp(CLIENT_CONFIG)
} else {
  app = firebaseClient.apps[0]
}

export default app

export const db = firebase.firestore(app)
