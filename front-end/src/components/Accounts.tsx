import React, { useState } from 'react'
import AccountCard from './AccountCard.tsx';


interface userAccount {
    account_id: number,
    account_type: string,
    balance: number
}

function Accounts({ userAccounts, isUserDataLoaded }: { userAccounts: userAccount[], isUserDataLoaded: boolean }) {

    //latest 

    const [isAccountsExpanded, setIsAccountsExpanded] = useState<boolean>(false); // Change the name to isAccountExpanded

    const toggleExpand = () => {
        setIsAccountsExpanded(!isAccountsExpanded);
    };




    return (
        <>
            <div className="d-flex align-items-center justify-content-center mt-4">
                <h3>Account Summaries</h3>
            </div>

            {/* <!-- Accounts section--> */}
            <div className="container justify-content-center ">
                <div className="row justify-content-center my-5" style={{ backgroundColor: "rgba(211, 211, 211, 0.2)" }}>
                    {isUserDataLoaded ? (
                        userAccounts.map((account) => (
                            <AccountCard
                                key={account.account_id}
                                account_id={account.account_id}
                                account_type={account.account_type}
                                account_balance={account.balance}
                                showDetailsBttn={true}
                                onSelectAccount={() => { }}
                                isSelected={false}
                                caller="home"
                            />
                        )).slice(0, 3) // Only display the first 3 account cards
                    ) : (
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
                    )}
                    {/* Display a button to expand the container when there are more than 3 accounts */}
                    {userAccounts.length > 3 && (
                        <button className="btn btn-outline-primary" onClick={toggleExpand}>
                            {isAccountsExpanded ? "Show Less" : "Show More"}
                        </button>
                    )}
                    {isAccountsExpanded && userAccounts.length > 3 && (
                        <div className={`row justify-content-center my-5 collapse ${isAccountsExpanded ? 'show' : ''}`} id="accounts">
                            {
                                userAccounts.slice(3).map((account) => (
                                    <AccountCard
                                        key={account.account_id}
                                        account_id={account.account_id}
                                        account_type={account.account_type}
                                        account_balance={account.balance}
                                        showDetailsBttn={true}
                                        onSelectAccount={() => { }}
                                        isSelected={false}
                                        caller='home'
                                    />
                                ))
                            }
                        </div>
                    )}
                </div>
            </div>

        </>
    )
}

export default Accounts