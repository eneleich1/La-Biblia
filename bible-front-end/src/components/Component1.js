import React, {useState} from 'react'

export const Component1 = () => {

    let title = "La Biblia de Jerusalen";

    //Use state variable "name"
    const [name, setName] = useState("Nestor Longa")

    //Array sample
    let evangelios = [
        "Mateo",
        "Marcos",
        "Lucas",
        "Juan"
    ];

    //Use state function
    const ChangeName = (newName) => {
        setName(newName);
    }

  return (
    <div>
        <h1>El titulo de este proyecto es: "{title}"</h1>

        <p>Autor: <strong className={name.length >=4 ?'green' : 'red'}>{name}</strong></p>

        <h3>Use state sample</h3>
        <input type='text' placeholder='Enter the new name' onChange={e => ChangeName(e.target.value)}/>
        <button onClick={ e => ChangeName("Itzae Longa")}>
            Change Name
        </button>

        <h3>Array Sample:</h3>
        <div>
            {
                evangelios.map( (evangelio, index) => {
                    return (
                        <li key={index}>{evangelio}</li>
                    );

                })
            }
        </div>

    </div>
  )
}
