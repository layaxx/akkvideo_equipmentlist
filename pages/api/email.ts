import axios from 'axios'
import { firebaseAdmin } from '../../firebaseAdmin'
import roles from '../../lib/auth/roles'
import Device from '../../lib/types/Device'

export default async (
  req: {
    cookies: { token: string }
    body: {
      devices: Device[]
      fromDate: string
      untilDate: string
      comments: string
    }
  },
  res: {
    status: (
      arg0: number
    ) => { (): any; new (): any; end: { (): void; new (): any } }
  }
) => {
  if (!req.cookies.token) {
    res.status(401).end()
    return
  }
  if (!req.body.devices || !req.body.fromDate || !req.body.untilDate) {
    res.status(400).end()
    return
  }
  try {
    var email
    await firebaseAdmin
      .auth()
      .verifyIdToken(req.cookies.token)
      .then((claims: any) => {
        if (
          claims.role !== roles.Admin &&
          claims.role !== roles.Moderator &&
          claims.role !== roles.Member
        ) {
          throw new Error('Authentication failed')
        }
        email = claims.email
      })
    axios
      .post(
        'https://maker.ifttt.com/trigger/test/with/key/' +
          process.env.EMAIL_KEY,
        {
          value1: req.body.devices.map((dev: Device) => dev.id).join(';'),
          value2: `${req.body.fromDate} - ${req.body.untilDate} (${email})`,
          value3: req.body.comments || '',
        }
      )
      .then(() => res.status(200).end())
      .catch(() => res.status(500).end())
  } catch (error) {
    res.status(401).end()
  }
}
