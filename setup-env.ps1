# PowerShell script to set up .env.local file
Write-Host "Setting up .env.local file for VOYA app..." -ForegroundColor Green

# Check if .env.local already exists
if (Test-Path ".env.local") {
    Write-Host ".env.local file already exists!" -ForegroundColor Yellow
    Get-Content ".env.local"
} else {
    Write-Host "Creating .env.local file..." -ForegroundColor Green
    
    # Create the .env.local file with placeholder values
    @"
# OpenAI API Key for activity generation
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Google Maps API Key for autocomplete (optional)
# Get your API key from: https://console.cloud.google.com/
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    
    Write-Host ".env.local file created successfully!" -ForegroundColor Green
    Write-Host "Please edit the file and replace 'your_openai_api_key_here' with your actual OpenAI API key." -ForegroundColor Yellow
    Write-Host "File location: $(Get-Location)\.env.local" -ForegroundColor Cyan
}

Write-Host "`nAfter updating the API key, restart your development server with: npm run dev" -ForegroundColor Green 