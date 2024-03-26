
function Get-ChildsRecursive {

    param (
        $htmlNode
    )

    $nodes = @()
    
    foreach ($n in $htmlNode.childNodes) {
        $nodes += $n
        $nodes += Get-ChildsRecursive -htmlNode $n
    }

    return $nodes
}

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

    BookGroup([string]$title, [Book[]]$Books) {
        $this.Title = $title
        $this.Books = $Books
    }
}

#Parameters
$source = "D:\Cristianity\La Biblia\01 - Nuevo Testamento"
$destiny = "C:\Users\eneleich\Desktop\Biblia Json\"

$testament = [BookGroup]::new("Nuevo Testamento", @())

$dirs = Get-ChildItem -Path $source

foreach ($d in $dirs) 
{
    if ($d.Name -eq "00- Indice") { continue }
   
    #We need to pass as an array because could be some books with only one chapter, and $filesInfo could no be an array by default
    $filesInfo = @(Get-ChildItem -Path $d.FullName)

    $book = [Book]::new($d.Name, "short title: $($d.Name)", @())

    Write-Output "Processing $($book.Title) with $($filesInfo.Length) chapters"

    foreach ($fileInfo in $filesInfo) {

        $chapterName = $fileInfo.Name.Remove($fileInfo.Name.Length - 5, 5)

        $file = $fileInfo.FullName
        $Source = Get-Content -path $file -raw -Encoding UTF8
        $html = New-Object -Com "HTMLFile"
        $html.IHTMLDocument2_write($Source)

        $body = $html.documentElement.childNodes[1];

        $childs = Get-ChildsRecursive -htmlNode $body -nodes $childs

        $versicles = $childs | Where-Object { $_.nodeNAme -eq "p" }

        $chapter = [Chapter]::new($chapterName, "short title: $chapterName", @())

        foreach ($v in $versicles) {
            $a = $v.childNodes[0].innerText
            $text = $v.innerText.Remove(0, $a.Length)

            $versicle = [Versicle]::new($a, $text)
            $chapter.Versicles += $versicle
        }

        $book.Chapters += $chapter
    }

    $testament.Books += $book
}

$json = [pscustomobject]$testament | ConvertTo-Json -Depth 100
$json | Out-File "$destiny\$($testament.Title).json"

