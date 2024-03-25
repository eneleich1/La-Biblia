import React from 'react'
import genesis1 from '../biblia-json/Antiguo Testamento/mgenesis/mgenesis1.json'

export const Genesis1_Book = () => {

    const versicles = genesis1.Versicles.map(v => 
        <div key={v.Index}>
          <p>
            <a className='versicle-index' id={v.Index}>{v.Index} </a>
            {v.Text}
          </p>
        </div>
      )
      
  return (
    <div>
        <h1>{genesis1.ChapterName}</h1>
        <ul>{versicles}</ul>
    </div>
  )
}