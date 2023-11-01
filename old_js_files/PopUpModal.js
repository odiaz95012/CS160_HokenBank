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

export default function PopUpModal({
    activatingBttn,
    title,
    body,
    closeBttnText,
    buttonOnClick,
    additionalBttnText,
    submitAction,
    closeOnSubmit,
}) {
    const [basicModal, setBasicModal] = useState(false);


    const toggleShow = () => setBasicModal(!basicModal);

    // Close the modal after submit action if closeOnSubmit is passed in as true, else only execute the passed in function
    const handleModalClose = () => {
        if (closeOnSubmit && typeof submitAction === 'function') {
            submitAction();
            toggleShow();
        } else if ((!closeOnSubmit || closeOnSubmit == null) && typeof submitAction === 'function') {
            submitAction();
        }
    };


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
        <div>
            <div className='row'>
                <div className='col'>
                    {activatingButtonWithClickHandler}
                </div>
            </div>
            <div className='row'>
                <div className='col'>
                    <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
                        <MDBModalDialog>
                            <MDBModalContent>
                                <MDBModalHeader>
                                    <MDBModalTitle>{title}</MDBModalTitle>
                                    <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
                                </MDBModalHeader>
                                <MDBModalBody>{body}</MDBModalBody>
                                <MDBModalFooter>
                                    {additionalBttnText && ( // Check if additionalBttnText is provided

                                        <button type="button" className="btn btn-secondary" onClick={toggleShow}>
                                            {additionalBttnText}
                                        </button>
                                    )}
                                    {closeBttnText && (
                                        <button type="button" className="btn btn-primary" onClick={handleModalClose}>
                                            {closeBttnText}
                                        </button>
                                    )}
                                </MDBModalFooter>
                            </MDBModalContent>
                        </MDBModalDialog>
                    </MDBModal>
                </div>
            </div>
        </div>
    );
}
