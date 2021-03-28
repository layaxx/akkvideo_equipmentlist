import axios from 'axios'
import { useRouter } from 'next/dist/client/router'
import { useSnackbar } from 'notistack'
import React, { useState } from 'react'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Input,
  Label,
} from 'reactstrap'
import roles from '../../lib/auth/roles'

const UserModal = (props: any) => {
  const user: { email: string; role: roles; uid: string } = props.user

  const [nestedModal, setNestedModal] = useState(false)
  const [closeAll, setCloseAll] = useState(false)
  const [roleState, setRoleState] = useState('member')

  // used for navigation an query params
  const router = useRouter()

  // used to show notifications
  const { enqueueSnackbar } = useSnackbar()

  const toggle = () => {
    props.clear()
  }

  const toggleNested = () => {
    setNestedModal(!nestedModal)
    setCloseAll(false)
  }

  const closeAllFunc = () => {
    setNestedModal(false)
    props.clear()
  }

  const deleteUser = () => {
    axios
      .post('/api/deleteUser', { uid: user.uid })
      .then((res) => {
        if (res.status === 200) {
          router.replace('/admin?mode=del&user=' + encodeURI(user.email))
        }
      })
      .catch(() =>
        enqueueSnackbar('Failed to delete user ' + user.email, {
          variant: 'error',
        })
      )
  }

  const changeRole = () => {
    axios
      .post('/api/changeRole', { uid: user.uid, newRole: roleState })
      .then((res) => {
        if (res.status === 200) {
          closeAllFunc()
          router.replace(
            '/admin?mode=chmod&user=' +
              encodeURI(user.email) +
              '&role=' +
              roleState
          )
        }
      })
      .catch(() =>
        enqueueSnackbar(
          'Failed to change role of ' + user.email + ' to ' + roleState,
          {
            variant: 'error',
          }
        )
      )
  }

  if (router.query.mode === 'del' && router.query.user) {
    enqueueSnackbar('Successfully deleted user ' + router.query.user, {
      variant: 'success',
    })
    router.replace('/admin', undefined, { shallow: true })
  } else if (
    router.query.mode === 'chmod' &&
    router.query.user &&
    router.query.role
  ) {
    enqueueSnackbar(
      'Successfully changed role of ' +
        router.query.user +
        ' to ' +
        router.query.role,
      {
        variant: 'success',
      }
    )
    router.replace('/admin', undefined, { shallow: true })
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <Modal isOpen={!!user.email} toggle={toggle}>
        <ModalHeader toggle={toggle}>Update {user.email}</ModalHeader>
        <ModalBody>
          <div>
            <div>
              <FormGroup>
                <Label for="exampleSelect">
                  Change role <em>{user.role}</em> to{' '}
                </Label>
                <Input
                  type="select"
                  name="select"
                  id="exampleSelect"
                  value={roleState}
                  onChange={(event) => setRoleState(event.target.value)}
                >
                  {Object.values(roles)
                    .filter((val: string) => val !== user.role)
                    .map((val: string) =>
                      // prevents promoting users to Admin
                      val === roles.Admin ? null : (
                        <option key={val}>{val}</option>
                      )
                    )}
                </Input>
              </FormGroup>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Button color="warning" onClick={changeRole}>
                Update Role
              </Button>
            </div>
          </div>
          <hr />
          <div style={{ textAlign: 'center' }}>
            <Button color="danger" onClick={toggleNested}>
              Delete User
            </Button>
          </div>
          <Modal
            isOpen={nestedModal}
            toggle={toggleNested}
            onClosed={closeAll ? toggle : undefined}
            charCode="x"
          >
            <ModalHeader>Confirm Deletion</ModalHeader>
            <ModalBody>
              Do you want to proceed to delete <strong>{user.email}</strong>?
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={deleteUser}>
                Delete User
              </Button>
              <Button color="secondary" onClick={toggleNested}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default UserModal
