import { List, ListItem } from '@material-ui/core'
import React from 'react'

const PublicRoleInfo = () => {
  return (
    <List component="ul" aria-label="you have access to those sites:">
      <ListItem>
        <p>
          <strong>You have no clearance:</strong> You cannot access any internal
          data. <br />
          You can request a higher clearance by messaging{' '}
          <a href="mailto:it@arbeitskreis.video">it@arbeitskreis.video</a>
        </p>
      </ListItem>
    </List>
  )
}

export default PublicRoleInfo
