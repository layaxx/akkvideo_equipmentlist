import { List, ListItem } from '@material-ui/core'
import Link from 'next/link'
import React, { FC } from 'react'

const AdminRoleInfo: FC = () => {
  return (
    <List component="ul" aria-label="you have access to those sites:">
      <ListItem divider>
        <Link href="/admin">
          <a>
            <strong>Admin-Dashboard:</strong> change roles of and delete Users.
          </a>
        </Link>
      </ListItem>
      <ListItem divider>
        <Link href="/technik">
          <a>
            <strong>Technik:</strong> change values of devices, generate
            Reports.
          </a>
        </Link>
      </ListItem>
      <ListItem>
        <p>
          <strong>Account:</strong> you are currently here.
        </p>
      </ListItem>
    </List>
  )
}

export default AdminRoleInfo
