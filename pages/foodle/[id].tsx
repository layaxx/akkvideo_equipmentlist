import React from 'react'
import { Alert } from '@material-ui/lab'
import { useRouter } from 'next/dist/client/router'
import firebase from 'firebase'
import Poll from '../../lib/types/Poll'

import useSWR from 'swr'
import FoodleDetailView from '../../components/foodle/FoodleDetailView'
import Link from 'next/link'
import Button from '@material-ui/core/Button'
import { ArrowBack } from '@material-ui/icons'
import app from './app'

const DetailPage = () => {
  const router = useRouter()

  const id = router.asPath.replace('/foodle/', '')

  const fetcher = async (id: string) =>
    firebase.firestore(app).collection('polls').doc(id).get()

  const { data, error } = useSWR(id, fetcher)

  const poll: Poll | undefined = {
    ...data?.data(),
    id: data?.id,
  } as Poll

  return (
    <>
      <h1>AK Video - Foodle</h1>

      <Link href="/foodle">
        <Button>
          <ArrowBack /> Back to Overview
        </Button>
      </Link>

      {(error || (!data?.exists && !!data) || poll?.hidden) && (
        <Alert severity="error">
          Failed to fetch Poll. Maybe id is incorrect?
        </Alert>
      )}

      {!error && !data && <Alert severity="info">Loading</Alert>}

      {!error && !!data && poll && <FoodleDetailView poll={poll} />}
    </>
  )
}

export default DetailPage
