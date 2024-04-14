import newtest from '../data/nuevo-testamento.json'
import oldtest from '../data/antiguo-testamento.json'
import bookConfigs from '../data/bookConfigs.json'
import { Link } from "react-router-dom";
import '../Styles/Content/css/homeStyle.css'
import { HashLink } from 'react-router-hash-link';

function IsBookGroup(gb, testament){
  return gb.Title !== testament.Title;
}

function GetBooksGroups(booksConfig) {
  const otg = [];
  const ntg = [];
  booksConfig.BooksGroups.forEach(bg => {
    if (bg.Testament === 1) otg.push(bg)
    else if (bg.Testament === 2) ntg.push(bg)
  });

  return { oldTestGroups: otg, newTestGroups: ntg }
}

function GroupBookView(gb, testament) {
  return (
    <div className='text-start' key={gb.Title}>
      <h3>{IsBookGroup(gb, testament) && gb.Title}</h3>
      <ul>
        {
          gb.BookIndexes.map(i =>
            <li key={i}>
              <Link to={`/${gb.Testament}/${i}`} className='text-dec-none'>
                <p className='title-case a-link mb-1'>
                  {
                    testament.Books[i - 1].Title.toLocaleLowerCase()
                  }
                </p>
              </Link>
            </li>
          )
        }
      </ul>
    </div>
  )
}

function TestamentView(booksGroups, testament, testId) {
  return (
    <div id={testId}>
      <div className="ml-2">
        <h2 className="text-center mb-5">{testament.Title}</h2>
        <div>
          {
            booksGroups.map(gb =>
              <div key={gb.Title}>
                {GroupBookView(gb, testament)}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

function BibleHome() {

  const defaultConfig = bookConfigs[1];
  const booksGroups = GetBooksGroups(defaultConfig);

  return (
    <div className=" d-flex flex-column flex-fill">
      <div className="text-center pb-40 pt-30">
        <h1>La Biblia de Jerusalén</h1>
        <h2>Edición de 1976</h2>
      </div>

      <div className="d-sm-flex justify-content-center mt-5">

        {TestamentView(booksGroups.oldTestGroups, oldtest, "oldTest_div")}
        <div className="verticalLine" />
        {TestamentView(booksGroups.newTestGroups, newtest, "newTest_div")}

      </div>

      <footer>
        Copyright © Eneleich Company
      </footer>
    </div>
  )
}

export default BibleHome;