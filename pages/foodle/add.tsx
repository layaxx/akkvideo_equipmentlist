import {
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  makeStyles,
} from '@material-ui/core'
import { ArrowBack } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
import dayjs from 'dayjs'
import firebase from 'firebase/app'
import Link from 'next/dist/client/link'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import React from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useAuth } from 'components/auth'
import { NewPoll } from 'lib/types/Poll'
import { db } from 'lib/app'
import { NextPage } from 'next'

type FormValues = {
  title: string
  options: { date: string }[]
  location: string
  askForContactDetails: boolean
  link: string
  thirdOption: boolean
}

const useStyles = makeStyles({
  root: {
    padding: '1rem',
    marginTop: '1rem',
    '&  .MuiInputBase-root': { marginRight: '1rem' },
    '& .MuiTypography-caption': { alignSelf: 'flex-end' },
    '& .MuiBox-root:last-of-type': { marginTop: '1rem' },
    '& .MuiButton-containedPrimary': { marginTop: '1.5rem' },
    '& .MuiFormControlLabel-root': {
      marginRight: '1rem',
      flexShrink: 0,
      marginBottom: 0,
    },
  },
})

const FoodleAddPage: NextPage = () => {
  const { user } = useAuth()

  const classes = useStyles()

  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      options: [{ date: '' }],
      location: '',
      askForContactDetails: false,
      link: '',
      thirdOption: false,
    },
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
    location,
    askForContactDetails,
    link,
    thirdOption,
  }: FormValues) => {
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
      link,
      askForContactDetails,
      location,
      thirdOption,
    }
    db.collection('polls')
      .add({ ...newPoll, creatorID: user?.uid })
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
      <Typography component="h1" variant="h3" gutterBottom>
        AK Video - Foodle
      </Typography>
      <Typography component="h2" variant="h4" gutterBottom>
        Add a new Poll
      </Typography>

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
        <Paper className={classes.root}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Typography variant="h5" component="h3">
                General Information
              </Typography>
              <Box display="flex">
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
                      {...field}
                    />
                  )}
                />
                <Controller
                  name={'location'}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      id="input-location"
                      label="Location of Event"
                      {...field}
                    />
                  )}
                />
              </Box>
              <Box display="flex" flexWrap="wrap">
                <Controller
                  name={'link'}
                  control={control}
                  rules={{ pattern: /^https?:\/\/\S+.\S+$/i }}
                  render={({ field }) => (
                    <TextField
                      id="input-link"
                      type="url"
                      label="Link to more information "
                      {...field}
                    />
                  )}
                />

                <Typography variant="caption">
                  Can be used to provide external resources to users. For
                  example a link to a PDF version of an official invitation or
                  agenda. Should start with https://.
                </Typography>
              </Box>
              <Box display="flex" flexWrap="wrap">
                <Controller
                  name={'thirdOption'}
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox id="input-thirdOption" />}
                      label="Allow third option (attending if necessary)"
                      {...field}
                    />
                  )}
                />
                <Typography variant="caption">
                  Besides &quot;attending&quot; and &quot;not attending&quot;,
                  allow users to select a third option: &quot;attending if
                  necessary&quot;. This allows you more freedom while choosing a
                  date, knowing that users indicate if an option is not ideal,
                  but still doable for them.
                </Typography>
              </Box>
              <Box display="flex" flexWrap="wrap">
                <Controller
                  name={'askForContactDetails'}
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox id="input-askForContactDetails" />}
                      label="Ask for contact Details"
                      {...field}
                    />
                  )}
                />
                <Typography variant="caption">
                  Users will be asked to provide an e-mail address when voting.
                  This will allow you to easily contact Users after a date has
                  been selected. Contact details will not be visible to other
                  users, only you (the creator of this Poll) and Admins can see
                  them.
                </Typography>
              </Box>
            </Grid>
            <Grid item container>
              <Typography variant="h5" component="h3">
                Possible Dates
              </Typography>
              <Grid item container spacing={2}>
                <Grid item>
                  <Button
                    onClick={() => append({ date: '' })}
                    variant="contained"
                  >
                    <AddIcon /> Add option
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    onClick={() => remove(0)}
                    variant="contained"
                    disabled={controlledFields.length < 2}
                  >
                    <RemoveIcon /> Remove last option
                  </Button>
                  {controlledFields.length < 2 && (
                    <>
                      <br />
                      <Typography variant="caption" component="small">
                        You need to have at least one option.
                      </Typography>
                    </>
                  )}
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
            fullWidth
          >
            Add new Poll
          </Button>
        </Paper>
      )}
    </>
  )
}

export default FoodleAddPage
