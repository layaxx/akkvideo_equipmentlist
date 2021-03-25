import Link from 'next/link'
import React from 'react'
import { ListGroup, ListGroupItem } from 'reactstrap'

const AdminRoleInfo = () => {
  return (
    <ListGroup>
      <ListGroupItem>
        <Link href="/admin">
          <a>
            <strong>Admin-Dashboard:</strong> change roles of and delete Users.
          </a>
        </Link>
      </ListGroupItem>
      <ListGroupItem>
        <Link href="/technik">
          <a>
            <strong>Technik:</strong> change values of devices, generate
            Reports.
          </a>
        </Link>
      </ListGroupItem>
      <ListGroupItem>
        <p>
          <strong>Account:</strong> you are currently here.
        </p>
      </ListGroupItem>
    </ListGroup>
  )
}

export default AdminRoleInfo
