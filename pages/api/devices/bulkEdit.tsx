import { firebaseAdmin } from 'firebaseAdmin'
import roles from 'lib/auth/roles'
import { NextApiHandler } from 'next'

export default (async (req, res) => {
  if (!req.cookies.token) {
    res.status(401).end()
    return
  }
  if (
    !req.body.cat ||
    !req.body.value ||
    !req.body.ids ||
    !/location|location_prec|container|associated/.test(req.body.cat)
  ) {
    console.error('Invalid Request to /api/devices/bulkEdit')
    console.log(req.body)
    res.status(400).end()
    return
  }
  try {
    await firebaseAdmin
      .auth()
      .verifyIdToken(req.cookies.token)
      .then((claims: firebaseAdmin.auth.DecodedIdToken) => {
        if (claims.role != roles.Admin) {
          throw new Error('Authentication failed')
        }
      })
    const db = firebaseAdmin.firestore()
    const { ids, cat, value } = req.body

    const deviceIds = ids.split('+++')

    deviceIds.forEach((id: string) => {
      db.collection('devices')
        .doc(id)
        .update({ [cat]: value })
        .then(() => {
          console.log('Document ' + id + ' successfully updated!')
        })
        .catch((error) => {
          // The document probably doesn't exist.
          console.error('Error updating document: ' + id, error)
          res.status(500).end()
          return
        })
    })

    res.status(200).end()
  } catch (error) {
    console.log(error)
    res.status(418).end()
  }
}) as NextApiHandler
