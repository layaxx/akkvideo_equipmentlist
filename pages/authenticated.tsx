import React from 'react'
import nookies from 'nookies'
import { firebaseAdmin } from '../firebaseAdmin'
import { DataGrid, GridRowId } from '@material-ui/data-grid'

import { InferGetServerSidePropsType, GetServerSidePropsContext } from 'next'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const cookies = nookies.get(ctx)
    await firebaseAdmin.auth().verifyIdToken(cookies.token)
    /*     firebaseAdmin
  .auth()
  .setCustomUserClaims(token.uid, { admin: true })
  .then(() => {
    // The new custom claims will propagate to the user's ID token the
    // next time a new one is issued.
  }); */
    firebaseAdmin.auth().verifyIdToken(cookies.token).then(console.log)
    // const { uid, email } = token;

    // the user is authenticated!
    // FETCH STUFF HERE

    return {
      props: { message: 'firebaseAdmin' },
    }
  } catch (err) {
    // either the `token` cookie didn't exist
    // or token verification failed
    // either way: redirect to the login page
    // either the `token` cookie didn't exist
    // or token verification failed
    // either way: redirect to the login page
    return {
      redirect: {
        permanent: false,
        destination: '/login',
      },
      // `as never` is required for correct type inference
      // by InferGetServerSidePropsType below
      props: {} as never,
    }
  }
}

const AuthenticatedPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const [selectionModel, setSelectionModel] = React.useState<GridRowId[]>([])
  const data = {
    columns: [{ field: 'traderName', headerName: 'Trader Name' }],
    rows: [
      {
        id: 'e264638f-9692-5ef9-939a-f72b1eb4ddc1',
        desk: 'D-2660',
        commodity: 'Rough Rice',
        traderName: 'Gregory Lamb',
        traderEmail: 'gijbulvi@zivceg.ee',
        quantity: 13889,
      },
    ],
  }

  return (
    <div>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          checkboxSelection
          onSelectionModelChange={(newSelection) => {
            setSelectionModel(newSelection.selectionModel)
            console.log(newSelection)
          }}
          selectionModel={selectionModel}
          {...data}
        />
      </div>
    </div>
  )
}

export default AuthenticatedPage
