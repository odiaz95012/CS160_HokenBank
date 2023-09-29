import React, {useState, useEffect} from 'react'
import axios, { formToJSON } from 'axios';
function App() {
  const [customers, setCustomers] = useState([{}]);

  async function deleteCustomer(customer_id){
    await axios.delete(`http://localhost:8000/deleteCustomer/${customer_id}`).then(
      console.log("Customer Removed from Database")
    ).catch(
      err => console.log(err)
    )
  }

  useEffect( () => {
    axios.get("http://localhost:8000/getCustomers").then( 
      response => {
        setCustomers(response.data)
      }
    )
      .catch(
        err => console.log("An error occured: " + err)
      )
  }, [])
  return (
    <div>
      {(typeof customers === 'undefined') ? (
        <p>Fetching Customers...</p>
      ) : (
        customers.map((customer, i) => (
          <ul>
            <li key={i}>Customer ID: {customer.customer_id}</li>
            <li key={i}>Name: {customer.name}</li>
            <li key={i}>Email: {customer.email}</li>
            <li key={i}>Username: {customer.username}</li>
            <li key={i}>Password: {customer.password}</li>
            <li key={i}>Age: {customer.age}</li>
            <li key={i}>Gender: {customer.gender}</li>
            <li key={i}>Zipcode: {customer.zipcode}</li>
            <li key={i}>Balance Due: {customer.balance_due}</li>
            <li key={i}>Status {customer.customer_id}</li>
            <li key={i}><button type='submit' onClick={() => deleteCustomer(customer.customer_id)}>Remove Customer</button></li>
          </ul>
         
        ))   
      )} 
    </div>
  )
}

export default App