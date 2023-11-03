import React from 'react';
import Alert from 'react-bootstrap/Alert';

interface PopUpAlertProps {
  text: string;
  variant: string;
}

const PopUpAlert: React.FC<PopUpAlertProps> = ({ text, variant }) => {
  //latest version
  return (
    <Alert variant={variant}>
      {text}
    </Alert>
  );
}

export default PopUpAlert;

