import { firebaseAdmin } from '../../../firebaseAdmin'
import roles from '../../../lib/auth/roles'

export default async (
  req: {
    cookies: { token: string }
    body: {
      buyDate?: any
      id?: any
      brand?: any
      category?: any
      comments?: any
      container?: any
      description?: any
      location?: any
      location_prec?: any
      price?: any
      status?: any
      store?: any
    }
  },
  res: {
    status: (
      arg0: number
    ) => { (): any; new (): any; end: { (): void; new (): any } }
  }
) => {
  console.log(req)
  if (!req.cookies.token) {
    res.status(401).end()
  }
  try {
    await firebaseAdmin
      .auth()
      .verifyIdToken(req.cookies.token)
      .then((claims: any) => {
        if (claims.role != roles.Admin) {
          throw 'Authentication failed'
        }
      })
    const db = firebaseAdmin.firestore()
    const {
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
    } = req.body
    var buyDate = req.body.buyDate || ''
    if (!location || !description || !id) {
      res.status(400).end()
    }
    const ref = db.collection('devices').doc(id)
    const editedDevice = {
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
      })

    res.status(200).end()
  } catch (error) {
    console.log(error)
    res.status(418).end()
  }
}
