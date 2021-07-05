import {
  Paper,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  Button,
  TableFooter,
  useTheme,
} from '@material-ui/core'
import React, { useState } from 'react'
import ClearIcon from '@material-ui/icons/Clear'
import CheckIcon from '@material-ui/icons/Check'
import Poll, { Submission } from '../../lib/types/Poll'
import { useForm, Controller, useWatch } from 'react-hook-form'
import firebase from 'firebase'
import { db } from '../../lib/app'
import { mutate } from 'swr'
import { generateRange } from '../../lib/helper'
import dayjs, { Dayjs } from 'dayjs'
import CalendarView from './CalendarView'
import { useConfirm } from 'material-ui-confirm'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSnackbar } from 'notistack'

type Props = {
  poll: Poll
}

export default function FoodleDetailView({
  poll: { hidden, active, title, id, submissions, options },
}: Props) {
  const theme = useTheme()

  const [activeDate, setActiveDate] = useState<Dayjs | undefined>(undefined)

  const filteredSubmissions = submissions.filter((s) => s.active)

  const defaultValues: any = { name: '' }

  const range = generateRange(options.length)

  range.forEach((index: number) => (defaultValues[index] = false))

  const { handleSubmit, control, reset } = useForm({ defaultValues })

  const values = useWatch({
    control,
  })

  const handleAdd = ({ name, ...checkboxValues }: any) => {
    const newOptions: number[] = range.map((index: number) =>
      checkboxValues[index] ? 1 : 0
    )

    const newSubmission: Submission = {
      name,
      options: newOptions,
      active: true,
    }

    db.collection('polls')
      .doc(id)
      .update({
        submissions: firebase.firestore.FieldValue.arrayUnion(newSubmission),
      })
      .then(() => {
        mutate(id)
        reset(defaultValues)
      })
  }

  const confirm = useConfirm()

  const handleConfirm = (submission: Submission) => {
    confirm({
      description: `Do you really want to deactivate ${submission.name}s submission? You cannot reverse this action.`,
    })
      .then(() => handleDeactivate(submission))
      .catch(() => undefined)
  }

  const handleDeactivate = (submission: Submission) => {
    const newSubmission: Submission = {
      ...submission,
      active: false,
    }

    const batch = db.batch()

    const ref = db.collection('polls').doc(id)

    batch.update(ref, {
      submissions: firebase.firestore.FieldValue.arrayUnion(newSubmission),
    })

    batch.update(ref, {
      submissions: firebase.firestore.FieldValue.arrayRemove(submission),
    })

    batch.commit().then(() => {
      mutate(id)
    })
  }

  const { enqueueSnackbar } = useSnackbar()

  return (
    <Paper style={{ flexGrow: 1, padding: '1.5rem' }}>
      <Grid container spacing={2}>
        <Grid item xs>
          <Typography gutterBottom variant="h4" component="h3">
            {title} {!active && '[inactive]'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {filteredSubmissions.length} Submission[s]
          </Typography>
          <Typography variant="body2" color="textSecondary">
            ID: {id}
          </Typography>
          <CopyToClipboard
            text={`https://intern.arbeitskreis.video/foodle/${id}`}
            variant="contained"
            onCopy={() =>
              enqueueSnackbar('Successfully copied link!', {
                variant: 'success',
              })
            }
          >
            <Button color="primary">Copy public share Link</Button>
          </CopyToClipboard>
        </Grid>

        <Grid item xs>
          <TableContainer component={Paper}>
            <Table aria-label="submissions">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  {options.map((option, index) => {
                    const date = dayjs(option.toDate())
                    return (
                      <TableCell
                        align="center"
                        key={'option-header-' + index}
                        style={{
                          outline:
                            activeDate && date.isSame(activeDate, 'day')
                              ? `5px solid ${theme.palette.primary.main}`
                              : 'None',
                        }}
                      >
                        {date.format('DD.MM.YYYY')}
                        <br />
                        {date.format('HH:mm')}
                      </TableCell>
                    )
                  })}
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubmissions.map((submission, sIndex) => (
                  <TableRow key={'' + sIndex}>
                    <TableCell component="th" scope="row">
                      {submission.name}
                    </TableCell>
                    {submission.options.map((option, index) => (
                      <TableCell
                        align="center"
                        key={'submission-' + sIndex + '-' + index}
                      >
                        <Checkbox
                          name={submission.name + index}
                          icon={<ClearIcon />}
                          checkedIcon={<CheckIcon />}
                          checked={option === 1}
                          disabled
                          aria-disabled
                        />
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <Button
                        style={{ color: theme.palette.warning.main }}
                        onClick={() => handleConfirm(submission)}
                      >
                        deactivate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {active && (
                  <TableRow key="input">
                    <TableCell component="th" scope="row">
                      <Controller
                        name={'name'}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            id="input-name"
                            label="Your Name"
                            required
                            aria-required
                            style={{ width: '8rem' }}
                            {...field}
                          />
                        )}
                      />
                    </TableCell>
                    {options.map((_, index) => (
                      <TableCell align="center" key={'check-' + index}>
                        <Controller
                          name={'' + index}
                          control={control}
                          render={({
                            field: { onChange, onBlur, value, ref },
                          }) => (
                            <Checkbox
                              icon={<ClearIcon />}
                              checkedIcon={<CheckIcon />}
                              title={value ? 'attending' : 'not attending'}
                              onBlur={onBlur}
                              onChange={onChange}
                              checked={value}
                              inputRef={ref}
                            />
                          )}
                        />
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit(handleAdd, console.error)}
                        disabled={!active || hidden || !values.name}
                      >
                        submit
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

              <TableFooter>
                <TableRow key="sums">
                  <TableCell component="th" scope="row">
                    Overview
                  </TableCell>
                  {options.map((_, index) => (
                    <TableCell align="center" key={'sums-' + index}>
                      {filteredSubmissions
                        .map((s) => s.options[index])
                        .reduce(
                          (x: number, y: number) => x + y,
                          values[index] ? 1 : 0
                        )}
                    </TableCell>
                  ))}
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item>
          <CalendarView
            dates={options.map((option) => dayjs(option.toDate()))}
            setActiveDate={setActiveDate}
          />
        </Grid>
      </Grid>
    </Paper>
  )
}
