# Security Headers Testing Script for Windows PowerShell

function Test-SecurityHeaders {
    param(
        [string]$Url
    )
    
    Write-Host "Security Testing for: $Url" -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Head -ErrorAction Stop
        
        Write-Host "Response Headers:" -ForegroundColor Yellow
        
        # Test specific security headers
        $headers = @{
            "Strict-Transport-Security" = "HSTS"
            "Content-Security-Policy" = "CSP"
            "X-Frame-Options" = "X-Frame-Options"
            "X-Content-Type-Options" = "X-Content-Type-Options"
            "X-XSS-Protection" = "X-XSS-Protection"
            "Referrer-Policy" = "Referrer-Policy"
            "Permissions-Policy" = "Permissions-Policy"
            "Cross-Origin-Embedder-Policy" = "COEP"
            "Cross-Origin-Opener-Policy" = "COOP"
            "Cross-Origin-Resource-Policy" = "CORP"
        }
        
        foreach ($header in $headers.GetEnumerator()) {
            $value = $response.Headers[$header.Key]
            if ($value) {
                Write-Host "PASS $($header.Value): $value" -ForegroundColor Green
            } else {
                Write-Host "FAIL $($header.Value): Missing" -ForegroundColor Red
            }
        }
        
        # Calculate security score
        $presentHeaders = ($headers.Keys | Where-Object { $response.Headers[$_] }).Count
        $totalHeaders = $headers.Count
        $score = [math]::Round(($presentHeaders / $totalHeaders) * 100, 2)
        
        Write-Host ""
        Write-Host "Security Score: $score% ($presentHeaders/$totalHeaders headers present)" -ForegroundColor Magenta
        
    } catch {
        Write-Host "Error testing $Url : $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-NginxConfig {
    Write-Host "Testing nginx configuration..." -ForegroundColor Cyan
    
    # Check if nginx is available
    try {
        $nginxVersion = nginx -v 2>&1
        Write-Host "PASS Nginx found: $nginxVersion" -ForegroundColor Green
        
        # Test configuration
        $testResult = nginx -t 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "PASS Nginx configuration is valid" -ForegroundColor Green
        } else {
            Write-Host "FAIL Nginx configuration has errors:" -ForegroundColor Red
            Write-Host $testResult -ForegroundColor Red
        }
    } catch {
        Write-Host "WARNING Nginx not found. Testing with Docker instead..." -ForegroundColor Yellow
    }
}

function Show-TestingTools {
    Write-Host ""
    Write-Host "External Security Testing Tools:" -ForegroundColor Cyan
    Write-Host "SecurityHeaders.com: https://securityheaders.com/" -ForegroundColor White
    Write-Host "Mozilla Observatory: https://observatory.mozilla.org/" -ForegroundColor White
    Write-Host "SSL Labs: https://www.ssllabs.com/ssltest/" -ForegroundColor White
    Write-Host "CSP Evaluator: https://csp-evaluator.withgoogle.com/" -ForegroundColor White
    
    Write-Host ""
    Write-Host "Quick test commands:" -ForegroundColor Cyan
    Write-Host "Test-SecurityHeaders 'https://erp.sljsupply-center.com'" -ForegroundColor White
    Write-Host "Test-SecurityHeaders 'http://localhost'" -ForegroundColor White
}

# Main execution
Write-Host "SLJ ERP Security Headers Testing Tool" -ForegroundColor Magenta
Write-Host "=======================================" -ForegroundColor Magenta

# Test nginx config
Test-NginxConfig

# Test local server if available
Write-Host ""
Write-Host "Testing local server..." -ForegroundColor Cyan
try {
    Test-SecurityHeaders "http://localhost:3333"
} catch {
    Write-Host "WARNING Local server not running. Start with: docker run -p 3333:80 slj-frontend" -ForegroundColor Yellow
}

# Show testing tools
Show-TestingTools

Write-Host ""
Write-Host "Usage Examples:" -ForegroundColor Cyan
Write-Host "Test-SecurityHeaders 'https://your-domain.com'" -ForegroundColor White
Write-Host "Test-SecurityHeaders 'http://localhost:3333'" -ForegroundColor White
