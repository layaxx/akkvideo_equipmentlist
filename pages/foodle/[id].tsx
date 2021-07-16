import React from 'react'
import { Alert } from '@material-ui/lab'
import { useRouter } from 'next/dist/client/router'
import Poll from 'lib/types/Poll'

import useSWR from 'swr'
import FoodleDetailView from 'components/foodle/FoodleDetailView'
import Link from 'next/link'
import Button from '@material-ui/core/Button'
import { ArrowBack } from '@material-ui/icons'
import { db } from 'lib/app'
import { NextPage } from 'next'
import { Typography } from '@material-ui/core'

const FoodleDetailPage: NextPage = () => {
  const router = useRouter()

  const { id } = router.query

  const fetcher = async (id: string) => {
    const result = await db.collection('polls').doc(id).get()
    if (!result.exists) {
      throw new Error('Could not find Poll with id ' + id)
    }
    return result.data()
  }

  const { data, error } = useSWR(id ?? '-invalid-id-', fetcher)

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

      {(error || (!!data && data.hidden)) && (
        <Alert severity="error">
          Failed to fetch Poll. Maybe id is incorrect?
        </Alert>
      )}

      {!error && !data && <Alert severity="info">Loading</Alert>}

      {!error && !!data && !data.hidden && (
        <FoodleDetailView poll={{ ...data, id } as Poll} />
      )}
    </>
  )
}

export default FoodleDetailPage
