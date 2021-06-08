import { firebaseAdmin } from '../../firebaseAdmin'
import roles from '../../lib/auth/roles'
import { res } from '../../lib/types/api/response'
import { req_deleteUser } from '../../lib/types/api/requests'

export default async (req: req_deleteUser, res: res) => {
  // console.log(req)
  if (!req.cookies.token) {
    res.status(401).end()
    return
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
