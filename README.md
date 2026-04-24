# La Biblia de Jerusalén Project

End-to-end digital Bible publishing project that transforms extracted biblical text into a structured, navigable, and maintainable digital reading experience.

This repository is not only a Bible reader. It contains the full engineering process behind it: custom C# tools, generated static HTML output, PowerShell migration scripts, JSON data modeling, and a React frontend that renders the Bible through reusable components and route-based navigation.

## Portfolio Value

Yes, this is a valid software engineering portfolio project.

The strongest technical value is not simply that the repository displays biblical text. The value is that the project shows a complete content-engineering pipeline built around a real and difficult source: extracting long-form text, parsing it, generating a first usable web version, correcting content, migrating the result into structured data, and rebuilding the experience with a modern frontend.

For a resume or portfolio, this project demonstrates:

- C#/.NET tooling.
- WPF desktop utility development.
- Text parsing with regular expressions.
- Programmatic HTML generation.
- Static website generation.
- PowerShell automation.
- HTML-to-JSON migration.
- Structured data modeling.
- React frontend development.
- React Router navigation.
- Separation of content from presentation.
- Incremental architecture improvement.
- Persistence through a large, detail-heavy engineering task.

## What This Project Is

**La Biblia de Jerusalén Project** is a digital implementation of *La Biblia de Jerusalén, 1976 edition*, together with the tools used to create, publish, migrate, and modernize it.

The repository contains two main deliverables:

1. **A static HTML Bible website** generated from extracted biblical content.
2. **A React Bible reader** that consumes structured JSON data and renders the content through reusable frontend components.

It also contains the internal programs and scripts used to build those deliverables.

## What It Does

The project allows users to navigate the Bible by testament, book, and chapter.

The static version can be opened directly from the generated HTML files and can also be used as web content, including as content for a WordPress-based site.

The React version reads biblical content from JSON files and renders the reader dynamically, avoiding the need to maintain styling and layout separately across thousands of generated HTML files.

## Project Story

This project started from a concrete need: turning a difficult Bible source into a usable digital reading experience.

The first stage was extraction and parsing. The source content came from a PDF/raw extracted text workflow, and the text was not immediately ready to become a clean web application. A custom C# parser/editor was created to read the extracted text, detect chapter and verse structures, and generate HTML pages in the desired format.

Once the parser produced a correct result, the first publishable version was created as a static HTML Bible website. That version included a landing page, testament folders, book indexes, chapter pages, shared CSS, images, Bootstrap, jQuery, and navigation between books and chapters. At that point, the project was already useful: the Bible could be opened, browsed, styled, and published as web content.

After the first working version, more tools were created to support correction and maintenance. Some chapters needed targeted fixes, and additional utilities helped generate repeated HTML sections, collect chapter metadata, and support the publishing process.

Later, a major architecture issue became clear: maintaining a large number of generated HTML files was not ideal. Any design improvement required regenerating or updating many files. The better approach was to separate the biblical content from the visual presentation.

To solve that, the generated HTML content was migrated into structured JSON using PowerShell scripts. Then a React application was built to read the JSON data and render the Bible dynamically through shared components and routes.

That migration changed the project from a static generated page collection into a data-driven frontend application. The biblical text became structured content, while the interface became reusable and easier to redesign.

The current direction is to continue improving the React reader with a cleaner design, stronger search, daily readings, random verses, topic-based spiritual help, favorites, reading progress, and a more polished mobile experience.

## Current Status

The project is functional in two forms.

### Static HTML Version

The static version is located in:

```text
La Biblia/
```

It includes:

- `index.html` as the main entry point.
- `search-result.html` as an early search-related page.
- Old Testament generated content.
- New Testament generated content.
- Book index pages.
- Chapter HTML pages.
- Shared CSS, images, Bootstrap, Glyphicons, and jQuery assets under `!Contenido/`.

This version represents the original publishable Bible website.

### React Version

The React version is located in:

```text
La Biblia/bible-front-end/
```

It uses React, React Router, Bootstrap, Glyphicons, and JSON data files.

To run it:

```bash
cd "La Biblia/bible-front-end"
npm install
npm start
```

To create a production build:

```bash
npm run build
```

## Repository Structure

```text
La Biblia de Jerusalen Project/
├── La Biblia/
│   ├── index.html
│   ├── search-result.html
│   ├── chapters.json
│   ├── References.txt
│   ├── Work Around.txt
│   ├── !Contenido/
│   │   ├── bootstraps/
│   │   ├── css/
│   │   └── images/
│   ├── 00 - Antiguo Testamento/
│   ├── 01 - Nuevo Testamento/
│   ├── PowerShell Tools/
│   │   ├── create-book-configs.ps1
│   │   ├── html-to-json.ps1
│   │   └── html-to-one-json.ps1
│   └── bible-front-end/
│       ├── package.json
│       ├── public/
│       └── src/
│           ├── components/
│           ├── data/
│           ├── Styles/
│           ├── App.js
│           └── index.js
└── Tools/
    ├── BibleEditor/
    ├── GetAllChaptersInfo/
    ├── HtmlWriter/
    └── Used Projects/
```

## Main Components

### Static HTML Bible

The `La Biblia/` folder contains the generated static website.

This includes the main landing page, testament folders, book indexes, chapter pages, and shared assets. It represents the first complete version of the project and can be used directly as static web content.

### React Bible Reader

The `La Biblia/bible-front-end/` folder contains the modern frontend application.

