# Restore Student Table Script
# This script restores the student table in the database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Student Table Restoration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to server directory
Set-Location -Path $PSScriptRoot

# Database connection details
$dbUser = "root"
$dbPassword = ""  # Leave empty if no password
$dbName = "hostel_db"

Write-Host "Restoring student table structure..." -ForegroundColor Yellow

# Execute the SQL script
if ($dbPassword -eq "") {
    mysql -u $dbUser $dbName < db/restore_student_table.sql
} else {
    mysql -u $dbUser -p$dbPassword $dbName < db/restore_student_table.sql
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nStudent table restored successfully!" -ForegroundColor Green
    Write-Host "`nVerifying table structure..." -ForegroundColor Yellow
    
    # Verify the table structure
    if ($dbPassword -eq "") {
        mysql -u $dbUser -e "USE $dbName; DESCRIBE student;" 
    } else {
        mysql -u $dbUser -p$dbPassword -e "USE $dbName; DESCRIBE student;" 
    }
    
    Write-Host "`nStudent table is ready!" -ForegroundColor Green
} else {
    Write-Host "`nError: Failed to restore student table!" -ForegroundColor Red
    Write-Host "Please check your MySQL connection and try again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
