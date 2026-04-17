# Test PDF Upload Functionality

# First, let's create a mock PDF-like binary for testing
# Since we don't have an actual PDF, we'll test with the text resume

$resumeText = @"
John Doe
Email: john.doe@example.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe
GitHub: github.com/johndoe

SUMMARY
Experienced full-stack developer with expertise in building scalable web applications.

SKILLS
Programming Languages: Python, JavaScript, TypeScript, Java, Go, SQL
Front-end Technologies: React, Vue.js, Tailwind, Bootstrap
Back-end Frameworks: Node.js, Express, Django, FastAPI, Spring Boot
Databases: PostgreSQL, MongoDB, Redis, Firebase
DevOps & Cloud: Docker, Kubernetes, AWS, Azure
Tools: Git, GraphQL, REST APIs, Stripe

EXPERIENCE
Senior Full-Stack Developer | Tech Startup Inc.
January 2022 - Present
Led development of microservices architecture using Node.js and Express

Full-Stack Developer | Web Agency Co.
June 2020 - December 2021
Developed responsive web applications using React and TypeScript

EDUCATION
Bachelor of Science in Computer Science
State University, 2018

Certifications:
AWS Solutions Architect (2021)
"@

Write-Host "=== PDF/TXT File Upload Test ===" -ForegroundColor Cyan
Write-Host "`nTesting the new upload endpoint..." -ForegroundColor Yellow

# Write the test resume to a temporary text file
$tempFile = "$env:TEMP\test-resume.txt"
$resumeText | Out-File -FilePath $tempFile -Encoding UTF8
Write-Host "Created test file: $tempFile" -ForegroundColor Gray

try {
    # Test 1: Upload text file
    Write-Host "`n[TEST 1] Uploading .txt file..." -ForegroundColor Yellow
    
    $form = @{
        resume = Get-Item -Path $tempFile
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:4000/tasks/upload" `
        -Method POST `
        -Form $form `
        -Headers @{ "Authorization" = "Bearer test" } `
        -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✓ Upload successful!" -ForegroundColor Green
        Write-Host "Filename: $($data.filename)" -ForegroundColor Gray
        Write-Host "File size: $($data.fileSize)" -ForegroundColor Gray
        Write-Host "Skills detected: $($data.data.skillCount)" -ForegroundColor Gray
        Write-Host "Sample skills: $(($data.data.skills | Select-Object -First 5) -join ', ')" -ForegroundColor Gray
        Write-Host "Contact email: $($data.data.contact.email)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Upload failed with status: $($response.StatusCode)" -ForegroundColor Red
        Write-Host "Response: $($response.Content)" -ForegroundColor Red
    }
}
catch {
    Write-Host "✗ Error during test: $_" -ForegroundColor Red
    Write-Host "`nThis is likely due to authentication. To fix:" -ForegroundColor Yellow
    Write-Host "1. The endpoint requires Bearer token authentication" -ForegroundColor Gray
    Write-Host "2. You need to be logged in first" -ForegroundColor Gray
    Write-Host "`nFor production use, upload through the web UI:" -ForegroundColor Yellow
    Write-Host "1. Go to http://localhost:5173" -ForegroundColor Gray
    Write-Host "2. Sign in to your account" -ForegroundColor Gray
    Write-Host "3. Navigate to 'AI Task Matching' page" -ForegroundColor Gray
    Write-Host "4. Drag & drop or select your PDF/TXT resume" -ForegroundColor Gray
}
finally {
    # Cleanup
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
        Write-Host "`nCleaned up test file" -ForegroundColor Gray
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
