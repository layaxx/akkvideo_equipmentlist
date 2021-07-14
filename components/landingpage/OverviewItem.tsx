import {
  CardActionArea,
  CardContent,
  Typography,
  CardActions,
  makeStyles,
  Card,
  Button,
} from '@material-ui/core'
import Link from 'next/link'
import React, { FC } from 'react'
import { PageDescription } from '../../pages'

const useStyles = makeStyles((theme) => {
  return {
    root: {
      minWidth: 275,
      margin: '1rem',

      '& .MuiCardActions-root': {
        marginBottom: theme.spacing(1),
      },
    },
    title: {
      fontSize: 14,
    },
  }
})

type Props = PageDescription

const LandingPageOverviewItem: FC<Props> = ({
  link,
  title,
  description,
}: Props) => {
  const classes = useStyles()

  return (
    <Card className={classes.root} variant="outlined">
      <CardActionArea>
        <Link href={link}>
          <CardContent>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            >
              {link}
            </Typography>
            <Typography variant="h5" component="h3">
              {title}
            </Typography>
            <Typography
              variant="body2"
              component="p"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </CardContent>
        </Link>
      </CardActionArea>
      <CardActions>
        <Link href="/technik">
          <Button size="small" variant="contained" color="primary" fullWidth>
            Access
          </Button>
        </Link>
      </CardActions>
    </Card>
  )
}

export default LandingPageOverviewItem
