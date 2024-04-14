import React from 'react'
import { Link } from 'react-router-dom';
import newtest from '../data/nuevo-testamento.json'
import oldtest from '../data/antiguo-testamento.json'
import "owp.glyphicons/glyphicons.min.css";
import { useParams } from 'react-router-dom'
import '../Styles/Content/css/chapterStyle.css'

function ChapterPart(part) {
	return (
		part.map((v, i) => {
			return (
				<div key={i}>
					<p className='versicle' id={`V${v.Index}`}>
						<strong className="vers-id">{v.Index}</strong>
						{v.Text}
					</p>
				</div>
			);
		})
	)
}

function Chapter() {

	const params = useParams();
	let testament = parseInt(params.testament);
	let bookIndex = parseInt(params.bookIndex);
	let chapterNumber = parseInt(params.chapterNumber);

	let book = testament === 2 ? newtest.Books[bookIndex - 1] : oldtest.Books[bookIndex - 1];

	const bookTitle = book.Title.toLocaleLowerCase().substring(4, book.Title.length);

	let chapter = book.Chapters[chapterNumber - 1];

	let chapterName = `${chapter.ShortTitle}`;
	chapterName = chapterName.substring(13, chapterName.length + 53);

	let half = Math.floor(chapter.Versicles.length / 2);
	let mark = chapter.Versicles.length % 2 === 0 ? half : half + 1;

	let leftPart = chapter.Versicles.slice(0, mark);
	let rightPart = chapter.Versicles.slice(mark, chapter.Versicles.length);

	return (
		<div>
			<div className='header'>
				<Link to="/">
					<button type='button' className='btn btn-primary' >
						<span className='glyphicon glyphicon-home'></span>
					</button>
				</Link>
				<Link to={`/${testament}/${bookIndex}`}>
					<button type='button' className='btn btn-primary ms-2' >
						<span className='glyphicon glyphicon-th'></span>
					</button>
				</Link>
				{
					chapterNumber > 1 &&
					<Link to={`/${testament}/${bookIndex}/${bookTitle}/${chapterNumber - 1}`}>
						<button type='button' className='btn btn-primary ms-2'>
							<span className='glyphicon glyphicon-chevron-left'></span>
						</button>
					</Link>
				}
				{
					chapterNumber < book.Chapters.length &&
					<Link to={`/${testament}/${bookIndex}/${bookTitle}/${chapterNumber + 1}`}>
						<button type='button' className='btn btn-primary ms-2' >
							<span className='glyphicon glyphicon-chevron-right'></span>
						</button>
					</Link>
				}
			</div>

			<div className="row">
				<div className="col-3"></div>
				<div className="col-6">
					<h1 id='chapter01' className='title-case text-center mb-5'>{chapterName}</h1>
					<div className='row'>
						<div className='col-sm-6 book-page'>
							{
								ChapterPart(leftPart)
							}
						</div>
						<div className='col-sm-6 book-page'>
							{
								ChapterPart(rightPart)
							}
						</div>
					</div>
				</div>
				<div className="col-3"></div>
			</div>

			<div className='footer'>
				<Link to="/">
					<button type='button' className='btn btn-primary' >
						<span className='glyphicon glyphicon-home'></span>
					</button>
				</Link>
				<Link to={`/${testament}/${bookIndex}`}>
					<button type='button' className='btn btn-primary ms-2' >
						<span className='glyphicon glyphicon-th'></span>
					</button>
				</Link>
				{
					chapterNumber > 1 &&
					<Link to={`/${testament}/${bookIndex}/${bookTitle}/${chapterNumber - 1}`}>
						<button type='button' className='btn btn-primary ms-2'>
							<span className='glyphicon glyphicon-chevron-left'></span>
						</button>
					</Link>
				}
				{
					chapterNumber < book.Chapters.length &&
					<Link to={`/${testament}/${bookIndex}/${bookTitle}/${chapterNumber + 1}`}>
						<button type='button' className='btn btn-primary ms-2'>
							<span className='glyphicon glyphicon-chevron-right'></span>
						</button>
					</Link>
				}
			</div>
		</div>
	)
}

export default Chapter;
