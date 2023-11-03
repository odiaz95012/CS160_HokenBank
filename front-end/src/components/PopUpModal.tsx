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

interface PopUpModalProps {
    activatingBttn: React.ReactElement; // Use React.ReactElement for elements
    title: React.ReactNode;
    body: React.ReactNode; // Use React.ReactNode for content
    closeBttnText?: string;
    buttonOnClick?: Function; // Make it optional
    additionalBttnText?: string;
    submitAction?: Function;
    closeOnSubmit?: boolean;
}

function PopUpModal(props: PopUpModalProps) { // Use props as an argument
    //latest version
    const [basicModal, setBasicModal] = useState(false);

    const toggleShow = () => setBasicModal(!basicModal);

    // Close the modal after submit action if closeOnSubmit is passed in as true, else only execute the passed-in function
    const handleModalClose = () => {
        if (props.closeOnSubmit && typeof props.submitAction === 'function') {
            props.submitAction();
            toggleShow();
        } else if ((!props.closeOnSubmit || props.closeOnSubmit == null) && typeof props.submitAction === 'function') {
            props.submitAction();
        }
    };

    // Add an onClick handler to the activating button
    const activatingButtonWithClickHandler = React.cloneElement(props.activatingBttn, {
        onClick: () => {
            toggleShow();
            if (typeof props.buttonOnClick === 'function') {
                props.buttonOnClick();
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
                                    <MDBModalTitle>{props.title}</MDBModalTitle>
                                    <MDBBtn className='btn-close' color='none' onClick={toggleShow}></MDBBtn>
                                </MDBModalHeader>
                                <MDBModalBody>{props.body}</MDBModalBody>
                                <MDBModalFooter>
                                    {props.additionalBttnText && (
                                        <button type="button" className="btn btn-secondary" onClick={toggleShow}>
                                            {props.additionalBttnText}
                                        </button>
                                    )}
                                    {props.closeBttnText && (
                                        <button type="button" className="btn btn-primary" onClick={handleModalClose}>
                                            {props.closeBttnText}
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

export default PopUpModal;
