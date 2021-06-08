import roles from '../../auth/roles'
import Device from '../Device'

interface req_authenticated {
  cookies: { token: string }
}

export type req_newUser = { body: { token: { i: string } } }

export type req_email = req_authenticated & {
  body: {
    devices: Device[]
    fromDate: string
    untilDate: string
    comments: string
  }
}

export type req_deleteUser = req_authenticated & {
  body: { uid: string }
}

export type req_deleteOwnAccount = req_authenticated & {
  url: string
}

export type req_changeRole = req_authenticated & {
  body: { uid: string; newRole: roles }
}

export type req_editDevice = req_authenticated & {
  body: Device
}

export type req_bulkEdit = req_authenticated & {
  body: { ids: string; cat: string; value: string }
}
