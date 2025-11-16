# Run Lingo.dev CLI to generate translations
# Using Google Gemini - Get free API key from: https://aistudio.google.com/apikey
$env:GOOGLE_API_KEY = "AIzaSyCBqkkYv-FaAwKQlOt0M_ZXgRrrAfMKkSw"

Write-Host "🌍 Running Lingo.dev CLI to generate translations..."
Write-Host "Provider: Google Gemini 2.0 Flash"
Write-Host "Source: English (en)"
Write-Host "Targets: Hindi, Bengali, Tamil, Spanish, Arabic, Chinese"
Write-Host ""
Write-Host "⚠️  Make sure to set your Google API key above!"
Write-Host ""

npx lingo.dev@latest run

Write-Host ""
Write-Host "✅ Translation generation complete!"
Write-Host "Check public/locales/ folder for generated files"
