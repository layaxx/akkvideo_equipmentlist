import { firebaseAdmin } from 'firebaseAdmin'
import roles from 'lib/auth/roles'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    if (!req.body || !req.body.token || !req.body.token.i) {
      /* Invalid Request: request needs to include a firebase token */
      res.status(400).end()
      return
    }
    const token: firebaseAdmin.auth.DecodedIdToken = await firebaseAdmin
      .auth()
      .verifyIdToken(req.body.token.i)

    if (token.role) {
      /* User associated with firebase token in 
        request already has Role associated with them */
      res.status(400).end()
      return
    }
    await firebaseAdmin
      .auth()
      .setCustomUserClaims(token.uid, { role: roles.Public })
    res.status(200).end()
  } catch (error) {
    /* Something went wrong: Most likely the verifyIdToken() Method failed. */
    console.log(error)
    res.status(418).end()
  }
}
