import firebase from 'firebase/app'
import { CLIENT_CONFIG, firebaseClient } from 'firebaseClient'

let app: firebase.app.App
if (firebaseClient.apps.length === 0) {
  app = firebaseClient.initializeApp(CLIENT_CONFIG)
} else {
  app = firebaseClient.apps[0]
}

export default app

export const db = firebase.firestore(app)
