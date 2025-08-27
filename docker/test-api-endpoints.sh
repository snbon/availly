#!/bin/bash
set -e

echo "🧪 Testing Availly API Endpoints..."
echo "======================================"

# Default values
BASE_URL="${1:-http://localhost:8080}"
API_BASE="${BASE_URL}/api"

echo "📍 Testing against: ${API_BASE}"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${BLUE}Testing ${method} ${endpoint}${NC}"
    echo "Description: ${description}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "${API_BASE}${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" -X "${method}" \
            -H "Content-Type: application/json" \
            -d "${data}" \
            "${API_BASE}${endpoint}")
    fi
    
    # Split response and status code
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Success (${http_code})${NC}"
    elif [ "$http_code" -eq 405 ]; then
        echo -e "${RED}❌ Method Not Allowed (${http_code}) - This suggests the route exists but doesn't accept ${method}${NC}"
    elif [ "$http_code" -eq 404 ]; then
        echo -e "${YELLOW}⚠️  Not Found (${http_code}) - Route doesn't exist${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTP ${http_code}${NC}"
    fi
    
    echo "Response: ${response_body}"
    echo "---"
    echo ""
}

# Test basic endpoints
echo "🔍 Testing Basic Endpoints"
test_endpoint "GET" "/health" "" "Health check endpoint"
test_endpoint "GET" "/test" "" "Test endpoint"

# Test authentication endpoints
echo "🔐 Testing Authentication Endpoints"
test_endpoint "POST" "/auth/login" '{"email":"test@example.com","password":"password123"}' "Login endpoint"
test_endpoint "POST" "/auth/register" '{"name":"Test User","email":"test@example.com","password":"password123","password_confirmation":"password123"}' "Register endpoint"

# Test with different HTTP methods to see what's allowed
echo "🔄 Testing Method Support"
test_endpoint "GET" "/auth/login" "" "Login endpoint with GET (should fail)"
test_endpoint "PUT" "/auth/login" '{"email":"test@example.com","password":"password123"}' "Login endpoint with PUT (should fail)"
test_endpoint "DELETE" "/auth/login" "" "Login endpoint with DELETE (should fail)"

# Test OPTIONS request for CORS
echo "🌐 Testing CORS Support"
test_endpoint "OPTIONS" "/auth/login" "" "CORS preflight request"

# Test with different content types
echo "📝 Testing Content Type Support"
echo -e "${BLUE}Testing POST /auth/login with form data${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=test@example.com&password=password123" \
    "${API_BASE}/auth/login")
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)
echo "Form data response: HTTP ${http_code} - ${response_body}"
echo "---"
echo ""

# Test API routes listing (if available)
echo "📋 Testing Route Information"
if command -v php &> /dev/null; then
    echo "PHP available - checking if we can list routes"
    cd apps/api
    if [ -f "artisan" ]; then
        echo "Laravel artisan found, listing API routes:"
        php artisan route:list --path=api | head -20 || echo "Could not list routes"
    else
        echo "Laravel artisan not found"
    fi
    cd ../..
else
    echo "PHP not available for route listing"
fi

echo ""
echo "🎯 Summary of Issues:"
echo "1. If you see 405 errors, the route exists but doesn't accept the HTTP method"
echo "2. If you see 404 errors, the route doesn't exist"
echo "3. If you see 500 errors, there's a server-side error"
echo ""
echo "💡 Next Steps:"
echo "1. Check the Laravel logs: docker exec <container> tail -f /usr/share/nginx/html/api/storage/logs/laravel.log"
echo "2. Verify the route is registered: docker exec <container> cd /usr/share/nginx/html/api && php artisan route:list --path=api"
echo "3. Check nginx configuration: docker exec <container> nginx -t"
echo "4. Test PHP-FPM: docker exec <container> php-fpm82 -t"
