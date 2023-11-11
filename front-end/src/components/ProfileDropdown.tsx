import React from 'react'
import { NavDropdown } from 'react-bootstrap';
import NavBarLogOut from './NavBarLogOut';
import NavBarCloseAccount from './NavBarCloseAccount';
import '../componentStyles/NavBarStyles.css';

interface ProfileProps {
  setAlert?: (alertText: string, alertVariant: string) => void;
  handleAlert?: () => void;
}
function ProfileDropdown({ handleAlert, setAlert }: ProfileProps): JSX.Element {
  return (
    <>
      <NavDropdown className="nav-bar-bttn nav-link me-3 profile-dropdown" title="Account" align="end" drop='down'>
      <NavDropdown.Header>Account Actions</NavDropdown.Header>
        <NavDropdown.Item className='profile-item ps-3' href="/profile" eventKey={1}>
          Edit Profile
        </NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item eventKey={2} className='profile-item ps-3'>
          <NavBarCloseAccount setAlert={setAlert} handleAlert={handleAlert} />
        </NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item eventKey={3} className='profile-item ps-3'>
          <NavBarLogOut />
        </NavDropdown.Item>
        
      </NavDropdown>
    </>
  )
}

export default ProfileDropdown