The main routes are:

```text
/                                      -> Bible home page
/:testament/:bookIndex                 -> Book chapter index
/:testament/:bookIndex/:bookName/:n    -> Chapter reader
```

Main components include:

- `BibleHome.js` — renders the main Bible home page, testaments, book groups, and book navigation.
- `BookIndex.js` — renders the chapter list for a selected book.
- `Chapter.js` — renders a selected chapter and its verses.

Main data files include:

```text
src/data/antiguo-testamento.json
src/data/nuevo-testamento.json
src/data/bookConfigs.json
```

### C# Tools

The `Tools/` folder contains the custom C# tools used during the creation and processing of the Bible content.

These tools are now part of the main repository alongside the Bible content. `BibleEditor` keeps its original commit history, while the smaller support tools were imported as historical project additions.

#### BibleEditor

A C# WPF application used to process extracted text and generate HTML chapter files.

Main responsibilities:

- Load extracted/raw Bible text.
- Detect chapter and verse structures.
- Use regular expressions to identify content patterns.
- Generate HTML pages programmatically.
- Build HTML using custom helper classes such as `HtmlNode` and `HtmlPage`.
- Support configuration and repeatable generation.
- Include additional helper functionality used during the broader project workflow.

#### GetAllChaptersInfo

A C# utility that scans generated chapter folders and creates chapter metadata in JSON format.

This supports inventory, validation, and search-related work.

#### HtmlWriter

A C# utility used to generate repeated HTML structures, especially book or chapter index content, from templates and programmatic output.

#### Used Projects

Supporting experimental or helper projects used during development.

## PowerShell Migration Tools

The `La Biblia/PowerShell Tools/` folder contains scripts used during the migration from static HTML files to structured JSON.

### `html-to-json.ps1`

Reads generated HTML chapter files, parses the DOM through Windows HTML COM automation, extracts verse paragraphs, and writes individual chapter JSON files.

### `html-to-one-json.ps1`

Builds consolidated testament-level JSON files by traversing book folders, sorting chapter files, extracting verses, assigning book/chapter/verse metadata, and exporting the final structured data.

### `create-book-configs.ps1`

Generates book grouping configuration data used by the React frontend to organize books by testament and category.

## Data Model

The React version uses a structured hierarchy similar to:

```text
Testament
└── Books[]
    └── Chapters[]
        └── Versicles[]
```

Core concepts include:

- Testament.
- Book.
- Chapter.
- Verse / versicle.
- Book groups.
- Route parameters for testament, book, and chapter navigation.

This structure allows the UI to render biblical content dynamically instead of relying on repeated static presentation markup in every generated page.

## Technologies Used

### Tooling and Automation

- C#.
- .NET Framework.
- WPF.
- Regex.
- XML configuration/serialization.
- System.Text.Json.
- PowerShell.
- Windows HTML COM automation through `HTMLFile`.

### Frontend and Publishing

- HTML5.
- CSS.
- Bootstrap.
- jQuery.
- Glyphicons.
- React 18.
- React Router DOM.
- JSON.
- Create React App.

## Engineering Highlights

- Built a custom parser/editor instead of manually formatting the content.
- Generated a complete navigable static HTML Bible.
- Created support tools for chapter metadata and repeated HTML generation.
- Migrated generated HTML content into structured JSON.
- Rebuilt the reader as a React application using shared components and routes.
- Improved maintainability by separating content from presentation.
- Preserved the original generated output while moving toward a cleaner modern architecture.

## Known Limitations

The project is functional, but it still reflects its historical evolution.

Current limitations include:

- Some scripts contain hardcoded local paths and should be parameterized.
- Some generated filenames and text artifacts may need normalization.
- The static HTML version contains repeated generated presentation markup.
- The search page exists, but search should be rebuilt as a complete modern feature.
- The React UI works, but the visual design should be improved.
- The React project still contains at least one learning/sample component that can be removed before public presentation.
- There is no automated validation suite for confirming all books, chapters, verses, routes, and generated outputs.
- The tooling, generated output, and modern frontend could be separated more cleanly before a polished public release.

## Roadmap

Planned improvements include:

- Cleaner and more modern visual design.
- Better responsive/mobile reading experience.
- Full search by book, chapter, verse, and text.
- Daily suggested Bible reading.
- Random verse selection for prayer, encouragement, or reflection.
- Topic-based spiritual-help sections.
- Favorites and bookmarks.
- Reading history and reading progress.
- Automated validation for book/chapter/verse completeness.
- Configurable paths for the C# and PowerShell tools.
- Cleaner public/demo packaging.

## Content Rights Note

This repository includes content from a published Bible edition. Before making the full repository public, publication and redistribution rights for the biblical text should be verified.

If full redistribution rights are not confirmed, the project can still be presented publicly by focusing on the engineering work and including only sample content, screenshots, tooling code, architecture documentation, and a limited demo dataset.

## Summary

La Biblia de Jerusalén Project is a strong portfolio project because it shows a complete engineering journey:

1. A difficult long-form source was processed.
2. Custom C# tools were built to parse and generate content.
3. A working static HTML Bible website was produced.
4. Additional utilities were created for correction and support.
5. The content was migrated into JSON.
6. A React frontend was built to render the Bible dynamically.
7. The architecture evolved toward a more maintainable and extensible product.

The project demonstrates practical software engineering beyond a simple UI: extraction, parsing, automation, static generation, migration, data modeling, and frontend architecture.
