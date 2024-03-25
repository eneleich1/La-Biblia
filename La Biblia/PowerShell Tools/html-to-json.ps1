
function Get-ChildsRecursive {

    param (
        $htmlNode
    )

    $nodes = @()
    
    foreach($n in $htmlNode.childNodes)
    {
        $nodes+= $n
        $nodes+= Get-ChildsRecursive -htmlNode $n
    }

    return $nodes
}

#Parameters
$source = "D:\Cristianity\La Biblia\01 - Nuevo Testamento"
$destiny = "C:\Users\eneleich\Desktop\Biblia Json\Nuevo Testamento"

 
$dirs = Get-ChildItem -Path $source

foreach($d in $dirs)
{
    $filesInfo = Get-ChildItem -Path $d.FullName

    Write-Output "Processing $($filesInfo.Length) chapters"

    foreach($fileInfo in $filesInfo)
    {
        $chapterName = $fileInfo.Name.Remove($fileInfo.Name.Length - 5, 5)

        $file = $fileInfo.FullName
        $Source = Get-Content -path $file -raw -Encoding UTF8
        $html = New-Object -Com "HTMLFile"
        $html.IHTMLDocument2_write($Source)

        $body = $html.documentElement.childNodes[1];

        $childs = Get-ChildsRecursive -htmlNode $body -nodes $childs

        $versicles = $childs | Where-Object {$_.nodeNAme -eq "p"}

        $versiclesObj = @()

        foreach($v in $versicles)
        {
            $a = $v.childNodes[0].innerText
            $text = $v.innerText.Remove(0,$a.Length + 1)

            $versiclesObj+= [pscustomobject]@{Index=$a; Text=$text}

        }

        $chapter = [pscustomobject]@{ChapterName=$chapterName; Versicles=$versiclesObj} | ConvertTo-Json

        [System.IO.Directory]::CreateDirectory("$destiny\$d")
        #New-Item -Path "$destiny" -Name "$d" -ItemType "directory"

        $chapter | Out-File "$destiny\$d\$chapterName.json"

        $chapter
    }
}


