import React, { Component } from 'react'
import newtest from '../data/nuevo-testamento.json'
import oldtest from '../data/antiguo-testamento.json'
import bookConfigs from '../data/bookConfigs.json'

class BibleHome extends Component {

  render() {
    const defaultConfig = bookConfigs[1];
    let oldTestView = (gb) =>
      <div className='mt-5 text-start' key={gb.Title}>
        <h2>{gb.Title != "Antiguo Testamento" ? gb.Title : ""}</h2>
        <ul>
          {
            gb.BookIndexes.map(i =>
              <li key={i}>
                <a className='title-case a-link' href='00 - Antiguo Testamento/00- Indice/01- GÉNESIS.html'>
                  {
                    oldtest.Books[i - 1].Title.toLocaleLowerCase()
                  }
                </a>
              </li>
            )
          }
        </ul>
      </div>

    let newTestView = (gb) =>
      <div className='mt-5 text-start' key={gb.Title}>
        <h2>{gb.Title != "Nuevo Testamento" ? gb.Title : ""}</h2>
        <ul>
          {
            gb.BookIndexes.map(i =>
              <li key={i}>
                <a className='title-case a-link' href='00 - Antiguo Testamento/00- Indice/01- GÉNESIS.html' >
                  {
                    newtest.Books[i - 1].Title.toLocaleLowerCase()
                  }
                </a>
              </li>
            )
          }
        </ul>
      </div>

    return (
      <div className=" d-flex flex-column flex-fill">

        <div className="text-center pb-40 pt-30">
          <h2>La Biblia de Jerusalén</h2>
          <h3>Edición de 1976</h3>
        </div>

        <div className="d-sm-flex flex-wrap justify-content-center mt-5">
          <div id="oldTestament_div" className="pb-30 ">
            <div className="ml-2">
              <h2 className="pb-50 text-center">Antiguo Testamento</h2>
              <div className="mt-5">
                {
                  defaultConfig.BooksGroups.map(gb =>
                    gb.Testament == 1 ?
                      <div className="mt-5" key={gb.Title}>
                        {oldTestView(gb)}
                      </div>
                      :
                     ""
                  )
                }
              </div>
            </div>
          </div>

          <div  className="verticalLine" />

          <div className="pb-30">
            <div className="ml-2">
              <h2 className="pb-30 text-center">Nuevo Testamento</h2>
              <div className="mt-5">
                {
                  defaultConfig.BooksGroups.map(gb =>
                    gb.Testament == 2 ?
                      <div className="mt-5" key={gb.Title}>
                        {newTestView(gb)}
                      </div>
                      :
                     ""
                  )
                }
              </div>
            </div>
          </div>

        </div>

        <footer>
          Copyright © Eneleich Company
        </footer>
      </div>
    )
  }

}

export default BibleHome;