
class Versicle {
    [int] $Index
    [string] $Text

    Versicle([int] $index, [string] $text) {
        $this.Index = $index
        $this.Text = $text
    }
}

class Chapter {
    [string]$Title
    [string]$ShortTitle
    [Versicle[]]$Versicles

    Chapter([string]$title, [Versicle[]] $versicles) {
        $this.Title = $title
        $this.Versicles = $versicles
    }
    Chapter([string]$title, [string]$shortTitle, [Versicle[]] $versicles) {
        $this.Title = $title
        $this.ShortTitle = $shortTitle
        $this.Versicles = $versicles
    }
}

class Book {
    [string]$Title
    [string]$ShortTitle
    [Chapter[]]$Chapters

    Book([string]$title, [Chapter[]]$chapters) {
        $this.Title = $title
        $this.Chapters = $chapters
    }
    Book([string]$title, [string]$shortTitle, [Chapter[]]$chapters) {
        $this.Title = $title
        $this.Chapters = $chapters
        $this.ShortTitle = $shortTitle
    }
}

class BookGroup {
    [string] $Title
    [Book[]] $Books
    [int[]] $BookIndexes
    [int] $Testament

    BookGroup([string]$title, [Book[]]$Books) {
        $this.Title = $title
        $this.Books = $Books
    }

    BookGroup([string]$title, [int[]]$bookIndexes, [int]$testament) {
        $this.Title = $title
        $this.BookIndexes = $bookIndexes
        $this.Testament = $testament
    }
}

class BookConfig {
    [string] $Title
    [BookGroup[]] $BooksGroups

    BookConfig([string]$title, [BookGroup[]]$booksGroups) {
        $this.Title = $title
        $this.BooksGroups = $booksGroups
    }
}

$detailConfig = [BookConfig]::new("Detail Book Config", @())
$detailConfig.BooksGroups+= [BookGroup]::new("Pentatéuco", [int[]]@(1..5), 1)
$detailConfig.BooksGroups+= [BookGroup]::new("Libros Históricos", [int[]]@(6..21), 1)
$detailConfig.BooksGroups+= [BookGroup]::new("Libros Poéticos o de Sabiduría", [int[]]@(22..28), 1)
$detailConfig.BooksGroups+= [BookGroup]::new("Profetas Mayores", [int[]]@(29,30,31,33,34), 1)
$detailConfig.BooksGroups+= [BookGroup]::new("Profetas Menores", [int[]] (@(32,35) + 36..46), 1)
$detailConfig.BooksGroups+= [BookGroup]::new("Los Evangelios", [int[]]@(1..4), 2)
$detailConfig.BooksGroups+= [BookGroup]::new("Hechos de los Apóstoles", [int[]]@(5), 2)
$detailConfig.BooksGroups+= [BookGroup]::new("Cartas de Pablo", [int[]]@(6.19), 2)
$detailConfig.BooksGroups+= [BookGroup]::new("Santiago", [int[]]@(20), 2)
$detailConfig.BooksGroups+= [BookGroup]::new("Pedro", [int[]]@(21,22), 2)
$detailConfig.BooksGroups+= [BookGroup]::new("Juan", [int[]]@(23..25), 2)
$detailConfig.BooksGroups+= [BookGroup]::new("Judas", [int[]]@(26), 2)
$detailConfig.BooksGroups+= [BookGroup]::new("Apocalipsis", [int[]]@(27), 2)

$defaultConfig = [BookConfig]::new("Default Book Config", @())
$defaultConfig.BooksGroups+= [BookGroup]::new("Antiguo Testamento", [int[]]@(1..46), 1)
$defaultConfig.BooksGroups+= [BookGroup]::new("Nuevo Testamento", [int[]]@(1..27), 2)

$bookConfigs = @($defaultConfig, $detailConfig)

$json = [pscustomobject]$bookConfigs | ConvertTo-Json -Depth 100
$json | Out-File "D:\bookConfigs.json"