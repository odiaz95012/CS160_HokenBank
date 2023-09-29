import React, {useState, useEffect} from 'react'

function App() {
  const [customers, setCustomers] = useState([{}]);

  useEffect( () => {
    fetch("http://localhost:8000/getCustomers").then( 
      res => res.json()
    ).then(
      customers => {
        setCustomers(customers);
        console.log(customers);
      })
      .catch(
        err => console.log(err)
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
          </ul>
          
        ))   
      )} 
    </div>
  )
}

export default App