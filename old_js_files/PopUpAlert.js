import React from 'react';
import Alert from 'react-bootstrap/Alert';

function PopUpAlert({ text, variant }) {
  return (
    <Alert variant={variant}> {/* Use the variant prop to set the alert type */}
      {text}
    </Alert>
  );
}

export default PopUpAlert;
