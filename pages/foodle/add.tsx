import { Button, TextField, Grid, Paper } from '@material-ui/core'
import { ArrowBack } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import dayjs from 'dayjs'
import firebase from 'firebase'
import Link from 'next/dist/client/link'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import React from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useAuth } from '../../auth'
import { NewPoll } from '../../lib/types/Poll'
import { db } from '../../lib/app'

type FormValues = {
  title: string
  options: { date: string }[]
}

export default function AddPage() {
  const { user } = useAuth()

  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { title: '', options: [{ date: '' }] },
  })

  const { fields, append, remove } = useFieldArray({
    name: 'options',
    control,
  })

  const watchFieldArray = watch('options')
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index],
    }
  })

  const formatDate = (date: Date) => {
    const dateNew = dayjs(date)
    const remainder = 30 - (dateNew.minute() % 30)
    return dateNew.add(remainder, 'minutes').format('YYYY-MM-DDTHH:mm')
  }

  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const handleAdd = ({
    title,
    options,
  }: {
    title: string
    options: { date: string }[]
  }) => {
    const newPoll: NewPoll = {
      title,
      options: options
        .map((option) =>
          firebase.firestore.Timestamp.fromDate(dayjs(option.date).toDate())
        )
        .sort((a, b) => (a === b ? 0 : a.toMillis() < b.toMillis() ? -1 : 1)),
      submissions: [],
      active: true,
      hidden: false,
      created: firebase.firestore.FieldValue.serverTimestamp(),
    }
    db.collection('polls')
      .add(newPoll)
      .then((docRef) => {
        console.log('Document written with ID: ', docRef.id)
        router.push('/foodle/' + docRef.id)
      })
  }

  const handleError = () => {
    console.log(errors)
    enqueueSnackbar('There was an error with the form.', {
      variant: 'error',
    })
  }

  return (
    <>
      <h1>AK Video - Foodle</h1>
      <h2>Add a new Poll</h2>

      <Link href="/foodle">
        <Button>
          <ArrowBack /> Back to Overview
        </Button>
      </Link>

      {!user ? (
        <Alert severity="info">
          You are currently not logged in. This means you only have access to
          polls to which you have received a direct link.
        </Alert>
      ) : (
        <>
          <Grid
            container
            direction="column"
            spacing={2}
            component={Paper}
            style={{ margin: '2rem 0' }}
          >
            <Grid item>
              <h3>Title</h3>
              <Controller
                name={'title'}
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Please provide a title for your event',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    id="input-title"
                    label="Title of Event"
                    required
                    aria-required
                    style={{ width: '8rem' }}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item container>
              <h3>Possible Dates</h3>
              <Grid item container>
                <Grid item>
                  <Button
                    onClick={() => append({ date: '' })}
                    variant="contained"
                  >
                    Add another Option
                  </Button>
                  <Button onClick={() => remove(0)} variant="contained">
                    Remove last option
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item container direction="row" spacing={2}>
              {controlledFields.map((field, index) => (
                <Grid item key={'' + index}>
                  <Controller
                    key={field.id}
                    name={`options.${index}.date`}
                    control={control}
                    defaultValue={formatDate(new Date())}
                    render={({ field }) => (
                      <TextField
                        label={`Possible Date ${index + 1}`}
                        type="datetime-local"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        {...field}
                      />
                    )}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit(handleAdd, handleError)}
          >
            Add new Poll
          </Button>
        </>
      )}
    </>
  )
}
