import React, { FC, useState } from 'react'
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  NavbarText,
  Button,
} from 'reactstrap'
import Link from 'next/link'
import { useRouter } from 'next/dist/client/router'
import { firebaseClient } from '../firebaseClient'
import nookies from 'nookies'
import { useAuth } from '../auth'
import { gray } from '../lib/colors'
import roles from '../lib/auth/roles'

const styles = {
  top: { backgroundColor: gray, marginBottom: '2rem' },
  wrapper: {
    backgroundColor: gray,
    margin: 'auto',
    maxWidth: '50rem',
  },
  container: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    color: 'white',
    margin: 0,
  },
  button: {
    verticalAlign: 'initial',
    marginLeft: 16,
    cursor: 'pointer',
    color: 'black',
    padding: '5px 25px',
    textDecoration: 'none',
    fontSize: '16px',
    transitionDuration: '0.4s',
    backgroundColor: 'white',
    border: '2px solid #008CBA',
  },
}

const NavBar: FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(!isOpen)

  const { user } = useAuth()

  const router = useRouter()

  const signout = async () => {
    await firebaseClient.auth().signOut()
    nookies.destroy(null, 'token')
    router.push('/')
  }

  return (
    <div style={styles.top}>
      <Navbar style={styles.wrapper} dark expand="md">
        <NavbarBrand tag="div">
          <Link href="/">AK Video [intern]</Link>
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            <NavItem>
              <NavLink tag="div">
                <Link href="/technik/">Technikverwaltung</Link>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag="div">
                <Link href="/foodle/">Foodle</Link>
              </NavLink>
            </NavItem>
            {/* 
          // TODO: will be implemented later on
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav caret>
              Assets
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem>Option 1</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Option 2</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown> */}
            {user?.role === roles.Admin && (
              <NavItem>
                <NavLink tag="div">
                  <Link href="/admin/">Admin</Link>
                </NavLink>
              </NavItem>
            )}
          </Nav>
          <NavbarText>
            <div style={styles.container}>
              {user ? (
                <p style={{ margin: 0 }}>
                  <Link href="/account">
                    <a> {user.email}</a>
                  </Link>

                  <Button
                    type="button"
                    onClick={() => {
                      signout()
                    }}
                    style={styles.button}
                  >
                    Sign out
                  </Button>
                </p>
              ) : (
                <>
                  <Link
                    href={(() => {
                      if (router.asPath === '/' || router.asPath === '/login') {
                        return '/login'
                      }
                      return `/login?redirect=${router.asPath.substring(1)}`
                    })()}
                  >
                    <a>
                      <Button type="button" style={styles.button}>
                        Sign in
                      </Button>
                    </a>
                  </Link>
                </>
              )}
            </div>
          </NavbarText>
        </Collapse>
      </Navbar>
    </div>
  )
}

export default NavBar
