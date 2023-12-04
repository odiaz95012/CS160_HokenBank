import React, { useState, useEffect } from 'react';
import AccountCard from './AccountCard';
import Cookies from 'js-cookie';
import axios from 'axios';
import PopUpAlert from './PopUpAlert';
import PopUpModal from './PopUpModal';
import '../componentStyles/ATMHomeStyles.css';
import NavBarLogOut from './NavBarLogOut';

interface TransactionData {
    account_id: string;
    amount: number | string; //Can be a string because the user enters as text in the input field
}

interface UserData {
    customer_id: string;
    username: string;
    email: string;
    full_name: string;
    age: number;
    gender: string;
    zip_code: number;
    status: string;
}

interface Account {
    account_id: string | number,
    account_type: string,
    balance: number | string,
}
interface Alert {
    text: string,
    variant: string
}

function ATMHome() {
    const [alert, setAlert] = useState<Alert>({ text: '', variant: '' });

    const getCustomerToken = async () => {
        const authToken = Cookies.get('authToken');
        return authToken;
    };

    const [isUserDataLoaded, setIsUserDataLoaded] = useState<boolean>(false);
    const [userData, setUserData] = useState<UserData>({
        customer_id: '',
        username: '',
        email: '',
        full_name: '',
        age: 0,
        gender: '',
        zip_code: 0,
        status: '',
    });
    const getUserData = async (authToken: string) => {
        await axios
            .get(`http://localhost:8000/getCustomer`, {
                headers: {
                    authorization: `Bearer ${authToken}`,
                },
            })
            .then((response) => {
                setUserData(response.data);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const [userAccounts, setUserAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account>({account_id: '', account_type: '', balance: 0});

    const handleAccountSelection = (accountData: any) => {
        setSelectedAccount(accountData);
        setTransactionData({ ...transactionData, account_id: accountData.account_id });
    };

    const getUserAccounts = async (authToken: string) => {
        await axios
            .get(`http://localhost:8000/getCustomerAccounts`, {
                headers: {
                    authorization: `Bearer ${authToken}`,
                },
            })
            .then((response) => {
                setUserAccounts(response.data);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                //Retrieve the customer id and auth token, authToken is at index 0 and customer_id is at index 1
                const customerAuth = await getCustomerToken();
                if (customerAuth) {
                    //Retrieve the customer details
                    await getUserData(customerAuth);

                    await getUserAccounts(customerAuth);

                    setIsUserDataLoaded(true);
                }

            } catch (err) {
                setIsUserDataLoaded(false);
                console.log(err);
            }
        };

        fetchUserData();
    }, []);

    const [transactionData, setTransactionData] = useState<TransactionData>({
        account_id: '',
        amount: '',
    });

    const handleTransactionData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTransactionData({ ...transactionData, [name]: value });
    };

    const deposit = (inputData: TransactionData, authToken: string) => {
        const { account_id, amount } = inputData;

        if (account_id === '') {
            setAlert({ text: "Please select the target account", variant: "warning" });
            handleAlert();
            return;
        }
        if (amount === 0) {
            setAlert({ text: "Please enter an amount to deposit.", variant: "warning" });
            handleAlert();
            return;
        }
        if (!isValidAmount(amount.toString())) {
            setAlert({ text: "Please enter a valid amount to deposit (e.g. 25.99).", variant: "warning" });
            handleAlert();
            return;
        }

        let parsedAccountId = parseInt(account_id);
        let parsedAmount = parseFloat(amount.toString()).toFixed(2);

        axios
            .patch(`http://localhost:8000/deposit/${parsedAccountId}/${parsedAmount}`, {
                account_id: parsedAccountId,
                amount: parsedAmount,
            },
                {
                    headers: {
                        'authorization': `Bearer ${authToken}`,
                    }
                })
            .then((response) => {
                console.log(response);
                setAlert({ text: response.data.message, variant: "success" });
                handleAlert();
                const updatedAccounts = userAccounts.map(account => {
                    if (account.account_id === account_id) {
                        return { ...account, balance: response.data.balance };
                    }
                    return account;
                });
                setUserAccounts(updatedAccounts);
                setTransactionData({ account_id: '', amount: 0.0 }); // reset transaction data after transaction
                setSelectedAccount({account_id: '', account_type: '', balance: 0});
            })
            .catch((err) => {
                console.log(err);
                setAlert({ text: err.response.data, variant: "danger" });
                handleAlert();
            });
    };

    const withdraw = (inputData: TransactionData, authToken: string) => {
        const { account_id, amount } = inputData;
        if (account_id == '') {
            setAlert({ text: "Please select the target account", variant: "warning" });
            handleAlert();
            return;
        }
        if (amount == 0) {
            setAlert({ text: "Please enter an amount to withdraw.", variant: "warning" });
            handleAlert();
            return;
        }
        if (!isValidAmount(amount.toString())) {
            setAlert({ text: "Please enter a valid amount to withdraw (e.g. 25.99).", variant: "warning" });
            handleAlert();
            return;
        }

        let parsedAccountId = parseInt(account_id);
        let parsedAmount = parseFloat(amount.toString()).toFixed(2);

        axios
            .patch(`http://localhost:8000/withdraw/${parsedAccountId}/${parsedAmount}`, {
                account_id: parsedAccountId,
                amount: parsedAmount,
            },
                {
                    headers: {
                        'authorization': `Bearer ${authToken}`,
                    }
                })
            .then((response) => {
                console.log(response);
                setAlert({ text: response.data.message, variant: "success" });
                handleAlert();
                const updatedAccounts = userAccounts.map(account => {
                    if (account.account_id === account_id) {
                        return { ...account, balance: response.data.balance };
                    }
                    return account;
                });
                setUserAccounts(updatedAccounts);
                setTransactionData({ account_id: '', amount: 0.0 }); // reset transaction data after transaction
                setSelectedAccount({account_id: '', account_type: '', balance: 0});
            })
            .catch((err) => {
                console.log(err);
                setAlert({ text: err.response.data, variant: "danger" });
                handleAlert();
            });
    };

    const handleAlert = () => {
        const alertElem = document.getElementById('pop-up-alert') as HTMLElement;
        alertElem.style.visibility = 'visible';
        // Automatically dismiss the alert after 3 seconds
        setTimeout(() => {
            setAlert({ text: '', variant: '' }); // reset alert after timeout
            alertElem.style.visibility = 'hidden';
        }, 3000);
    };

    const isValidAmount = (amount: string) => {
        // {any_number_of_digits}.XX, where XX is exactly two digits
        const pattern = /^\d+\.\d{2}$/;

        // Test if the provided amount matches the pattern and the amount must be positive
        return pattern.test(amount) && parseFloat(amount) > 0;
    };

    return (
        <div className='overflow-hidden'>
            <div className='row'>
                <div className='col-md-12'>
                    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                        <div className="container px-5">
                            <img
                                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                                style={{ width: '85px' }}
                                alt="logo"
                                id="logo"
                            />
                            <a className="navbar-brand" id="home">Hoken</a>
                            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                <ul className="navbar-nav ms-auto mb-lg-0 my-2">
                                    <li className="nav-item my-2">
                                        <button className='btn btn-primary'><NavBarLogOut /></button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
            <div className='container'>
                {isUserDataLoaded ? (
                    <>
                        <div className='row my-4'>
                            <div className='col text-center'>
                                <h3>Welcome {userData.full_name}</h3>
                            </div>
                            <div className="d-flex justify-content-center mt-2" id='pop-up-alert'>
                                {alert ? (
                                    <PopUpAlert text={alert.text} variant={alert.variant} />
                                ) : (null)}
                            </div>
                        </div>
                        <div className='ms-3 my-1'>
                            <h5>Accounts</h5>
                        </div>
                        <div className='row overflow-auto my-2 mx-1' style={{ border: '1px solid rgba(211, 211, 211, 0.6)', borderRadius: '5px,' }}>
                            <div className='container text-center pt-3'>
                                <p className='h5'>Select the target account</p>
                            </div>
                            <div className='d-flex'>
                                {userAccounts.length > 0 ? (
                                    userAccounts.map((account: any) => (
                                        <AccountCard
                                            key={account.account_id}
                                            account_id={account.account_id}
                                            account_type={account.account_type}
                                            account_balance={account.balance}
                                            showDetailsBttn={false}
                                            onSelectAccount={handleAccountSelection}
                                            isSelected={selectedAccount && account.account_id === selectedAccount.account_id}
                                            caller="atm"
                                        />))) : (<div className='container text-center'>No accounts found</div>)}
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col'>
                                <PopUpModal
                                    activatingBttn={<button className='btn btn-primary'>Deposit</button>}
                                    data-toggle="modal"
                                    data-target="#exampleModal"
                                    title={<div><h4>Deposit</h4></div>}
                                    body={
                                        <div className="row justify-content-center my-1">
                                            <div className="col-md-6 mb-4">
                                                <div className="form-outline">
                                                    <input name="amount" type="number" min={0} id="validationCustom01" className="form-control" placeholder={"$"} onChange={handleTransactionData} value={transactionData.amount}/>
                                                    <div className='d-flex justify-content-center'>
                                                        <label className="form-label" htmlFor="validationCustom01">Amount</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    closeBttnText={"Confirm Deposit"}
                                    additionalBttnText={"Cancel"}
                                    submitAction={async () => {
                                        const authToken = await getCustomerToken();
                                        if(authToken){
                                            deposit(transactionData, authToken)
                                        }
                                        }}
                                    closeOnSubmit={true}
                                />
                            </div>
                            <div className='col'>
                                <div className='d-flex justify-content-end'>
                                    <PopUpModal
                                        activatingBttn={<button className='btn btn-primary'>Withdraw</button>}
                                        data-toggle="modal"
                                        data-target="#exampleModal"
                                        title={<div><h4>Withdrawal</h4></div>}
                                        body={
                                            <div className="row justify-content-center my-1">
                                                <div className="col-md-6 mb-4">
                                                    <div className="form-outline">
                                                        <input name="amount" type="number" min={0} id="validationCustom01" className="form-control" placeholder={"$"} onChange={handleTransactionData} value={transactionData.amount}/>
                                                        <div className='d-flex justify-content-center'>
                                                            <label className="form-label" htmlFor="validationCustom01">Amount</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        closeBttnText={"Confirm Withdrawal"}
                                        additionalBttnText={"Cancel"}
                                        submitAction={async () => {
                                            const authToken = await getCustomerToken();
                                            if(authToken){
                                                withdraw(transactionData, authToken)
                                            }
                                            }}
                                        closeOnSubmit={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border text-primary" role="status"> </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="py-5 bg-dark fixed-bottom">
                <div className="container px-5">
                    <p className="m-0 text-center text-white">Copyright &copy; Hoken 2023</p>
                </div>
            </footer>
        </div>
    );
}

export default ATMHome;
