import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import PopUpAlert from './PopUpAlert';
import '../componentStyles/AdminPageStyles.css';
import CustomerCard from './CustomerCard';
import AdminPageNavBar from './AdminPageNavbar';
import axios from 'axios';

function AdminPage() {


  interface CustomerData {
    customer_id: number,
    full_name: string,
    username: string,
    email: string,
    age: number,
    gender: string,
    zip_code: number,
    status: string,
  }

  const [customers, setCustomers] = useState<(CustomerData)[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  interface inputData {
    minBalance: number,
    maxBalance: number,
    minAge: number,
    maxAge: number,
    zipcode: number,
    gender: string,
  }

  const defaultQueryData: inputData = {
    minBalance: 0,   // Default values
    maxBalance: 0,
    minAge: 0,
    maxAge: 0,
    zipcode: 0,
    gender: ''
  }

  const [queryData, setQueryData] = useState<inputData>(defaultQueryData);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  interface alert {
    text: string,
    variant: string
  }

  const defaultAlert = {
    text: '',
    variant: ''
  }

  const [alert, setAlert] = useState<alert>(defaultAlert);



  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Define a mapping for the expected types
    const typeMapping: Record<string, string> = {
      minBalance: 'float',
      maxBalance: 'float',
      minAge: 'int',
      maxAge: 'int',
      zipcode: 'int',
      gender: 'string'
    };

    // Convert the value based on the expected type
    let convertedValue: string | number;
    if (typeMapping[name] === 'float') {
      convertedValue = parseFloat(value).toFixed(2);
    } else if (typeMapping[name] === 'int') {
      convertedValue = parseInt(value);
    } else {
      convertedValue = value;
    }

    setQueryData({ ...queryData, [name]: convertedValue });
  }



  const handleGenderSelection = (genderSelection: string) => {
    setQueryData({ ...queryData, gender: genderSelection });
  }


  const generateCustomerRow = (dataToRender: generatedReport[]) => {
    return dataToRender.map((account) => (
      <tr key={account.customer_id}>
        <th scope='row'>{account.customer_id}</th>
        <td>${account.balance}</td>
        <td>{account.age}</td>
        <td>{account.gender}</td>
        <td>{account.zip_code}</td>
      </tr>
    ));
  };

  const getCustomerToken = async () => {
    const authToken = Cookies.get('authToken');
    return authToken;
  };

  interface generatedReport {
    customer_id: number,
    balance: number,
    age: number,
    gender: string,
    zip_code: number
  }

  const [reportData, setReportData] = useState<(generatedReport)[]>([]);

  const isValidZipCode = (zipCode: string) => {
    // Pattern that must include exactly 5 numeric digits
    const pattern = /^\d{5}$/;

    return pattern.test(zipCode);
  }


  const generateReport = (queryInfo: inputData, authToken: string) => {
    const { minBalance, maxBalance, minAge, maxAge, zipcode, gender } = queryInfo;

    if (!minBalance || !maxBalance || !minAge || !zipcode || !gender) {
      setAlert({ text: 'At least one input parameter was not provided. Please try again.', variant: 'warning' });
      handleAlert();
      return;
    }
    if (!isValidZipCode(zipcode.toString())) {
      setAlert({ text: 'The zipcode must be a 5 digit number.Please try again with a valid zipcode entry.', variant: 'warning' });
      handleAlert();
      return;
    }
    setIsGeneratingReport(true);

    axios.get(`http://localhost:8000/generateUserReport/${minBalance}/${maxBalance}/${minAge}/${maxAge}/${zipcode}/${gender}`, {
      headers: {
        'authorization': `Bearer ${authToken}`
      }
    }).then((response) => {
      const data: generatedReport[] = response.data;
      setReportData(data);
      console.log(response);
      setIsGeneratingReport(false);
    }).catch((err) => {
      console.log(err);
      setIsGeneratingReport(false);
    })
  };

  const handleAlert = () => {
    const alertElem = document.getElementById('pop-up-alert') as HTMLElement | null;

    if (alertElem) {
      alertElem.style.visibility = 'visible';

      // Automatically dismiss the alert after 3 seconds
      setTimeout(() => {
        setAlert(defaultAlert);
        alertElem.style.visibility = 'hidden';
      }, 3000);
    }
  }


  const downloadTableData = (data: generatedReport[], queryInfo: inputData) => {
    if (!data || !queryInfo) {
      setAlert({ text: "There is no user report to download. Please generate a user report first.", variant: "warning" });
      handleAlert();
      return;
    }
    const formattedDate = getCurrDateTime();

    // Create a filename based on the current date and time
    const filename = `customer_report_${formattedDate}.txt`;

    // Create a header string based on input parameters
    const header = `Customer Report Search Parameters:\nMin Balance: ${queryInfo.minBalance}, Max Balance: ${queryInfo.maxBalance}\nMin Age: ${queryInfo.minAge}, Max Age: ${queryInfo.maxAge}\nZip Code: ${queryInfo.zipcode}\nGender: ${queryInfo.gender}\n\n`;

    // Define labels for the table columns
    const tableLabels = 'Customer ID | Total Balance |  Age |  Gender |  Zip Code';

    // Prepare the table data as a string
    const tableData = data
      .map((account) => {
        return `${account.customer_id}\t\t${account.balance}\t\t${account.age}\t ${account.gender}\t ${account.zip_code}\t`;
      })
      .join('\n');

    // Combine the header, table labels, and table data
    const fileContent = header + tableLabels + '\n' + tableData;

    // Create a Blob with the file content
    const blob = new Blob([fileContent], { type: 'text/plain' });

    // Create an object URL for the Blob
    const objectURL = URL.createObjectURL(blob);

    // Create an anchor element to trigger the download
    const a = document.createElement('a');
    a.href = objectURL;
    a.download = filename; // Use the filename which is in the format customer_report_MM-DD-YYY-HH.MM.SS.txt
    a.click();

    // Clean up the object URL
    URL.revokeObjectURL(objectURL);
  };



  useEffect(() => {
    const fetchData = async () => {
      const authToken = await getCustomerToken();
      if (authToken) {
        try {
          const response = await axios.get('http://localhost:8000/getCustomers', {
            headers: {
              'authorization': `Bearer ${authToken}`
            }
          });
          const customers = response.data;
          setCustomers(customers);
          setIsLoading(false); // Set loading to false after data is fetched
        } catch (err) {
          console.log(err);
          setIsLoading(false); // Set loading to false in case of an error
        }
      }
    };

    fetchData(); // Call the function to fetch data on page load
  }, []);

  interface userReport {
    customer_id: number,
    full_name: string,
    username: string,
    email: string,
    age: number,
    gender: string,
    zip_code: number,
    status: string,
    balance: string,
    accounts: number
  }

  const [userReport, setUserReport] = useState<userReport>({
    customer_id: 0,
    full_name: '',
    username: '',
    email: '',
    age: 0,
    gender: '',
    zip_code: 0,
    status: '',
    balance: '',
    accounts: 0
  });




  const generateUserReport = async (customer_id: number, authToken: string) => {
    let url = `http://localhost:8000/generateIndividualReport/${customer_id}`;

    axios.get(url, {
      headers: {
        'authorization': `Bearer ${authToken}`
      },

    }).then((response) => {
      setUserReport(response.data);
      downloadUserReport(response.data);
    }).catch((err) => {
      console.log(err);
    })

  };

  const getCurrDateTime = () => {
    // Get the current date and time
    const currentDate = new Date();
    const datePart = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate
      .getDate()
      .toString()
      .padStart(2, '0')}-${currentDate.getFullYear()}`;
    const timePart = `${currentDate
      .getHours()
      .toString()
      .padStart(2, '0')}.${currentDate
        .getMinutes()
        .toString()
        .padStart(2, '0')}.${currentDate
          .getSeconds()
          .toString()
          .padStart(2, '0')}`;
    return `${datePart}-${timePart}`;
  }

  const downloadUserReport = (report: userReport) => {
    if (!report) {
      setAlert({ text: "There is no user report to download. Please select a user report to download.", variant: "warning" });
      handleAlert();
      return;
    }
    const formattedDate = getCurrDateTime();

    // Create a filename based on the user's name and the current date and time
    const filename = `${report.full_name}_${formattedDate}.txt`;

    // Create a header string based on input parameters
    const header = `User Report for ${report.full_name}:\n`;

    // Prepare the table data as a string
    const tableData = `\nCustomer ID: ${report.customer_id}\n\nName: ${report.full_name}\n\nUsername: ${report.username}` +
      `\n\nTotal Balance: $${report.balance}\n\nAge: ${report.age}` +
      `\n\nGender: ${report.gender}\n\nZip Code: ${report.zip_code}\n\nStatus: ${report.status}` +
      `\n\nTotal Number of Accounts: ${report.accounts}`;

    // Combine the header, table labels, and table data
    const fileContent = header + tableData;

    // Create a Blob with the file content
    const blob = new Blob([fileContent], { type: 'text/plain' });

    // Create an object URL for the Blob
    const objectURL = URL.createObjectURL(blob);

    // Create an anchor element to trigger the download
    const a = document.createElement('a');
    a.href = objectURL;
    a.download = filename; // Use the filename which is in the format customer_report_MM-DD-YYY-HH.MM.SS.txt
    a.click();

    // Clean up the object URL
    URL.revokeObjectURL(objectURL);
  };



  const [searchedCustomer, setSearchedCustomer] = useState<string>('');

  const filteredCustomers = customers.filter((customer: CustomerData) => {
    return (
      customer.full_name.toLowerCase().includes(searchedCustomer.toLowerCase()) ||
      customer.username.toLowerCase().includes(searchedCustomer.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchedCustomer.toLowerCase())
    );
  });


  return (
    <div className='overflow-hidden'>
      <AdminPageNavBar />
      {isLoading ? (
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : (
        <div>
          <header className="bg-dark py-5">
            <div className="container px-5">
              <div className="d-flex justify-content-center" id='pop-up-alert'>
                <PopUpAlert text={alert ? alert.text : ''} variant={alert ? alert.variant : 'info'} />
              </div>
              <div className="row gx-5 justify-content-center">
                <div className="col-lg-6">
                  <div className="text-center my-5">
                    <h1 className="display-6 fw-bolder text-white mb-2">Welcome Bank Manager</h1>
                    <p className="lead text-white-50 mb-4">What user reports would you like to generate today?</p>
                    <button className='btn btn-primary' onClick={async () => {
                      const authToken = await getCustomerToken();
                      if (authToken) {
                        generateReport(queryData, authToken)
                      }
                    }}>Generate Report</button>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <div className='container my-5'>

            <div className='d-flex justify-content-around'>
              <label className='form-label h6 mx-1' htmlFor='balanceInputs'>Balance</label>
              <label className='form-label h6 mx-1' htmlFor='ageInputs'>Age</label>
              <label className='form-label h6 mx-1' htmlFor='zipcodeInput'>Zip Code</label>
              <label className='form-label h6 mx-1' htmlFor='genderBtns'>Gender</label>
            </div>
            <div className='row'>
              <div className='col-md-3 my-1'>
                <div className='form-outline' id="balanceInputs">
                  <input type='number' min={0} className='form-control' name="minBalance" id="minBalance" placeholder='Min Balance' onChange={handleDataChange} />
                  <label className='form-label h6' htmlFor='minBalance'>Minimum Balance</label>
                  <input type='number' min={0} className='form-control' name="maxBalance" id="maxBalance" placeholder='Max Balance' onChange={handleDataChange} />
                  <label className='form-label h6' htmlFor='maxBalance'>Maximum Balance</label>
                </div>
              </div>
              <div className='col-md-3 my-1'>
                <div className='form-outline' id="ageInputs">
                  <input type='number' min={18} max={150} className='form-control' name="minAge" id="minAge" placeholder='Min Age' onChange={handleDataChange} />
                  <label className='form-label h6' htmlFor='minAge'>Minimum Age</label>
                  <input type='number' min={18} max={150} className='form-control' name="maxAge" id="maxAge" placeholder='Max Age' onChange={handleDataChange} />
                  <label className='form-label h6' htmlFor='maxAge'>Maximum Age</label>
                </div>
              </div>
              <div className='col-md-3 my-1'>
                <div className='form-outline' id="zipcodeInput">
                  <input type='text' className='form-control' name="zipcode" id="zipcode" placeholder='Enter Zipcode' onChange={handleDataChange} />
                  <label className='form-label h6' htmlFor='zipcode'>Zip Code</label>
                </div>
              </div>
              <div className="col-md-3 my-1">
                <div className="form-check">
                  <input className="form-check-input" name="gender" type="radio" value="A" id="allGenders" onClick={() => handleGenderSelection('A')} />
                  <label className="form-check-label" htmlFor="allGenders">
                    All Genders
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" name="gender" type="radio" value="M" id="male" onClick={() => handleGenderSelection('M')} />
                  <label className="form-check-label" htmlFor="male">
                    Male
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" name="gender" type="radio" value="F" id="female" onClick={() => handleGenderSelection('F')} />
                  <label className="form-check-label" htmlFor="female">
                    Female
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" name="gender" type="radio" value="O" id="other" onClick={() => handleGenderSelection('O')} />
                  <label className="form-check-label" htmlFor="other">
                    Other
                  </label>
                </div>
                <div>
                  <label className="form-label h6 mt-1" htmlFor="genderBtns">Gender Type</label>
                </div>
              </div>
            </div>
            <div className='row my-2 mx-1' style={{ border: '1px solid rgba(211, 211, 211, 0.6)', borderRadius: '5px,' }}>
              <div className='container text-center pt-3'>
                <p className='h5'>Customer Summaries</p>
                <input
                  type='text'
                  className='form-control mb-2'
                  placeholder='Search for a customer by name, username, or email'
                  value={searchedCustomer}
                  onChange={(e) => setSearchedCustomer(e.target.value)} // Update search state
                />
              </div>
              <div className='scrollable-container d-flex flex-wrap' style={{ height: '465px', overflowY: 'auto' }}>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer: CustomerData) => (
                    <div className='col-md-4 my-2' key={customer.customer_id}>
                      <CustomerCard
                        customer_id={customer.customer_id}
                        full_name={customer.full_name}
                        username={customer.username}
                        email={customer.email}
                        gender={customer.gender}
                        age={customer.age}
                        zip_code={customer.zip_code}
                        status={customer.status}
                        generateUserReport={async () => {
                          const authToken = await getCustomerToken();
                          if (authToken) {
                            generateUserReport(customer.customer_id, authToken)
                          }
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className='container text-center'>No customers match the search criteria.</div>
                )}
              </div>
            </div>
            <div className='row overflow-auto my-4'>
              <div className='col-md-12'>
                <div className='d-flex justify-content-end mb-3'>
                  {reportData && reportData.length > 0 ? (
                    <button
                      className='btn btn-outline-primary'
                      onClick={() => downloadTableData(reportData, queryData)}
                    >
                      <i className="bi bi-file-earmark-arrow-down"></i>
                    </button>
                  ) : (null)
                  }
                </div>

                <table className='table table-hover'>
                  <thead className='thead-dark'>
                    <tr>
                      <th scope='col'>Customer ID</th>
                      <th scope='col'>Total Balance</th>
                      <th scope='col'>Age</th>
                      <th scope='col'>Gender</th>
                      <th scope='col'>Zip Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData && reportData.length > 0 ? (
                      generateCustomerRow(reportData)
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          {isGeneratingReport ? (
                            <div className="spinner-border" role="status">
                              <span className="visually-hidden">Generating User Reports...</span>
                            </div>
                          ) : (
                            <h5>No user data to report</h5>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>)}
      {/* Footer */}
      <footer className="py-5 bg-dark">
        <div className="container px-5">
          <p className="m-0 text-center text-white">Copyright &copy; Hoken 2023</p>
        </div>
      </footer>
    </div>
  )
}
export default AdminPage;