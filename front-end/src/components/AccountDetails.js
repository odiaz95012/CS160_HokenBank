import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import PopUpModal from './PopUpModal';
import InternalTransfer from './InternalTransfer';
import ExternalTransfer from './ExternalTransfer';
import CloseAccount from './CloseAccount';
import NavBar from './NavBar';

function AccountDetails() {
    const { accountID } = useParams();

    const [accountInfo, setAccountInfo] = useState({
        accountID: '',
        balance: 0.00,
        account_type: ''
    });

    const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

    useEffect(() => {
        const fetchAccountDetails = async (accountID) => {
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
        fetchAccountDetails(accountID);
        setIsUserDataLoaded(true);
    }, []);

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
            <NavBar />

            {isUserDataLoaded ? (
                <div className="container my-5" style={{border: '1px solid grey', borderRadius: '15px'}}>
                    {/* <header className="bg-dark py-5">
                        <div className="container px-5">
                            <div className="row gx-5 justify-content-center">
                                <div className="col-lg-6">
                                    <div className="text-center my-5">
                                        <h1 className="display-5 fw-bolder text-white mb-2">Welcome</h1>
                                        <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
                                            <div className="text-center pt-1 mb-5 pb-1">
                                                <PopUpModal
                                                    activatingBttn={<button className="btn btn-primary btn-lg px-4 me-sm-3">Internal Transfer</button>}
                                                    title={<div style={{ textAlign: "center" }}><p className="h4">Internal Transfer</p></div>}
                                                    body={<InternalTransfer />}
                                                />
                                            </div>
                                            <div className="text-center pt-1 mb-5 pb-1">
                                                <PopUpModal
                                                    activatingBttn={<button className="btn btn-primary btn-lg px-4 me-sm-3">External Transfer</button>}
                                                    title={<div style={{ textAlign: "center" }}><p className="h4">External Transfer</p></div>}
                                                    body={<ExternalTransfer />}
                                                />
                                            </div>
                                            <div className="text-center pt-1 mb-5 pb-1">
                                                <PopUpModal
                                                    activatingBttn={<button className="btn btn-primary btn-lg px-4 me-sm-3">Close Account</button>}
                                                    title={<div style={{ textAlign: "center" }}><p className="h4">Close Account</p></div>}
                                                    body={<CloseAccount />}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header> */}
                    <div className='row'>
                        <div className='col text-center'>
                            <p className='h4 py-1'>Account ID: {accountID}</p>
                            <p className='py-1'>Account Type: {accountInfo.account_type}</p>
                            <p className='py-1'>Balance: {accountInfo.balance}</p>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-md-4'>
                            <PopUpModal
                                activatingBttn={<button className="btn btn-primary my-2">Internal Transfer</button>}
                                title={<div style={{ textAlign: "center" }}><p className="h4">Internal Transfer</p></div>}
                                body={<InternalTransfer />}
                            />
                        </div>
                        <div className='col-md-4'>
                            <PopUpModal
                                activatingBttn={<button className="btn btn-primary my-2">External Transfer</button>}
                                title={<div style={{ textAlign: "center" }}><p className="h4">External Transfer</p></div>}
                                body={<ExternalTransfer />}
                            />
                        </div>
                        <div className='col-md-4'>
                            <PopUpModal
                                activatingBttn={<button className="btn btn-primary my-2">Close Account</button>}
                                title={<div style={{ textAlign: "center" }}><p className="h4">Close Account</p></div>}
                                body={<CloseAccount />}
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

            <footer className="py-5 bg-dark">
                <div className="container px-5">
                    <p className="m-0 text-center text-white">Copyright &copy; Hoken 2023</p>
                </div>
            </footer>
        </>
    );
}

export default AccountDetails;
