import React, { Component } from 'react'
import newtest from '../data/nuevo-testamento.json'
import oldtest from '../data/antiguo-testamento.json'

class ChapterIndex extends Component {

    format(num, len) {
        let digits = 0;
        if (num < 10) digits = 1;
        else if (num < 100) digits = 2;

        let res = num;
        for (digits; digits < len; digits++) {
            res = '0' + res;
        }

        return res;
    }

    IndexesView(indexes) {
        return (
            indexes.map(i =>
                <button type='button' className='btn btn-default chapter' key={i}>
                    <a className='chapter-a' href='../01- GÉNESIS/Génesis 1.html'>{this.format(i, 2)}</a>
                </button>
            )
        )
    }

    render() {

        let testament = 1;
        let bookIndex = 1;

        let book = null;
        if (testament == 1) { book = oldtest.Books[bookIndex - 1]; }
        else if (testament == 2) { book = newtest.Books[bookIndex - 1]; }

        let chaptersCount = book.Chapters.length;
        let indexes = Array.from(Array(chaptersCount).keys()).map(i => i + 1)

        return (
            <div className='container-fluid text-center'>
                <div className='d-flex row-content'>
                    <div className='col-sm-3'></div>
                    <div className='col-sm-6'>
                        <div className='container-fluid text-start header padding1'>
                            <h1 className='title-case'>{book.Title.toLocaleLowerCase().substring(3, book.Title.length)}</h1>
                        </div>

                        <div className='container-fluid text-start section padding1'>{this.IndexesView(indexes)}</div>

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

}

export default ChapterIndex;