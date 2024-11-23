import React from 'react'
import { Link } from 'react-router-dom';
import newtest from '../data/nuevo-testamento.json'
import oldtest from '../data/antiguo-testamento.json'
import "owp.glyphicons/glyphicons.min.css";
import { useParams } from 'react-router-dom'
import '../Styles/Content/css/bookIndexStyle.css'

function formatBookTitle(title) {
    const romanPattern = /^[IVXLCDM]+(?=\s)/i;
    const match = title.match(romanPattern);
    let formattedTitle = '';
  
    if (match && match.index === 0) {
      // Mantener el número romano en mayúsculas si está al principio del título
      formattedTitle += match[0].toUpperCase();
      // Convertir el resto del título a formato de título con la primera letra en mayúscula
      formattedTitle += title.substring(match[0].length).toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    } else {
      // Convertir todo el título a formato de título con la primera letra en mayúscula
      formattedTitle = title.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    }
  
    return formattedTitle;
  }

export const BookIndex = () => {

    const FormatChapter = (num, len) => {
        let digits = String(num).length;
        let res = num;

        for (; digits < len; digits++) {
            res = '0' + res;
        }

        return res;
    }

    const IndexesView = (indexes, bookTitle) => {
        return (
            indexes.map(i =>
                <Link to={{ pathname: `${bookTitle}/${i}` }} key={i}>
                    <button type='button' className='chapter btn btn-default '>
                        <p className='chapter-a'>{FormatChapter(i, 2)}</p>
                    </button>
                </Link>
            )
        )
    }

    const params = useParams();
    let testament = parseInt(params.testament);
    let bookIndex = parseInt(params.bookIndex);

    let book = testament === 2 ? newtest.Books[bookIndex - 1] : oldtest.Books[bookIndex - 1];

    const bookTitle = formatBookTitle(book.Title.toLocaleLowerCase().substring(4, book.Title.length));
    let indexes = Array.from(Array(book.Chapters.length).keys()).map(i => i + 1)

    const NextBookIndex = (t, i) => {
        return (t === 1 && i === 46) ? `/${testament + 1}/${1}` : `/${testament}/${bookIndex + 1}`
    }
    const PrevBookIndex = (t, i) => {
        return (t === 2 && i === 1) ? `/${1}/${46}` : `/${testament}/${bookIndex - 1}`
    }

    return (
        <div className='container-fluid text-center'>
            <div className='d-flex row-content'>
                <div className='col-sm-3'></div>
                <div className='col-sm-6'>
                    <div className='container-fluid text-start header padding1'>
                        <h1 className='title-case'>{bookTitle}</h1>
                    </div>

                    <div className='container-fluid text-start section padding1'>{IndexesView(indexes, bookTitle)}</div>

                    <div className='container-fluid  text-start footer padding1'>
                        <Link to="/">
                            <button type='button' className='btn btn-primary' >
                                <span className='glyphicon glyphicon-home'></span>
                            </button>
                        </Link>
                        {
                            !(testament === 1 && bookIndex === 1) &&
                            <Link to={PrevBookIndex(testament, bookIndex)}>
                                <button type='button' className='btn btn-primary ms-2'>
                                    <span className='glyphicon glyphicon-chevron-left'></span>
                                </button>
                            </Link>
                        }
                        {
                            !(testament === 2 && bookIndex === 27) &&
                            <Link to={NextBookIndex(testament, bookIndex)}>
                                <button type='button' className='btn btn-primary ms-2'>
                                    <span className='glyphicon glyphicon-chevron-right'></span>
                                </button>
                            </Link>
                        }
                    </div>
                </div>
                <div className='col-sm-3'></div>
            </div>
        </div>
    )
}

export default BookIndex;