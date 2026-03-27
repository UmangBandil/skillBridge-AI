# Test Resume Parser via API

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
Front-end Technologies: React, Vue.js, Tailwind, Bootstrap, Material UI
Back-end Frameworks: Node.js, Express, Django, FastAPI, Spring Boot
Databases: PostgreSQL, MongoDB, Redis, Firebase
DevOps & Cloud: Docker, Kubernetes, AWS, Azure, GitHub Actions
Tools & Others: Git, GraphQL, REST APIs, Stripe

EXPERIENCE
Senior Full-Stack Developer | Tech Startup Inc.
January 2022 - Present
Led development of microservices architecture using Node.js and Express
Implemented real-time features using WebSockets and Kafka
Optimized database queries reducing load times by 40%
Mentored junior developers

Full-Stack Developer | Web Agency Co.
June 2020 - December 2021
Developed responsive web applications using React and TypeScript
Built RESTful APIs with Django and FastAPI

EDUCATION
Bachelor of Science in Computer Science
State University, 2018

Certifications:
AWS Solutions Architect (2021)
Docker and Kubernetes Mastery (2020)
"@

$body = @{
    resume = $resumeText
} | ConvertTo-Json -Depth 10

Write-Host "Testing Resume Parser API..." -ForegroundColor Cyan
Write-Host "Sending resume to /api/tasks/parse endpoint..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/tasks/parse" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body `
        -ErrorAction Stop

    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "`nResume parsing successful!`n" -ForegroundColor Green
        
        Write-Host "PARSING RESULTS:" -ForegroundColor Cyan
        Write-Host "================================"
        
        Write-Host "`nSkills Detected: $($result.data.skillCount)" -ForegroundColor Yellow
        Write-Host "First 10 skills:"
        $result.data.skills | Select-Object -First 10 | ForEach-Object { Write-Host "  - $_" }
        
        if ($result.data.skills.Count -gt 10) {
            Write-Host "  ... and $($result.data.skills.Count - 10) more"
        }
        
        Write-Host "`nEducation Detected: $($result.data.hasEducation)" -ForegroundColor Yellow
        Write-Host "Education entries: $($result.data.education.Count)"
        if ($result.data.hasEducation) {
            $result.data.education | ForEach-Object { Write-Host "  - $_" }
        }
        
        Write-Host "`nExperience Detected: $($result.data.hasExperience)" -ForegroundColor Yellow
        Write-Host "Experience entries: $($result.data.experience.Count)"
        if ($result.data.experience.Count -gt 0) {
            $result.data.experience | ForEach-Object { Write-Host "  - $_" }
        }
        
        Write-Host "`nContact Information:" -ForegroundColor Yellow
        if ($result.data.contact.email) { Write-Host "  Email: $($result.data.contact.email)" }
        if ($result.data.contact.phone) { Write-Host "  Phone: $($result.data.contact.phone)" }
        if ($result.data.contact.linkedin) { Write-Host "  LinkedIn: $($result.data.contact.linkedin)" }
        if ($result.data.contact.github) { Write-Host "  GitHub: $($result.data.contact.github)" }
        
        Write-Host "`n================================" -ForegroundColor Cyan
        Write-Host "Parser test completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Parsing failed: $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error connecting to API: $_" -ForegroundColor Red
    Write-Host "`nMake sure the development server is running on http://localhost:4000" -ForegroundColor Yellow
}
