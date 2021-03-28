import { firebaseAdmin } from '../../../firebaseAdmin'
import roles from '../../../lib/auth/roles'
import Device from '../../../lib/types/Device'
import Status from '../../../lib/types/device.status'

export default async (
  req: {
    cookies: { token: string }
    body: Device
  },
  res: {
    status: (
      arg0: number
    ) => { (): any; new (): any; end: { (): void; new (): any } }
  }
) => {
  if (!req.cookies.token) {
    console.error('Request to /devices/add without token cookie.')
    res.status(401).end()
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
          throw 'Authentication failed'
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
    } = req.body
    if (!location || !description) {
      res.status(400).end()
    }
    await db.collection('devices').add({
      amount: Math.max(amount, 1),
      brand: brand || '',
      category: category || '',
      comments: comments || '',
      container: container || '',
      location,
      description,
      location_prec: location_prec || '',
      price: price || '',
      status: Status.NotOnLoan,
      store: store || '',
      lastEdit: new Date().toISOString(),
      buyDate: buyDate || '',
    })
    res.status(200).end()
  } catch (error) {
    console.log(error)
    res.status(418).end()
  }
}
