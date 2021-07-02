import React from 'react'

//import CLIENT_CONFIG from '../firebaseClient'
import firebaseClient from 'firebase/app'
import Device from '../lib/types/Device'

const fetchDevices = async () => {
  try {
    //firebaseClient.initializeApp(CLIENT_CONFIG)
  } catch {}
  const entries = await firebaseClient.firestore().collection('devices').get()

  return entries.docs
    .map(
      (entry) =>
        ({
          ...entry.data(),
          id: entry.id,
        } as Device)
    )
    .sort((first: Device, second: Device) =>
      first.description
        .toLowerCase()
        .localeCompare(second.description.toLowerCase())
    )
}

const AdminPage = () => {
  /*   const x = useAuth() */

  fetchDevices().then(console.log)

  return (
    <div style={{ margin: 'auto', maxWidth: '45rem' }}>
      <p>this is a test and should never be displayed</p>
    </div>
  )
}

export default AdminPage
