import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import axios from 'axios';
import Cookies from 'js-cookie';
import PopUpAlert from './PopUpAlert';
import '../componentStyles/AdminPageStyles.css';

function AdminPage() {
//latest version

  interface inputData {
    minBalance: number,
    maxBalance: number,
    minAge: number,
    maxAge: number,
    zipcode: number,
    gender: string
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
    const formattedDate = `${datePart}-${timePart}`;

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






  return (
    <div className='overflow-hidden'>
      <NavBar />
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
      {/* Footer */}
      <footer className="py-5 bg-dark">
        <div className="container px-5">
          <p className="m-0 text-center text-white">Copyright &copy; Hoken 2023</p>
        </div>
      </footer>
    </div>
  )
}

export default AdminPage