import React, { Component } from 'react'
import newtest from '../data/nuevo-testamento.json'
import oldtest from '../data/antiguo-testamento.json'
import bookConfigs from '../data/bookConfigs.json'

class BibleHome extends Component {

  GroupBookView(gb, testament) {
    return (
      <div className='mt-5 text-start' key={gb.Title}>
        <h4>{gb.Title != testament.Title ? gb.Title : ""}</h4>
        <ul>
          {
            gb.BookIndexes.map(i =>
              <li key={i}>
                <a className='title-case a-link' href='00 - Antiguo Testamento/00- Indice/01- GÉNESIS.html'>
                  {
                    testament.Books[i - 1].Title.toLocaleLowerCase()
                  }
                </a>
              </li>
            )
          }
        </ul>
      </div>
    )
  }

  TestamentView(booksGroups, testament) {
    return (
      <div id="oldTestament_div" className="pb-30 ">
        <div className="ml-2">
          <h2 className="pb-30 text-center">{testament.Title}</h2>
          <div className="mt-5">
            {
              booksGroups.map(gb =>
                  <div className="mt-5" key={gb.Title}>
                    {this.GroupBookView(gb, testament)}
                  </div>
              )
            }
          </div>
        </div>
      </div>
    )
  }

  GetBooksGroups(booksConfig){
    const otg = [];
    const ntg = [];
    booksConfig.BooksGroups.forEach(bg => {
      if(bg.Testament == 1) otg.push(bg)
      else if(bg.Testament == 2) ntg.push(bg)
    });

    return {oldTestGroups: otg, newTestGroups: ntg}
  }

  render() {
    const defaultConfig = bookConfigs[1];
    const booksGroups = this.GetBooksGroups(defaultConfig);

    return (
      <div className=" d-flex flex-column flex-fill">

        <div className="text-center pb-40 pt-30">
          <h2>La Biblia de Jerusalén</h2>
          <h3>Edición de 1976</h3>
        </div>

        <div className="d-sm-flex flex-wrap justify-content-center mt-5">

          {this.TestamentView(booksGroups.oldTestGroups, oldtest)}
          <div className="verticalLine" />
          {this.TestamentView(booksGroups.newTestGroups, newtest)}

        </div>

        <footer>
          Copyright © Eneleich Company
        </footer>
      </div>
    )
  }

}

export default BibleHome;