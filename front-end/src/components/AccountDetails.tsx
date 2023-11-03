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
        const fetchAccountDetails = async (accountID:string) => {
            axios.get(`http://localhost:8000/getAccount/${accountID}`, {
                headers: {
                    'authorization': `Bearer ${await getCustomerToken()}`
                }
            }).then((response) => {
                console.log(response);
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
    const getUserCompleteHistory = async (accountID:string, numberOfEntries:number, authToken:string) => {
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
    const getUserTransactionHistory = async (accountID:string, numberTransactions:number, authToken:string) => {
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
    const getUserPaymentHistory = async (accountID:string, numberPayments:number, authToken:string) => {
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

    const renderTableData = (dataToRender:Payment[], numOfEntries:number) => {
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
    const formatDate = (inputDate:string) => {
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

    const formatBalance = (balance:number) => {
        // Use toLocaleString to format the balance with commas
        return balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }



    const getCustomerToken = async () => {
        const authToken = Cookies.get('authToken');
        return authToken;
    };

    const navigate = useNavigate();
    const gotoCloseAccountPage = () => {
        navigate('/closeAccount');
    };
    const gotoInternalTransferPage = () => {
        navigate('/internalTransfer');
    };
    const gotoExternalTransferPage = () => {
        navigate('/externalTransfer');
    };

    return (
        <>
            {/* Responsive navbar */}
            <NavBar caller='accountDetails'/>

            {isUserDataLoaded ? (
                <div className="container my-5" style={{ border: '1px solid grey', borderRadius: '15px' }}>

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
                                body={<InternalTransfer />}
                            />
                        </div>
                        <div className='col-md-4 feature-bttn'>
                            <PopUpModal
                                activatingBttn={<button className="btn btn-primary my-2">External Transfer</button>}
                                title={<div style={{ textAlign: "center" }}><p className="h4">External Transfer</p></div>}
                                body={<ExternalTransfer />}
                            />
                        </div>
                        <div className='col-md-4 feature-bttn'>
                            <PopUpModal
                                activatingBttn={<button className="btn btn-primary my-2">Close Account</button>}
                                title={<div style={{ textAlign: "center" }}><p className="h4">Close Account</p></div>}
                                body={<CloseAccount account_id={accountID? parseInt(accountID) : -1}/>}
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
                    <div className="d-flex justify-content-start ms-4">
                        <Dropdown
                            selectedOption={selectedNumEntries}
                            onSelectedOption={(option) => setSelectedNumEntries(option)}
                        />
                    </div>
                </div>
                <div className='col-md-6 my-1'>
                    <div className="d-flex justify-content-end me-4">
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
            <div className="row overflow-auto my-4">
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
                        {isUserDataLoaded && dataToRender? (
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
        </>
    );
}

export default AccountDetails;
