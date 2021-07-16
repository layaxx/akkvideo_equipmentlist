import { firebaseAdmin } from '../../firebaseAdmin'
import roles from '../../lib/auth/roles'
import { NextApiHandler } from 'next'

export default (async (req, res) => {
  if (!req.cookies.token) {
    res.status(401).end()
    return
  }
  const { uid, newRole } = req.body
  if (!uid || !newRole) {
    throw new Error(
      'Request to change Role did not include both uid and newRole Properties'
    )
  }
  try {
    // verify identity of submitter
    const token: firebaseAdmin.auth.DecodedIdToken = await firebaseAdmin
      .auth()
      .verifyIdToken(req.cookies.token)

    if (token.role != roles.Admin) {
      throw new Error('Authentication failed')
    }
    await firebaseAdmin
      .auth()
      .setCustomUserClaims(uid, { role: newRole })
      .then(() => {
        console.log(
          `${token.email} has successfully changed ${uid}'s role to ${newRole}`
        )
        res.status(200).end()
      })
      .catch(() => {
        console.log(`Failed to change ${uid}'s role to ${newRole}`)
        throw new Error('Failed to change Role')
      })
  } catch (error) {
    console.log(error)
    res.status(418).end()
  }
}) as NextApiHandler
