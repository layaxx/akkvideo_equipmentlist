import axios from 'axios'
import { useRouter } from 'next/dist/client/router'
import { useSnackbar } from 'notistack'
import React, { useState } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import Device from '../../lib/types/Device'

const ModalExample = (props: any) => {
  const device: Device | undefined = props.device

  const [nestedModal, setNestedModal] = useState(false)
  const [closeAll, setCloseAll] = useState(false)

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
      <Modal isOpen={!!device} toggle={toggle}>
        {!!device ? (
          <>
            <ModalHeader toggle={toggle} charCode="x">
              Details for {device.description} ({device.id})
            </ModalHeader>
            <ModalBody>
              <div>
                {Object.entries(device).map((x) => (
                  <p>
                    {x[0]}:{x[1]}
                  </p>
                ))}
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
                <ModalBody>Do you want to proceed to delete</ModalBody>
                <ModalFooter>
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
          </>
        ) : null}
      </Modal>
    </div>
  )
}

export default ModalExample
