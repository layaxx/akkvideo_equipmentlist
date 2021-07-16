import { firebaseAdmin } from '../../firebaseAdmin'
import roles from '../../lib/auth/roles'
import { NextApiHandler } from 'next'

export default (async (req, res) => {
  if (!req.cookies.token) {
    res.status(401).end()
    return
  }
  if (!req.body.uid) {
    throw new Error('Request to delete User did not include a user ID.')
  }
  try {
    // verify identity of submitter
    firebaseAdmin
      .auth()
      .verifyIdToken(req.cookies.token)
      .then((claims: firebaseAdmin.auth.DecodedIdToken) => {
        if (claims.role !== roles.Admin) {
          throw new Error('Authentication failed')
        } else {
          firebaseAdmin
            .auth()
            .deleteUser(req.body.uid)
            .then(() => {
              console.log(
                `${claims.email} has successfully deleted user ${req.body.uid}`
              )
              res.status(200).end()
            })
            .catch(() => res.status(500).end())
        }
      })
  } catch (error) {
    console.log(error)
    res.status(418).end()
  }
}) as NextApiHandler
