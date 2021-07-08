import firebase from 'firebase'
import { CLIENT_CONFIG, firebaseClient } from '../firebaseClient'

let app: any
if (firebaseClient.apps.length === 0) {
  app = firebaseClient.initializeApp(CLIENT_CONFIG)
} else {
  app = firebaseClient.apps[0]
}

export default app

export const db = firebase.firestore(app)
