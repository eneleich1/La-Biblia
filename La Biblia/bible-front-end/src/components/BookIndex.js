import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import newtest from '../data/nuevo-testamento.json'
import oldtest from '../data/antiguo-testamento.json'
import "owp.glyphicons/glyphicons.min.css";

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
                    <button type='button' className='btn btn-default chapter'>
                        <p className='chapter-a'>{FormatChapter(i, 2)}</p>
                    </button>
                </Link>
            )
        )
    }

    let testament = 1;
    let bookIndex = 1;
    let book = testament === 2 ? newtest.Books[bookIndex - 1] : oldtest.Books[bookIndex - 1];

    const bookTitle = book.Title.toLocaleLowerCase().substring(4, book.Title.length);
    let indexes = Array.from(Array(book.Chapters.length).keys()).map(i => i + 1)

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
                        <button type='button' className='btn btn-primary' >
                            <span className='glyphicon glyphicon-home'></span>
                        </button>
                        <button type='button' className='btn btn-primary ms-2'>
                            <span className='glyphicon glyphicon-chevron-right'></span>
                        </button>
                    </div>
                </div>
                <div className='col-sm-3'></div>
            </div>
        </div>
    )
}

export default BookIndex;