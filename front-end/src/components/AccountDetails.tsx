import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import PopUpModal from './PopUpModal';
import InternalTransfer from './InternalTransfer';
import ExternalTransfer from './ExternalTransfer';
import CloseAccount from './CloseAccount';
import NavBar from './NavBar';
import Dropdown from './Dropdown';
import '../componentStyles/AccountDetailsStyles.css';
import PopUpAlert from './PopUpAlert';


function AccountDetails() {
    const { accountID } = useParams();
    const [selectedNumEntries, setSelectedNumEntries] = useState<number>(0);
    const [isUserDataLoaded, setIsUserDataLoaded] = useState<boolean>(false);
    // this variable controls whether 'Complete', 'Transactions', or 'Payments' are displayed in the corresponding table
    //Default is 'Complete'
    const [selectedHistoryOption, setSelectedHistoryOption] = useState<string>('Complete');
    const [userCompleteHistory, setUserCompleteHistory] = useState<AccountInfo[]>([]);
    const [userTransactionHistory, setUserTransactionHistory] = useState<AccountInfo[]>([]);
    const [userPaymentHistory, setUserPaymentHistory] = useState<AccountInfo[]>([]);

    interface AccountInfo {
        accountID: string | number,
        balance: number,
        account_type: string
    }


    const [accountInfo, setAccountInfo] = useState<AccountInfo>({
        accountID: '',
        balance: 0.00,
        account_type: ''
    });



    useEffect(() => {
        const fetchAccountDetails = async (accountID: string) => {
            axios.get(`http://localhost:8000/getAccount/${accountID}`, {
                headers: {
                    'authorization': `Bearer ${await getCustomerToken()}`
                }
            }).then((response) => {
                setAccountInfo(response.data);
            }).catch((err) => {
                console.log(err);
            });
        };

        if (accountID) {
            fetchAccountDetails(accountID);
            setIsUserDataLoaded(true);
        }
    }, []);

    //history transaction
    const getUserCompleteHistory = async (accountID: string, numberOfEntries: number, authToken: string) => {
        try {
            const response = await axios.get(`http://localhost:8000/getAccountCompleteHistory/${accountID}/${numberOfEntries}`, {
                headers: {
                    'authorization': `Bearer ${authToken}`
                }
            });
            return response.data;

        } catch (err) {
            console.log(err);
            return null;
        }
    };
    const getUserTransactionHistory = async (accountID: string, numberTransactions: number, authToken: string) => {
        try {
            const response = await axios.get(`http://localhost:8000/getAccountTransactionHistory/${accountID}/${numberTransactions}`, {
                headers: {
                    'authorization': `Bearer ${authToken}`
                }
            });
            return response.data;
        } catch (err) {
            console.log(err);
            return null; // Handle the error or return an appropriate value
        }
    };
    const getUserPaymentHistory = async (accountID: string, numberPayments: number, authToken: string) => {
        try {
            const response = await axios.get(`http://localhost:8000/getAccountPaymentHistory/${accountID}/${numberPayments}`, {
                headers: {
                    'authorization': `Bearer ${authToken}`
                }
            });
            return response.data;
        } catch (err) {
            console.log(err);
            return null; // Handle the error or return an appropriate value
        }
    };

    const [dataToRender, setDataToRender] = useState<Payment[]>([]);
    useEffect(() => {
        const fetchTransactionsData = async () => {
            try {
                const authToken = await getCustomerToken();
                // Fetch transaction data based on selected option
                if (selectedHistoryOption === 'Complete' && accountID && authToken) {
                    const completeHistory = await getUserCompleteHistory(accountID, selectedNumEntries, authToken);
                    setUserCompleteHistory(completeHistory);
                    setDataToRender(completeHistory);
                } else if (selectedHistoryOption === 'Transaction' && accountID && authToken) {
                    const transactionHistory = await getUserTransactionHistory(accountID, selectedNumEntries, authToken);
                    setUserPaymentHistory(transactionHistory);
                    setDataToRender(transactionHistory);
                } else if (selectedHistoryOption === 'Payment' && accountID && authToken) {
                    const paymentHistory = await getUserPaymentHistory(accountID, selectedNumEntries, authToken);
                    setUserPaymentHistory(paymentHistory);
                    setDataToRender(paymentHistory);
                }
            } catch (err) {
                console.log(err);
            }
        };

        fetchTransactionsData();
    }, [selectedHistoryOption, selectedNumEntries]);

    interface Payment {
        transaction_id: string | number,
        account_id: string | number,
        action: string,
        date: string,
        amount: number
    }

    const renderTableData = (dataToRender: Payment[], numOfEntries: number) => {
        if (!dataToRender || dataToRender.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="text-center py-4">
                        <h5>No Payment History</h5>
                    </td>
                </tr>
            )
        }

        if (numOfEntries === 0) {
            return dataToRender.map((payment) => (
                <tr key={payment.transaction_id}>
                    <th scope='row'>{payment.transaction_id}</th>
                    <td>{payment.account_id}</td>
                    <td>{payment.action}</td>
                    <td>{formatDate(payment.date)}</td>
                    <td>{payment.amount < 0 ? `-$${formatBalance(Math.abs(payment.amount))}` : `$${formatBalance(payment.amount)}`}</td>
                </tr>
            ));
        } else {
            return dataToRender.slice(0, numOfEntries).map((payment) => (
                <tr key={payment.transaction_id}>
                    <th scope='row'>{payment.transaction_id}</th>
                    <td>{payment.account_id}</td>
                    <td>{payment.action}</td>
                    <td>{formatDate(payment.date)}</td>
                    <td>{payment.amount < 0 ? `-$${formatBalance(Math.abs(payment.amount))}` : `$${formatBalance(payment.amount)}`}</td>
                </tr>
            ));
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
    };

    const formatBalance = (balance: number) => {

        /// Convert the number to a string
        const numStr = balance.toString();

        // Split the number into integer and decimal parts (if applicable)
        const [integerPart, decimalPart] = numStr.split('.');

        // Add commas to the integer part
        const integerWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');


        // Reconstruct the formatted number
        if (decimalPart) {
            return integerWithCommas + '.' + decimalPart;
        } else {

            return integerWithCommas + '.00';
        }
    };



    const getCustomerToken = async () => {
        const authToken = Cookies.get('authToken');
        return authToken;
    };

    const navigate = useNavigate();

    interface Alert {
        text: string,
        variant: string
    }
    const defaultAlert: Alert = {
        text: '',
        variant: ''
    }
    const [alert, setAlert] = useState<Alert>(defaultAlert);



    const handleAlert = () => {
        const alertElem = document.getElementById('pop-up-alert') as HTMLElement;
        alertElem.style.visibility = 'visible';
        // Automatically dismiss the alert after 3 seconds
        setTimeout(() => {
            setAlert(defaultAlert); // reset alert
            alertElem.style.visibility = 'hidden';
            window.location.reload();
        }, 3000);
    };

    const [password, setPassword] = useState<string>('');

    interface TransferData {
        accountID: string;
        toAccountID: string;
        amount: string;
    }


    const [transferData, setTransferData] = useState<TransferData>({
        accountID: accountID ?? '',
        toAccountID: '',
        amount: ''
    });





    const handlePasswordInput = (e: React.ChangeEvent<HTMLElement>) => {
        const target = e.target as HTMLInputElement;
        setPassword(target.value);
    }

    const handleInternalTransferAmount = (e: React.ChangeEvent<HTMLElement>) => {
        const { name, value } = e.target as HTMLInputElement;
        setTransferData({ ...transferData, [name]: value });
    }

    const handleExternalTransferData = (e: React.ChangeEvent<HTMLElement>) => {
        const { name, value } = e.target as HTMLInputElement;
        setTransferData({ ...transferData, [name]: value });
    };

    const handleTransferAccountSelection = (selectedAccountId: string) => {
        setTransferData({ ...transferData, toAccountID: selectedAccountId });
    }

    const closeAccount = (authToken: string, accountID: number, password: string) => {
        if (password === '') {
            setAlert({ text: "Please enter your password", variant: "warning" });
            handleAlert();
            return;
        }
        axios.patch(`http://localhost:8000/closeAccount/${accountID}`, {
            password: password
        }, {
            headers: {
                'authorization': `Bearer ${authToken}`
            }
        }).then(() => {
            navigate('/home');
        })
            .catch((err) => {
                console.log(err);
                setAlert({ text: err.response.data, variant: "danger" });
                handleAlert();
            });
    };

    const isValidAmount = (amount: string) => {
        const pattern = /^\d+\.\d{2}$/;
        return pattern.test(amount) && parseFloat(amount) > 0;
    };
    const transfer = async (accountID: string, toAccount: string, amount: string) => {
        if (accountID === '' || toAccount === '' || amount === '') {
            setAlert({ text: 'Please fill out all fields.', variant: 'warning' });
            handleAlert();
            return;
        }
        if (!isValidAmount(amount)) {
            setAlert({ text: 'Please enter a valid amount. (e.g. 500.00)', variant: 'warning' });
            handleAlert();
            return;
        }

        const parsedToAccountId = parseInt(toAccount);
        const parsedAmount = parseFloat(amount).toFixed(2);
        const parsedAccountId = parseInt(accountID);

        try {
            const response = await axios.patch(
                `http://localhost:8000/transfer/${parsedAccountId}/${parsedToAccountId}/${parsedAmount}`,
                {
                    account_id: parsedAccountId,
                    to_account_id: parsedToAccountId,
                    amount: parsedAmount,
                },
                {
                    headers: {
                        'authorization': `Bearer ${await getCustomerToken()}`,
                    },
                }
            );
            if (response.data) {
                setAlert({ text: 'Transfer successful.', variant: 'success' });
                handleAlert();
                setTransferData({ accountID: accountID, toAccountID: '', amount: '' });
            }

        } catch (err: any) {
            setAlert({ text: `Transfer failed: ${err.message}`, variant: 'danger' });
            handleAlert();
        }
    };






    return (
        <div className='overflow-hidden'>
            {/* Responsive navbar */}
            <NavBar caller='accountDetails' />
            <div className="d-flex justify-content-center mt-3" id='pop-up-alert'>
                <PopUpAlert text={alert ? alert.text : ''} variant={alert ? alert.variant : 'info'} />
            </div>
            {isUserDataLoaded ? (
                <div className="container mb-5" style={{ border: '1px solid grey', borderRadius: '15px' }}>

                    <div className='row'>
                        <div className='col-md-12 text-center'>
                            <p className='h4 py-3'>Account ID: {accountID}</p>
                            <p className='py-1'>Account Type: {accountInfo.account_type}</p>
                            <p className='py-1'>Balance: ${formatBalance(accountInfo.balance)}</p>
                        </div>
                    </div>
                    <div className='row mb-3'>
                        <div className='col-md-4 feature-bttn'>
                            <PopUpModal
                                activatingBttn={<button className="btn btn-primary my-2">Internal Transfer</button>}
                                title={<div style={{ textAlign: "center" }}><p className="h4">Internal Transfer</p></div>}
                                body={<InternalTransfer
                                    handleAccountSelect={handleTransferAccountSelection}
                                    handleAmountInput={handleInternalTransferAmount}
                                />}
                                closeOnSubmit={true}
                                closeBttnText='Transfer'
                                additionalBttnText='Cancel'
                                submitAction={async () => {
                                    if (accountID) {
                                        transfer(accountID, transferData.toAccountID, transferData.amount);

                                    }
                                }}
                            />
                        </div>
                        <div className='col-md-4 feature-bttn'>
                            <PopUpModal
                                activatingBttn={<button className="btn btn-primary my-2">External Transfer</button>}
                                title={<div style={{ textAlign: "center" }}><p className="h4">External Transfer</p></div>}
                                body={
                                    <ExternalTransfer
                                        handleExternalTransferInput={handleExternalTransferData}
                                    />
                                }
                                closeOnSubmit={true}
                                closeBttnText='Transfer'
                                additionalBttnText='Cancel'
                                submitAction={async () => {
                                    if (accountID) {
                                        transfer(accountID, transferData.toAccountID, transferData.amount);
                                    }
                                }}
                            />
                        </div>
                        <div className='col-md-4 feature-bttn'>
                            <PopUpModal
                                activatingBttn={<button className="btn btn-primary my-2">Close Account</button>}
                                title={<div style={{ textAlign: "center" }}><p className="h4">Close Account</p></div>}
                                body={<CloseAccount
                                    account_id={accountID ? parseInt(accountID) : -1}
                                    onInputChange={handlePasswordInput}
                                />}
                                closeOnSubmit={true}
                                submitAction={async () => {
                                    const authToken = await getCustomerToken();
                                    if (authToken && accountID) {
                                        closeAccount(authToken, parseInt(accountID), password);
                                    }
                                }}
                                closeBttnText={"Close Account"}
                                additionalBttnText={"Cancel"}
                                closeBtnVariant='danger'
                            />
                        </div>
                    </div>


                </div>
            ) : (
                <header className="bg-dark py-5">
                    <div className="container px-5">
                        <div className="row gx-5 justify-content-center">
                            <div className="col-lg-6">
                                <div className="text-center my-5">
                                    <div className="d-flex justify-content-center">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            )}
            <div className='row'>
                <div className='col-md-6 my-1'>
                    <div className='d-flex justify-content-start ms-4 ps-3'>
                        <Dropdown
                            selectedOption={selectedNumEntries}
                            onSelectedOption={(option: number) => setSelectedNumEntries(option)}
                        />
                    </div>

                </div>

                <div className='col-md-6 my-1'>
                    <div className='d-flex justify-content-center'>
                        <div className="btn-group" id="historyOptions" role="group" aria-label="Basic radio toggle button group">

                            <input type="radio" value="Complete" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" checked={selectedHistoryOption === 'Complete'} onChange={() => setSelectedHistoryOption('Complete')} />
                            <label className="btn btn-outline-primary" htmlFor="btnradio1">Complete</label>

                            <input type="radio" value="Transaction" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" checked={selectedHistoryOption === 'Transaction'} onChange={() => setSelectedHistoryOption('Transaction')} />
                            <label className="btn btn-outline-primary" htmlFor="btnradio2">Transactions</label>

                            <input type="radio" value="Payment" className="btn-check" name="btnradio" id="btnradio3" autoComplete="off" checked={selectedHistoryOption === 'Payment'} onChange={() => setSelectedHistoryOption('Payment')} />
                            <label className="btn btn-outline-primary" htmlFor="btnradio3">Payments</label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row overflow-auto mt-4 mb-5">
                <table className="col-md-12 table table-hover mx-4">
                    <thead className="thead-dark">
                        <tr>
                            <th scope='col'>Transaction ID</th>
                            <th scope='col'>Account ID</th>
                            <th scope='col'>Transaction Type</th>
                            <th scope='col'>Date</th>
                            <th scope='col'>Amount</th>

                        </tr>
                    </thead>
                    <tbody>
                        {isUserDataLoaded && dataToRender ? (
                            renderTableData(dataToRender, selectedNumEntries)
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-4">
                                    <h5>Fetching data...</h5>
                                </td>
                            </tr>

                        )}
                    </tbody>

                </table>
            </div>

            {/* Footer */}
            <footer className="py-5 bg-dark">
                <div className="container px-5">
                    <p className="m-0 text-center text-white">Copyright &copy; Hoken 2023</p>
                </div>
            </footer>
        </div>
    );
}

export default AccountDetails;
