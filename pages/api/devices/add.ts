import { firebaseAdmin } from '../../../firebaseAdmin'
import roles from '../../../lib/auth/roles'
import Status from '../../../lib/types/device.status'
import { res } from '../../../lib/types/api/response'
import { req_editDevice } from '../../../lib/types/api/requests'

export default async (req: req_editDevice, res: res) => {
  if (!req.cookies.token) {
    console.error('Request to /devices/add without token cookie.')
    res.status(401).end()
    return
  }
  try {
    await firebaseAdmin
      .auth()
      .verifyIdToken(req.cookies.token)
      .then((claims: any) => {
        if (claims.role != roles.Admin) {
          console.error(
            `Request to /devices/add without Admin claim (${claims.email})`
          )
          throw new Error('Authentication failed')
        }
      })
    const db = firebaseAdmin.firestore()
    const {
      amount,
      brand,
      category,
      comments,
      container,
      description,
      location,
      location_prec,
      price,
      store,
      buyDate,
      associated,
    } = req.body
    if (!location || !description) {
      res.status(400).end()
      return
    }
    await db.collection('devices').add({
      amount: Math.max(amount, 1),
      associated: associated || -1,
      brand: brand || '',
      category: category || '',
      comments: comments || '',
      container: container || '',
      location,
      description,
      location_prec: location_prec || '',
      price: price || 0,
      status: Status.NotOnLoan,
      store: store || '',
      lastEdit: new Date().toISOString(),
      buyDate: buyDate || '',
    })
    res.status(200).end()
  } catch (error) {
    console.error(error)
    res.status(418).end()
  }
}
