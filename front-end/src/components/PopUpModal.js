import React, { useState } from 'react';
import {
    MDBBtn,
    MDBModal,
    MDBModalDialog,
    MDBModalContent,
    MDBModalHeader,
    MDBModalTitle,
    MDBModalBody,
    MDBModalFooter,
} from 'mdb-react-ui-kit';

export default function PopUpModal({ activatingBttn, title, body, buttonOnClick }) {
    const [basicModal, setBasicModal] = useState(false);


    const toggleShow = () => setBasicModal(!basicModal);

    // Add an onClick handler to the activating button
    const activatingButtonWithClickHandler = React.cloneElement(activatingBttn, {
        onClick: () => {
            toggleShow();
            if (typeof buttonOnClick === 'function') {
                buttonOnClick();
            }
        }
    });

    return (
        <div className="d-flex justify-content-center">

            {activatingButtonWithClickHandler}
            <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
                <MDBModalDialog>
                    <MDBModalContent>
                        <MDBModalHeader>
                            <MDBModalTitle>{title}</MDBModalTitle>
                            <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
                        </MDBModalHeader>
                        <MDBModalBody>{body}</MDBModalBody>

                        <MDBModalFooter>
                            <button type="button" className="btn btn-secondary" onClick={toggleShow}>Close</button>
                        </MDBModalFooter>
                    </MDBModalContent>
                </MDBModalDialog>
            </MDBModal>
        </div>
    );
}