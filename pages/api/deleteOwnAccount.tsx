import { firebaseAdmin } from 'lib/firebaseAdmin'
import { NextApiHandler } from 'next'

export default (async (req, res) => {
  if (!req.cookies.token) {
    res.status(401).end()
    return
  }
  if (!req.url) {
    throw new Error('Request Url is not defined')
  }
  const arr = req.url.split('?confirm=')
  if (!(arr.length === 2 && arr[1] === 'true')) {
    throw new Error('Safety-Check failed: ?confirm=true was not found in url')
  }
  try {
    const token = await firebaseAdmin.auth().verifyIdToken(req.cookies.token)
    await firebaseAdmin.auth().deleteUser(token.uid)
    console.log(token.email + ' successfully deleted their account ')
    res.status(200).end()
  } catch (error) {
    console.log(error)
    res.status(400).end()
  }
}) as NextApiHandler
