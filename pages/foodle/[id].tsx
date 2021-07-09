import React from 'react'
import { Alert } from '@material-ui/lab'
import { useRouter } from 'next/dist/client/router'
import Poll from '../../lib/types/Poll'

import useSWR from 'swr'
import FoodleDetailView from '../../components/foodle/FoodleDetailView'
import Link from 'next/link'
import Button from '@material-ui/core/Button'
import { ArrowBack } from '@material-ui/icons'
import { db } from '../../lib/app'
import { NextPage } from 'next'
import { Typography } from '@material-ui/core'

const FoodleDetailPage: NextPage = () => {
  const router = useRouter()

  const { id } = router.query

  const fetcher = async (id: string) => db.collection('polls').doc(id).get()

  const { data, error } = useSWR(id ?? '-invalid-id-', fetcher)

  const poll: Poll | undefined = {
    ...data?.data(),
    id: data?.id,
  } as Poll

  return (
    <>
      <Typography component="h1" variant="h3" gutterBottom>
        AK Video - Foodle
      </Typography>

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

export default FoodleDetailPage
