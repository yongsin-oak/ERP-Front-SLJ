#!/bin/bash

# Script to test nginx configuration and security headers
echo "🔧 Testing nginx configuration..."

# Test nginx syntax
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi

# Function to test security headers
test_security_headers() {
    local url="$1"
    echo "🛡️ Testing security headers for: $url"
    
    echo "📋 Testing headers:"
    curl -I "$url" 2>/dev/null | grep -E "(Strict-Transport-Security|Content-Security-Policy|X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Referrer-Policy|Permissions-Policy|Cross-Origin)"
    
    echo ""
    echo "🔍 Detailed header analysis:"
    
    # Test specific headers
    local hsts=$(curl -I "$url" 2>/dev/null | grep -i "strict-transport-security")
    local csp=$(curl -I "$url" 2>/dev/null | grep -i "content-security-policy")
    local referrer=$(curl -I "$url" 2>/dev/null | grep -i "referrer-policy")
    local permissions=$(curl -I "$url" 2>/dev/null | grep -i "permissions-policy")
    
    [ -n "$hsts" ] && echo "✅ HSTS: $hsts" || echo "❌ HSTS: Missing"
    [ -n "$csp" ] && echo "✅ CSP: Found" || echo "❌ CSP: Missing"
    [ -n "$referrer" ] && echo "✅ Referrer-Policy: $referrer" || echo "❌ Referrer-Policy: Missing"
    [ -n "$permissions" ] && echo "✅ Permissions-Policy: Found" || echo "❌ Permissions-Policy: Missing"
}

# Test URLs
echo "🌐 Testing security headers..."

# Test localhost (if running)
if curl -I http://localhost 2>/dev/null | head -1 | grep -q "200\|404"; then
    test_security_headers "http://localhost"
else
    echo "⚠️ Local server not running. Start nginx with: docker run -p 80:80 slj-frontend"
fi

echo ""
echo "🔗 External testing tools:"
echo "• SecurityHeaders.com: https://securityheaders.com/"
echo "• Mozilla Observatory: https://observatory.mozilla.org/"
echo "• SSL Labs: https://www.ssllabs.com/ssltest/"

echo ""
echo "🚀 To test your live site:"
echo "curl -I https://erp.sljsupply-center.com"
