import React from 'react'
import { ListGroup, ListGroupItem } from 'reactstrap'

const PublicRoleInfo = () => {
  return (
    <ListGroup>
      <ListGroupItem>
        <p>
          <strong>You have no clearance:</strong> You cannot access any internal
          data. <br />
          You can request a higher clearance by messaging{' '}
          <a href="mailto:it@arbeitskreis.video">it@arbeitskreis.video</a>
        </p>
      </ListGroupItem>
    </ListGroup>
  )
}

export default PublicRoleInfo
