import { firebaseAdmin } from '../../../firebaseAdmin'
import roles from '../../../lib/auth/roles'
import Status from '../../../lib/types/device.status'
import { res } from '../../../lib/types/api/response'
import { req_editDevice } from '../../../lib/types/api/requests'

export default async (req: req_editDevice, res: res) => {
  if (!req.cookies.token) {
    res.status(401).end()
    return
  }
  try {
    await firebaseAdmin
      .auth()
      .verifyIdToken(req.cookies.token)
      .then((claims: any) => {
        if (claims.role != roles.Admin) {
          throw new Error('Authentication failed')
        }
      })
    const db = firebaseAdmin.firestore()
    const {
      amount,
      id,
      brand,
      category,
      comments,
      container,
      description,
      location,
      location_prec,
      price,
      status,
      store,
      associated,
    } = req.body
    var buyDate = req.body.buyDate || ''
    if (!location || !description || !id) {
      res.status(400).end()
      return
    }
    const ref = db.collection('devices').doc(id)
    const editedDevice = {
      amount: Math.max(amount, 1),
      brand,
      category,
      comments,
      container,
      description,
      location,
      location_prec,
      price,
      associated,
      status: status || Status.NotOnLoan,
      store,
      buyDate,
      lastEdit: new Date().toISOString(),
    }
    ref
      .update(editedDevice)
      .then(() => {
        console.log('Document successfully updated!')
      })
      .catch((error) => {
        // The document probably doesn't exist.
        console.error('Error updating document: ', error)
        res.status(500).end()
        return
      })

    res.status(200).end()
  } catch (error) {
    console.log(error)
    res.status(418).end()
  }
}
