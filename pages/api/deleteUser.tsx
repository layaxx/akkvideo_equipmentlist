import { firebaseAdmin } from '../../firebaseAdmin'
import roles from '../../lib/auth/roles'

export default async (req: any, res: any) => {
  // console.log(req)
  if (!req.cookies.token) {
    res.status(401).end()
  }
  try {
    // verify identity of submitter
    firebaseAdmin
      .auth()
      .verifyIdToken(req.cookies.token)
      .then((claims: any) => {
        if (claims.role != roles.Admin) {
          throw new Error('Authentication failed')
        }
      })
    await firebaseAdmin.auth().deleteUser(req.body.uid)
    res.status(200).end()
  } catch (error) {
    console.log(error)
    res.status(418).end()
  }
}
