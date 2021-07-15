import firebaseClient from 'firebase/app'
import 'firebase/auth'
import config from './serviceAccountKey.json'

export const CLIENT_CONFIG = config.client

if (typeof window !== 'undefined' && !firebaseClient.apps.length) {
  firebaseClient.initializeApp(CLIENT_CONFIG)
  firebaseClient
    .auth()
    .setPersistence(firebaseClient.auth.Auth.Persistence.SESSION)
}

export { firebaseClient }
