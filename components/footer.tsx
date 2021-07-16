import Language from '@material-ui/icons/Language'
import Code from '@material-ui/icons/Code'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import { makeStyles } from '@material-ui/core/styles'
import React, { FC } from 'react'
import Link from 'next/link'
import { Tooltip } from '@material-ui/core'

export const useStyles = makeStyles((theme) => ({
  footer: {
    display: 'flex',
    backgroundColor: theme.palette.primary.main,
    marginTop: '2rem',
    '& div': {
      color: 'white',
      width: '50%',
      placeSelf: 'center',
      textAlign: 'center',
      '& p': {
        height: '3rem',
        lineHeight: '3rem',
        margin: 'auto',
      },
      '& a': {
        color: 'white',
        textDecoration: 'underline',
      },
      '& ul': {
        margin: 0,
        listStyle: 'None',
        paddingLeft: 0,

        '& li': {
          paddingInline: '0.75rem',
          display: 'inline-block',
        },
      },
    },
  },
  greyBG: {
    backgroundColor: theme.palette.grey.A700,
  },
}))

const Footer: FC = () => {
  const classes = useStyles()
  return (
    <footer className={classes.footer}>
      <div className={classes.greyBG}>
        <p>
          <Link href="https://arbeitskreis.video/">
            <a>AK Video</a>
          </Link>{' '}
          <Tooltip title="Abbreviated hash of the deployed commit">
            <small>v.{process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}</small>
          </Tooltip>
        </p>
      </div>

      <div>
        <ul>
          <li>
            <Link href="https://github.com/layaxx/akvideo_equipment/blob/main/README.md">
              <a>
                <HelpOutlineIcon />
              </a>
            </Link>
          </li>
          <li>
            <Link href="https://arbeitskreis.video/">
              <a>
                <Language />
              </a>
            </Link>
          </li>
          <li>
            <Link href="https://github.com/layaxx/">
              <a>
                <Code />
              </a>
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  )
}

export default Footer
