#!/bin/bash
set -e

echo "🔧 Testing Nginx Configuration Syntax..."
echo "======================================"

# Test the template file
echo "📋 Checking template file syntax..."
if [ -f "docker/nginx.conf.template" ]; then
    echo "✅ Template file exists"
else
    echo "❌ Template file not found"
    exit 1
fi

# Render the configuration with a test port
echo -e "\n🔍 Rendering configuration with test port..."
PORT="8080"
sed "s/PORT_REPLACE/${PORT}/g" docker/nginx.conf.template > /tmp/test-nginx.conf

echo "✅ Configuration rendered to /tmp/test-nginx.conf"

# Check for syntax issues
echo -e "\n🔍 Checking for common syntax issues..."

# Check for missing 'always' keywords
if grep -q 'add_header.*; always' /tmp/test-nginx.conf; then
    echo "❌ Found syntax error: '; always' should be 'always;'"
    grep -n 'add_header.*; always' /tmp/test-nginx.conf
else
    echo "✅ All add_header directives have correct syntax"
fi

# Check for proper 'always' placement
if grep -q 'add_header.*always;' /tmp/test-nginx.conf; then
    echo "✅ Found correct 'always;' syntax"
else
    echo "❌ No 'always;' directives found"
fi

# Check for semicolon placement
echo -e "\n🔍 Checking semicolon placement..."
grep -n 'add_header' /tmp/test-nginx.conf | head -10

# Show the rendered configuration
echo -e "\n📄 Rendered configuration (first 50 lines):"
head -50 /tmp/test-nginx.conf

# Test nginx syntax if available
echo -e "\n🧪 Testing nginx syntax..."
if command -v nginx &> /dev/null; then
    if nginx -t -c /tmp/test-nginx.conf 2>&1; then
        echo "✅ Nginx configuration syntax is valid"
    else
        echo "❌ Nginx configuration has syntax errors"
        echo "Testing with nginx -t -c /tmp/test-nginx.conf"
        nginx -t -c /tmp/test-nginx.conf 2>&1 || true
    fi
else
    echo "⚠️ nginx not available for syntax testing"
fi

# Cleanup
rm -f /tmp/test-nginx.conf

echo -e "\n🎯 Summary:"
echo "If you see syntax errors above, fix them before deploying."
echo "Common issues:"
echo "1. Missing 'always' keyword after add_header"
echo "2. Incorrect semicolon placement"
echo "3. Missing quotes around values"
echo "4. Invalid location block syntax"
