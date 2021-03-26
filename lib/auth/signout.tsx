import { firebaseClient } from '../../firebaseClient'
import nookies from 'nookies'

export default async () => {
  await firebaseClient.auth().signOut()
  nookies.destroy(null, 'token')
}
