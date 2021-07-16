import { firebaseClient } from '../../firebaseClient'
import nookies from 'nookies'

const signout = async (): Promise<void> => {
  await firebaseClient.auth().signOut()
  nookies.destroy(null, 'token')
}

export default signout
