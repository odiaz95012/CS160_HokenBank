import React, {useState, useEffect} from 'react'

function App() {
  const [data, setData] = useState([{}]);

  useEffect( () => {
    fetch("http://localhost:8000/members").then( 
      res => res.json()
    ).then(
      data => {
        setData(data);
        console.log(data);
      })
      .catch(
        err => console.log(err)
      )
  }, [])
  return (
    <div>
      {(typeof data.members === 'undefined') ? (
        <p>Fetching Members...</p>
      ) : (
        data.members.map((member, i) => (
          <p key={i}>{member}</p>
        ))   
      )} 
    </div>
  )
}

export default App