$basePath = 'C:\Repos\Cornwall Wedding Photography'
$outputFile = Join-Path $basePath '_data\portfolio.yml'

$paths = @{
    wedding    = Join-Path $basePath 'assets\images\photos'
}

$yaml = @()

function Get-VenueFromFilename ($filename) {
    $name = $filename -replace '\.(jpg|jpeg|png|webp)$', ''
    
    # Extract venue patterns
    $venuePatterns = @{
        'trevenna' = 'Trevenna Barns'
        'tredudwell' = 'Tredudwell Manor'
        'st-ives' = 'St Ives Harbour Hotel'
        'the-green' = 'The Green, Liskeard'
        'church-ceremony' = 'Cornish Church'
    }
    
    foreach ($pattern in $venuePatterns.Keys) {
        if ($name -match $pattern) {
            return $venuePatterns[$pattern]
        }
    }
    
    return "Cornish Venue"
}

function Get-CategoryFromFilename ($filename) {
    $name = $filename -replace '\.(jpg|jpeg|png|webp)$', ''
    
    $categoryPatterns = @{
        'confetti' = 'details'
        'first-dance' = 'couples'
        'ceremony' = 'venues'
        'portrait' = 'couples'
        'beach' = 'coastal'
        'coast' = 'coastal'
        'sunset' = 'golden-hour'
        'golden' = 'golden-hour'
        'details' = 'details'
        'dress' = 'details'
        'rings' = 'details'
        'cake' = 'details'
    }
    
    foreach ($pattern in $categoryPatterns.Keys) {
        if ($name -match $pattern) {
            return $categoryPatterns[$pattern]
        }
    }
    
    # Default categories based on common keywords
    if ($name -match '\d{3}' -or $name -match 'portrait|bride|groom|couple') {
        return 'couples'
    }
    
    return 'wedding'
}

function Get-TitleFromFilename ($filename) {
    $name = $filename -replace '\.(jpg|jpeg|png|webp)$', ''

    # Remove trailing number (with optional underscore or hyphen)
    $name = $name -replace '([_-]?\d+)$', ''

    # Replace underscores and hyphens with spaces
    $name = $name -replace '[_-]', ' '

    # Clean up any double spaces left behind
    $name = $name -replace '\s{2,}', ' '

    (Get-Culture).TextInfo.ToTitleCase($name.Trim())
}

function Get-MomentType ($filename) {
    $name = $filename.ToLower()
    
    if ($name -match 'first-dance|dance') { return 'First Dance' }
    if ($name -match 'confetti|confeti') { return 'Confetti Moment' }
    if ($name -match 'ceremony|church') { return 'Ceremony' }
    if ($name -match 'portrait|couple') { return 'Couple Portrait' }
    if ($name -match 'sunset|golden') { return 'Golden Hour' }
    if ($name -match 'details|dress|rings|cake|flowers') { return 'Details' }
    if ($name -match 'reception|speech|toast') { return 'Reception' }
    
    return 'Wedding Moment'
}

foreach ($category in $paths.Keys) {
    Get-ChildItem $paths[$category] -recurse -Include *.jpg,*.jpeg,*.png,*.webp -File | ForEach-Object {
        write-host "Processing: $($_.Name)"
        
        $filename = $_.Name
        $baseName = $_.BaseName
        $venue = Get-VenueFromFilename $filename
        $momentType = Get-MomentType $filename
        $categories = @(Get-CategoryFromFilename $filename)
        
        # Add venue-based categories
        if ($venue -match 'St Ives|Coast|Beach|Harbour') {
            $categories += 'coastal'
        }
        elseif ($venue -match 'Manor|House|Garden|Barns') {
            $categories += 'venues'
        }
        
        # Remove duplicates
        $categories = $categories | Select-Object -Unique
        
        $yaml += "- image: $baseName"
        $yaml += "  category: wedding"
        $yaml += "  categories: [$($categories -join ', ')]"
        $yaml += "  venue: `"$venue`""
        $yaml += "  moment: `"$momentType`""
        $yaml += "  title: `"$((Get-TitleFromFilename $filename))`""
        $yaml += "  description: `"$momentType at $venue, Cornwall`""
        $yaml += "  filename: `"$filename`""
        $yaml += ""
    }
}

$yaml | Out-File $outputFile -Encoding UTF8

Write-Host "Portfolio YAML generated successfully with enhanced metadata"