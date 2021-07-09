import React, { FC } from 'react'

const PrivacyNotice: FC = () => {
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <em>Privacy Notice:</em>
      <br />
      <small>
        This action will leave a cookie on your machine. This is used for
        authentication only and is necessary if you want to access protected
        sites.
      </small>
    </div>
  )
}

export default PrivacyNotice
