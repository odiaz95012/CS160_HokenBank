import React, { useState, useEffect } from 'react';
import PopUpModal from './PopUpModal';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../componentStyles/CancelAutomaticPaymentsStyles.css';

function CancelAutomaticPayments() {
//latest version
    const [isUpcomingPaymentsLoaded, setIsUpcomingPaymentsLoaded] = useState<boolean>(false);



    interface automaticPayment {
        payment_id: number,
        customer_id: number,
        account_id: number,
        amount: number,
        date: string
    }
    const defaultAutomaticPayment = {
        payment_id: -1,
        customer_id: -1,
        account_id: -1,
        amount: 0.00,
        date: ''
    }

    const [upcomingPayments, setUpcomingPayments] = useState<automaticPayment[]>([]);
    const [selectedAutomaticPayment, setSelectedAutomaticPayment] = useState<automaticPayment>(defaultAutomaticPayment);

    const handlePaymentSelection = (payment: automaticPayment) => {
        setSelectedAutomaticPayment(payment);
    };

    const getAutomaticPayments = (authToken: string) => {
        axios.get(`http://localhost:8000/getUpcomingPayments/${0}`, {
            headers: {
                'authorization': `Bearer ${authToken}`
            }
        }).then((response) => setUpcomingPayments(response.data))
            .catch((err) => console.log(err))
    };

    const getCustomerToken = async () => {
        const authToken = Cookies.get('authToken');
        return authToken;
    };

    useEffect(() => {
        const fetchUpcomingPayments = async () => {
            try {
                const authToken = await getCustomerToken();
                if (authToken) {
                    await getAutomaticPayments(authToken);
                    setIsUpcomingPaymentsLoaded(true);
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchUpcomingPayments();
    }, [])

    const fetchUpcomingPayments = async () => {
        const authToken = await getCustomerToken();
        if (authToken) {
          try {
            const response = await axios.get(`http://localhost:8000/getUpcomingPayments/${0}`, {
              headers: {
                'authorization': `Bearer ${authToken}`
              }
            });
            setUpcomingPayments(response.data);
          } catch (err) {
            console.log(err);
          }
        }
      };
      

    const formatDate = (inputDate: string) => {
        const date = new Date(inputDate);

        // Extract the date components
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are 0-based, so add 1
        const year = date.getFullYear();

        // Pad the day and month with leading zeros if needed
        const formattedDay = String(day).padStart(2, '0');
        const formattedMonth = String(month).padStart(2, '0');

        // Create the formatted date string in "MM/DD/YYYY" format
        const formattedDate = `${formattedMonth}/${formattedDay}/${year}`;

        return formattedDate;
    }

    const genUpcomingPaymentList = (payments: automaticPayment[]) => {
        return (
            <>
                {payments.length > 0 ? (
                    <div className='container text-center my-4'>
                        <label className='form-label h5' htmlFor='accountsList'>Upcoming Automatic Payments</label>
                        <p>Select the automatic payment you would like to cancel</p>
                        <div className='overflow-container text-start'>
                            <ul className="list-group payment-list">
                                {payments.map((payment: automaticPayment) => (
                                    <li key={payment.payment_id} className={`list-group-item payment${selectedAutomaticPayment.payment_id === payment.payment_id ? '-selected' : ''}`} onClick={() => handlePaymentSelection(payment)}>
                                        <div className='d-flex align-items-center justify-content-start my-1'>
                                            <h6 className='mb-0'>Payment ID: </h6>
                                            <p className='fs-6 mb-0 ps-1'>{payment.payment_id}</p>
                                        </div>
                                        <div className='d-flex align-items-center justify-content-start my-1'>
                                            <h6 className='mb-0'>Account ID: </h6>
                                            <p className='fs-6 mb-0 ps-1'>{payment.account_id}</p>
                                        </div>
                                        <div className='d-flex align-items-center justify-content-start my-1'>
                                            <h6 className='mb-0'>Amount: </h6>
                                            <p className='fs-6 mb-0 ps-1'>${payment.amount}</p>
                                        </div>
                                        <div className='d-flex align-items-center justify-content-start my-1'>
                                            <h6 className='mb-0'>Monthly Recurring Payment Date: </h6>
                                            <p className='fs-6 mb-0 ps-1'>{formatDate(payment.date)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className='container text-center'>
                        <p>You have no upcoming automatic payments.</p>
                    </div>
                )}
            </>
        );
    };


    const cancelAutomaticPayment = (paymentID: number, authToken: string) => {
        axios.patch(`http://localhost:8000/cancelAutomaticPayment/${paymentID}`, {
            payment_id: paymentID
        }, {
            headers: {
                'authorization': `Bearer ${authToken}`
            }
        }).then((response) => {
            if (response.status === 200) {
                // Remove the cancelled payment from the local state after successful payment cancellation
                setUpcomingPayments((prevPayments) => prevPayments.filter((payment) => payment.payment_id !== paymentID));
            }
        }).catch((err) => console.log(err));
    };

    return (
        <>
            <PopUpModal
                activatingBttn={
                    <button type="button" className="nav-link btn btn-outline-secondary nav-bar-bttn">
                        <i className="bi bi-kanban me-2"></i>Manage Automatic Payments
                    </button>
                }
                data-toggle="modal"
                data-target="#exampleModal"
                title={<div>Cancel Upcoming Automatic Payment</div>}
                body={
                    <>
                        {isUpcomingPaymentsLoaded ? (
                            genUpcomingPaymentList(upcomingPayments)
                        ) : (
                            <div className='container text-center'>
                                <p>Loading upcoming payments.</p>
                            </div>
                        )}
                    </>
                }
                closeBttnText={"Confirm"}
                additionalBttnText={"Cancel"}
                closeOnSubmit={true}
                submitAction={async () => {
                    const authToken = await getCustomerToken();
                    if (authToken) {
                        cancelAutomaticPayment(selectedAutomaticPayment.payment_id, authToken);
                    }
                }}
                buttonOnClick={async () => await fetchUpcomingPayments()}
            />
        </>
    )
}

export default CancelAutomaticPayments;
