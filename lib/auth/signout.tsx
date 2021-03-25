import { firebaseClient } from '../../firebaseClient'
import nookies from 'nookies'
import { useRouter } from 'next/dist/client/router'

export default async () => {
  const router = useRouter()
  await firebaseClient.auth().signOut()
  nookies.destroy(null, 'token')
  router.push('/')
}
