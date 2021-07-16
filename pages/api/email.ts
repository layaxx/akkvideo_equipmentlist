import axios from 'axios'
import { firebaseAdmin } from 'firebaseAdmin'
import roles from 'lib/auth/roles'
import Device from 'lib/types/Device'
import { NextApiHandler } from 'next'

export default (async (req, res) => {
  if (!req.cookies.token) {
    /* Invalid Request: Only requests from authenticated users are accepted, 
      therefore if the token cookie is not present in the request, abort here */
    res.status(401).end()
    return
  }
  if (
    !req.body.devices ||
    req.body.devices.length === 0 ||
    !req.body.fromDate ||
    !req.body.untilDate
  ) {
    /* Invalid Request: Requests must include an non-empty Array of Devices, 
    a startDate and an endDate */
    res.status(400).end()
    return
  }
  try {
    const token: firebaseAdmin.auth.DecodedIdToken = await firebaseAdmin
      .auth()
      .verifyIdToken(req.cookies.token)

    const { email, role } = token

    if ([roles.Admin, roles.Moderator, roles.Member].indexOf(role) === -1) {
      /* User needs to be authorized, ie have either Admin, Moderator or Member role. */
      throw new Error('Authentication failed')
    }

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
    res.status(200).end()
  } catch (error) {
    res.status(401).end()
  }
}) as NextApiHandler
