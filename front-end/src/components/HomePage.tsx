import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import '../componentStyles/HomeStyles.css';
import axios, { AxiosResponse } from 'axios';
import NavBar from './NavBar';
import Dropdown from './Dropdown';
import PopUpModal from './PopUpModal';
import DatePicker from './DatePicker';
import PopUpAlert from './PopUpAlert';
import Accounts from './Accounts.tsx';
import { get } from 'http';


function HomePage() {
    //latest version

    interface UserData {
        customer_id: string,
        username: string,
        email: string,
        full_name: string,
        age: number,
        gender: string,
        zip_code: number,
        status: string
    }

    const defaultUserData: UserData = {
        customer_id: '',
        username: '',
        email: '',
        full_name: '',
        age: 0,
        gender: '',
        zip_code: 0,
        status: ''
    }

    const [userData, setUserData] = useState<UserData>(defaultUserData);



    const [isUserDataLoaded, setIsUserDataLoaded] = useState<boolean>(false);
    const [selectedNumEntries, setSelectedNumEntries] = useState<number>(0);




    const getUserData = async (authToken: string) => {
        await axios.get(`http://localhost:8000/getCustomer`, {
            headers: {
                'authorization': `Bearer ${authToken}`
            }
        })
            .then((response: AxiosResponse) => {
                setUserData(response.data);
            }).catch((err) => {
                console.log(err);
            })
    };

    // this variable controls whether 'Complete', 'Transactions', or 'Payments' are displayed in the corresponding table
    //Default is 'Complete'
    const [selectedHistoryOption, setSelectedHistoryOption] = useState<string>('Complete');
    const [userCompleteHistory, setUserCompleteHistory] = useState<Transaction[]>([]);
    const [userTransactionHistory, setUserTransactionHistory] = useState<Transaction[]>([]);
    const [userPaymentHistory, setUserPaymentHistory] = useState<Transaction[]>([]);

    interface Transaction {
        transaction_id: number,
        account_id: number,
        action: string,
        date: string,
        amount: number
    };

    const getUserCompleteHistory = async (numberOfEntries: number, authToken: string) => {
        try {
            const response = await axios.get(`http://localhost:8000/getCustomerCompleteHistory/${numberOfEntries}`, {
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



    const getUserTransactionHistory = async (numberTransactions: number, authToken: string) => {
        try {
            const response = await axios.get(`http://localhost:8000/getCustomerTransactionHistory/${numberTransactions}`, {
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


    const getUserPaymentHistory = async (numberPayments: number, authToken: string) => {
        try {
            const response = await axios.get(`http://localhost:8000/getCustomerPaymentHistory/${numberPayments}`, {
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


    const [dataToRender, setDataToRender] = useState<Transaction[]>([]);

    useEffect(() => {
        const fetchTransactionsData = async () => {
            try {
                const authToken = await getCustomerToken();
                // Fetch transaction data based on selected option
                if (selectedHistoryOption === 'Complete' && authToken) {
                    const completeHistory = await getUserCompleteHistory(selectedNumEntries, authToken);
                    setUserCompleteHistory(completeHistory);
                    setDataToRender(completeHistory);
                } else if (selectedHistoryOption === 'Transaction' && authToken) {
                    const transactionHistory = await getUserTransactionHistory(selectedNumEntries, authToken);
                    setUserPaymentHistory(transactionHistory);
                    setDataToRender(transactionHistory);
                } else if (selectedHistoryOption === 'Payment' && authToken) {
                    const paymentHistory = await getUserPaymentHistory(selectedNumEntries, authToken);
                    setUserPaymentHistory(paymentHistory);
                    setDataToRender(paymentHistory);
                }
            } catch (err) {
                console.log(err);
            }
        };

        fetchTransactionsData();
    }, [selectedHistoryOption, selectedNumEntries]);


    const formatBalance = (balance: number) => {
        // Use toLocaleString to format the balance with commas
        return balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const renderTableData = (dataToRender: Transaction[], numOfEntries: number) => {
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

    interface Account {
        account_id: number,
        account_type: string,
        balance: number
    }

    const [userAccounts, setUserAccounts] = useState<Account[]>([]);
    const getUserAccounts = async (authToken: string) => {
        await axios.get(`http://localhost:8000/getCustomerAccounts`, {
            headers: {
                'authorization': `Bearer ${authToken}`
            }
        }).then((response) => {
            setUserAccounts(response.data);
        }).catch((err) => {
            console.log(err);
        })
    };




    const [selectedAccountType, setSelectedAccountType] = useState<string>();

    const handleAccountTypeSelection = (event: React.MouseEvent<HTMLInputElement>) => {
        const selectedType = (event.target as HTMLInputElement).value;
        setSelectedAccountType(selectedType);
    };

    //To display success & error alerts after they execute some feature
    interface Alert {
        text: string,
        variant: string
    }
    const defaultAlert: Alert = {
        text: '',
        variant: ''
    }
    const [alert, setAlert] = useState<Alert>(defaultAlert);

    const openAccount = async (authToken: string, accountType: string) => {
        if (accountType === null) {
            setAlert({ text: "The account type was not provided. Please try again", variant: "warning" });
            handleAlert();
            return;
        }
        await axios.post(`http://localhost:8000/openAccount`,
            {
                account_type: accountType
            }, {
            headers: {
                'authorization': `Bearer ${authToken}`
            }
        }).then((response) => {
            const newAccount = response.data;
            setUserAccounts([...userAccounts, newAccount]);
            setSelectedAccountType(''); //reset account type selection
            setAlert({ text: "Account creation successful", variant: "success" })
        }).catch((err) => {
            console.log(err);
            setAlert({ text: err.response.data, variant: "danger" })
        })
        handleAlert();
    }

    //Date attribute is for automatic payments only
    interface PaymentData {
        accountID: string | number, // can be string or number because the value is retrieved from the radio button
        amount: string | number, //can be string or number because the value is retrieved from the input field
        date: Date | string | null
    }
    const defaultPaymentData: PaymentData = {
        accountID: '',
        amount: '',
        date: null
    }
    const [paymentData, setPaymentData] = useState<PaymentData>(defaultPaymentData);
    const [automaticPaymentDate, setAutomaticPaymentDate] = useState<string>('');

    const handlePaymentDetailsChange = (e: React.MouseEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target as HTMLInputElement;
        setPaymentData({ ...paymentData, [name]: value });
    };

    const handleAutomaticPaymentDateChange = (date: Date) => {
        const formattedDate = formatAutomaticPaymentDate(date);
        setAutomaticPaymentDate(formattedDate);
        setPaymentData({ ...paymentData, date: formattedDate });
    };



    const normalPayment = async (accountId: string, amt: string, authToken: string) => {
        if (accountId === '' || amt === '') {
            setAlert({ text: 'At least one required input field was not provided. Please try again.', variant: 'warning' });
            handleAlert();
            return;
        }
        if (!isValidAmount(amt)) {
            setAlert({ text: "Please enter a valid amount (e.g. $250.00).", variant: "warning" });
            handleAlert();
            return;
        }
        await axios.patch(`http://localhost:8000/normalPayment/${accountId}/${amt}`, {
            account_id: parseInt(accountId),
            amount: parseInt(amt)
        }, {
            headers: {
                'authorization': `Bearer ${authToken}`
            }
        }).then((response) => {
            const updatedAccountData = response.data;

            // Find the index of the updated account in the userAccounts array.
            const accountIndex = userAccounts.findIndex(
                (account) => account.account_id === updatedAccountData.account_id
            );

            if (accountIndex !== -1) {
                // Create a new array with the updated account data.
                const updatedAccounts = [...userAccounts];
                updatedAccounts[accountIndex] = updatedAccountData;

                // Update the state with the new account data.
                setUserAccounts(updatedAccounts);

            }

            setAlert({ text: 'Payment successful!', variant: 'success' });
        }).catch((err) => {
            console.log(err);
            setAlert({ text: err.response.data, variant: 'danger' });
        })
        handleAlert();
    };

    const handleAlert = () => {
        const alertElem = document.getElementById('pop-up-alert') as HTMLElement;
        alertElem.style.visibility = 'visible';
        // Automatically dismiss the alert after 3 seconds
        setTimeout(() => {
            setAlert(defaultAlert); // reset alert
            alertElem.style.visibility = 'hidden';
        }, 3000);
    }

    const formatAutomaticPaymentDate = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, so add 1
        const day = date.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    };


    const automaticPayment = async (accountID: string, amt: string | number, paymentDate: string, authToken: string) => {
        if (accountID === '' || amt === '' || paymentDate === null) {
            setAlert({ text: 'At least one required input field was not provided. Please try again.', variant: 'warning' });
            handleAlert();
            return;
        } else if (!isValidAmount(amt.toString())) {
            setAlert({ text: "Please enter a valid amount for the payment (e.g. $250.00).", variant: "warning" });
            handleAlert();
            return;
        } else {

            const accountIDValue = parseInt(accountID);
            const amtValue = typeof amt === 'number' ? amt.toFixed(2) : parseFloat(amt as string).toFixed(2);


            const requestData: PaymentData = {
                accountID: accountIDValue,
                amount: amtValue,
                date: paymentDate,
            };


            await axios.patch(`http://localhost:8000/automaticPayment/${requestData.accountID}/${requestData.amount}/${requestData.date}`, {
                account_id: requestData.accountID,
                amount: requestData.amount,
                date: requestData.date
            }, {
                headers: {
                    'authorization': `Bearer ${authToken}`
                }
            }).then(() => {
                setAlert({ text: "The automatic payment was successfully set.", variant: "success" });
            }).catch((err) => {
                console.log(err);
                if (err.response && err.response.data != null) {
                    // If specific account related error occurs
                    setAlert({ text: err.response.data, variant: "danger" });
                } else {
                    // uncaught errors
                    setAlert({ text: "Something went wrong while executing the automatic payment. Please try again.", variant: "danger" });
                }

            })
            handleAlert();
        }
    };

    const isValidAmount = (amount: string) => {
        // {any_number_of_digits}.XX, where XX is exactly two digits
        const pattern = /^\d+\.\d{2}$/;

        // Test if the provided amount matches the pattern and the amount must be positive
        return pattern.test(amount) && parseFloat(amount) > 0;
    };


    const getCustomerToken = async () => {
        const authToken = Cookies.get('authToken');
        return authToken;
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                //Retrieve the customer id and auth token, authToken is at index 0 and customer_id is at index 1 
                const customerAuth = await getCustomerToken();
                //Retrieve the customer details
                if(customerAuth){
                    await getUserData(customerAuth);

                    await getUserAccounts(customerAuth);
    
                    //set the Transaction History Section to display the complete history on intial page render
                    const completeHistory = await getUserCompleteHistory(selectedNumEntries, customerAuth);
                    setUserCompleteHistory(completeHistory);
                    setDataToRender(completeHistory);
    
                    setIsUserDataLoaded(true);
                }
            } catch (err) {
                setIsUserDataLoaded(false);
                console.log(err);
            }
        }

        fetchUserData();

    }, [])



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

    interface CheckDepositData {
        accountID: number | string, // can be string or number because the value is retrieved from the radio button
        checkFile: File | null
    };
    const defaultCheckDepositData: CheckDepositData = {
        accountID: 0,
        checkFile: null,
    }

    const [checkDepositData, setCheckDepositData] = useState<CheckDepositData>(defaultCheckDepositData);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setCheckDepositData({ ...checkDepositData, checkFile: file });
        }
    };

    const handleCheckDepositAccountSelection = (e: React.MouseEvent<HTMLInputElement>) => {
        const { name, value } = e.target as HTMLInputElement;
        setCheckDepositData({ ...checkDepositData, [name]: value });
    };


    const checkFileType = (file: File) => {
        return file && (file.type === 'image/png' || file.type === 'image/jpeg');
    }

    const checkDeposit = (depositData: CheckDepositData, authToken: string) => {

        if (depositData.accountID === '') {
            setAlert({ text: "Please select an account to deposit into.", variant: "warning" });
            handleAlert();
            return;
        }

        if (!depositData.checkFile) {
            setAlert({ text: "Please select a check image to deposit.", variant: "warning" });
            handleAlert();
            return;
        }

        if (!checkFileType(depositData.checkFile)) {
            setAlert({ text: "Check file must be a .png or .jpg file.", variant: "warning" });
            handleAlert();
            return;
        }

        let accountID = parseInt(depositData.accountID.toString());

        // Create a FormData object and append the file to it
        const formData = new FormData();
        formData.append("account_id", accountID.toString());
        formData.append("check", depositData.checkFile);


        axios.post(`http://localhost:8000/checkDeposit/${accountID}`, formData, {
            headers: {
                'authorization': `Bearer ${authToken}`,
                'Content-Type': 'multipart/form-data'
            }
        }).then((response) => {
            console.log(response);
            setAlert({ text: "The check was deposited successfully.", variant: "success" });
            handleAlert();
        }).catch((err) => {
            console.log(err);
            setAlert({ text: err.response.data, variant: "danger" });
            handleAlert();
        })
    };




    return (

        <div className='overflow-hidden'>
            <NavBar />
            {/* <!-- Welcome Banner--> */}
            {
                isUserDataLoaded ? (

                    <header className="bg-dark py-5">
                        <div className="container px-5">
                            <div className="row gx-5 justify-content-center">
                                <div className="d-flex justify-content-center" id='pop-up-alert'>
                                    <PopUpAlert text={alert ? alert.text : ''} variant={alert ? alert.variant : 'info'} />
                                </div>
                                <div className="col-lg-6">
                                    <div className="text-center my-5">
                                        <h1 className="display-6 fw-bolder text-white mb-2">Welcome {userData.full_name}</h1>
                                        <p className="lead text-white-50 mb-4">Thank you for choosing Hoken bank. Happy banking!</p>
                                        <div className="d-grid gap-4 d-sm-flex justify-content-sm-center">
                                            <PopUpModal
                                                activatingBttn={<button type='button' className='btn btn-primary'>Open Account</button>}
                                                data-toggle="modal"
                                                data-target="#exampleModal"
                                                title={<div><h4>Open Account</h4></div>}
                                                body={
                                                    <div className="container text-center">
                                                        <p id="prompt">What type of account would you like to open?</p>
                                                        <div className="d-flex justify-content-center align-items-center" id="accountSelection">
                                                            <div className="d-flex-1 justify-content-center align-items-center">
                                                                <div className="form-check">
                                                                    <input className="form-check-input " value="Checking" onClick={handleAccountTypeSelection} type="radio" name="flexRadioDefault" id="flexRadioDefault1" />
                                                                    <label className="form-check-label" htmlFor="flexRadioDefault1">
                                                                        Checking
                                                                    </label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" value="Savings" onClick={handleAccountTypeSelection} type="radio" name="flexRadioDefault" id="flexRadioDefault2" />
                                                                    <label className="form-check-label" htmlFor="flexRadioDefault2">
                                                                        Savings
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                }
                                                closeBttnText={"Confirm"}
                                                additionalBttnText={"Cancel"}
                                                closeOnSubmit={true}
                                                submitAction={async () => {
                                                    const authToken = await getCustomerToken();
                                                    if (selectedAccountType && authToken) {
                                                        await openAccount(authToken, selectedAccountType);
                                                    }
                                                }}
                                            />
                                            <PopUpModal
                                                activatingBttn={<button type="button" className="btn btn-primary">Normal Payment</button>}
                                                data-toggle="modal"
                                                data-target="#exampleModal"
                                                closeOnSubmit={true}
                                                title={<div><h4>Make a Normal Payment</h4></div>}
                                                body={
                                                    <div className="row justify-content-center my-1">
                                                        <div className='d-flex justify-content-center'>
                                                            <p>Please enter the required payment details</p>
                                                        </div>
                                                        <div className="col-md-6 mb-4">
                                                            <label className='form-label' htmlFor='accountsList'>Accounts</label>
                                                            <div className='overflow-container'>
                                                                {userAccounts.length > 0 ? (

                                                                    <ul className="list-group">
                                                                        {
                                                                            userAccounts.map((account) =>
                                                                                <li key={account.account_id} className="list-group-item">
                                                                                    <input className="form-check-input me-1" name="accountID" type="radio" value={account.account_id} id={account.account_id.toString()} onClick={handlePaymentDetailsChange} />
                                                                                    <label className="form-check-label" htmlFor={account.account_id.toString()}>Account ID: {account.account_id}</label>
                                                                                    <label className="form-check-label ps-3" htmlFor={account.account_id.toString()}>Balance: ${account.balance}</label>
                                                                                </li>
                                                                            )
                                                                        }
                                                                    </ul>
                                                                ) : (<div><p className="text-danger">There are no active accounts.</p></div>)
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6 mb-4">
                                                            <div className="form-outline">
                                                                <div className='d-flex justify-content-start'>
                                                                    <label className="form-label" htmlFor="validationCustom01">Amount</label>
                                                                </div>
                                                                <input name="amount" type="text" id="validationCustom01" className="form-control" placeholder={"$"} onChange={handlePaymentDetailsChange} />

                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                                closeBttnText={"Confirm"}
                                                additionalBttnText={"Cancel"}
                                                submitAction={async () => {
                                                    const authToken = await getCustomerToken();
                                                    if (authToken) {
                                                        normalPayment(paymentData.accountID.toString(), paymentData.amount.toString(), authToken)
                                                    }
                                                }}


                                            />
                                            <PopUpModal
                                                activatingBttn={<button type="button" className="btn btn-primary">Automatic Payment</button>}
                                                data-toggle="modal"
                                                data-target="#exampleModal"
                                                title={<div><h4>Schedule an Automatic Payment</h4></div>}
                                                body={
                                                    <div className="row justify-content-center my-1">
                                                        <div className='d-flex justify-content-center'>
                                                            <p>Please enter the required details</p>
                                                        </div>
                                                        <div className="col-md-6 mb-4">
                                                            <label className='form-label' htmlFor='accountsList'>Accounts</label>
                                                            <div className='overflow-container'>
                                                                {userAccounts.length > 0 ? (

                                                                    <ul className="list-group">
                                                                        {
                                                                            userAccounts.map((account) =>
                                                                                <li key={account.account_id} className="list-group-item">
                                                                                    <input className="form-check-input me-1" name="accountID" type="radio" value={account.account_id} id={account.account_id.toString()} onClick={handlePaymentDetailsChange} />
                                                                                    <label className="form-check-label" htmlFor={account.account_id.toString()}>Account ID: {account.account_id}</label>
                                                                                    <label className="form-check-label ps-3" htmlFor={account.account_id.toString()}>Balance: ${formatBalance(account.balance)}</label>
                                                                                </li>
                                                                            )
                                                                        }
                                                                    </ul>
                                                                ) : (<div><p className="text-danger">There are no active accounts.</p></div>)
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6 mb-4">
                                                            <div className="form-outline">
                                                                <div className='d-flex justify-content-start'>
                                                                    <label className="form-label" htmlFor="validationCustom01">Amount</label>
                                                                </div>
                                                                <input name="amount" type="text" id="validationCustom01" className="form-control" placeholder={"$"} onChange={handlePaymentDetailsChange} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6 mb-4 d-flex justify-content-center align-items-center">
                                                            <DatePicker
                                                                placeholderText="Payment Date:"
                                                                peekNextMonth={true}
                                                                showMonthDropdown={true}
                                                                showYearDropdown={true}
                                                                wrapperClassName={"form-control"}
                                                                dropdownMode="select"
                                                                minDate={new Date()} //set the min date to be the current date
                                                                id={"automaticPayment"}
                                                                labelText={"Payment Date"}
                                                                onDateChange={handleAutomaticPaymentDateChange}
                                                            />
                                                        </div>
                                                    </div>
                                                }
                                                closeBttnText={"Confirm"}
                                                closeOnSubmit={true}
                                                additionalBttnText={"Cancel"}
                                                submitAction={async () => {
                                                    const authToken = await getCustomerToken();
                                                    if (authToken && paymentData.date) {
                                                        automaticPayment(paymentData.accountID.toString(), paymentData.amount, paymentData.date.toString(), authToken)
                                                    }
                                                }
                                                }
                                            />
                                            <PopUpModal
                                                activatingBttn={<button type="button" className="btn btn-primary">Check Deposit</button>}
                                                data-toggle="modal"
                                                data-target="#exampleModal"
                                                title={<div><h4>Check Deposit</h4></div>}
                                                body={
                                                    <>
                                                        <div className="row justify-content-center my-1">
                                                            <div className="col-md-8 mb-4">
                                                                <label className='form-label' htmlFor='accountsList'>Accounts</label>
                                                                <div className='overflow-container'>
                                                                    {userAccounts.length > 0 ? (

                                                                        <ul className="list-group">
                                                                            {
                                                                                userAccounts.map((account) =>
                                                                                    <li key={account.account_id} className="list-group-item">
                                                                                        <input className="form-check-input me-1" name="accountID" type="radio" value={account.account_id} id={account.account_id.toString()} onClick={handleCheckDepositAccountSelection} />
                                                                                        <label className="form-check-label" htmlFor={account.account_id.toString()}>Account ID: {account.account_id}</label>
                                                                                        <label className="form-check-label ps-3" htmlFor={account.account_id.toString()}>Balance: ${formatBalance(account.balance)}</label>
                                                                                    </li>
                                                                                )
                                                                            }
                                                                        </ul>
                                                                    ) : (<div><p className="text-danger">There are no active accounts.</p></div>)
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='row justify-content-center'>
                                                            <div className="col-md-12 mb-4">

                                                                <div className="custom-file mt-2 overflow-wrap">
                                                                    <input type="file" className="custom-file-input" id="validatedCustomFile" onChange={handleFileUpload} />
                                                                </div>

                                                            </div>

                                                        </div>
                                                    </>
                                                }
                                                closeBttnText={"Confirm"}
                                                additionalBttnText={"Cancel"}
                                                closeOnSubmit={true}
                                                submitAction={async () => {
                                                    const authToken = await getCustomerToken();
                                                    if (authToken) {
                                                        checkDeposit(checkDepositData, authToken);
                                                    }
                                                }}
                                            />

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                ) : (
                    <header className="bg-dark py-5">
                        <div className="container px-5">
                            <div className="row gx-5 justify-content-center">
                                <div className="col-lg-6">
                                    <div className="text-center my-5">
                                        <div className="d-flex justify-content-center">
                                            <div className="spinner-border text-primary" role="status"> </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                )
            }
            {/*Accounts Section */}
            <Accounts userAccounts={userAccounts} isUserDataLoaded={isUserDataLoaded} />

            {/*Transaction History Section*/}

            <div className="d-flex align-items-center justify-content-center">
                <h4 className="my-4">{selectedHistoryOption} History</h4>
            </div>

            <div className='row'>
                <div className='col-md-6 my-1'>
                    <div className="d-flex justify-content-start ms-4">
                        <Dropdown
                            selectedOption={selectedNumEntries}
                            onSelectedOption={(option: number) => setSelectedNumEntries(option)}
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
                        {isUserDataLoaded ? (
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
            {/* <!-- Footer--> */}
            <footer className="py-5 bg-dark">
                <div className="container px-5"><p className="m-0 text-center text-white">Copyright &copy; Hoken 2023</p></div>
            </footer>





        </div>

    )
}
export default HomePage;
