import { firebaseAdmin } from '../../firebaseAdmin'
import roles from '../../lib/auth/roles'
import { req_newUser } from '../../lib/types/api/requests'
import { res } from '../../lib/types/api/response'

export default async (req: req_newUser, res: res) => {
  try {
    firebaseAdmin
      .auth()
      .verifyIdToken(req.body.token.i)
      .then((claims: any) => {
        if (claims.role) {
          throw new Error('Already has Role')
        }
      })

    const token = await firebaseAdmin.auth().verifyIdToken(req.body.token.i)
    await firebaseAdmin
      .auth()
      .setCustomUserClaims(token.uid, { role: roles.Public })
    res.status(200).end()
  } catch (error) {
    console.log(error)
    res.status(418).end()
  }
}
