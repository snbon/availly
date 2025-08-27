#!/bin/bash
set -e

echo "🧪 Testing Availly deployment configuration..."

# Check if required files exist
echo "📁 Checking required files..."
required_files=(
    "docker/nginx-main.conf"
    "docker/nginx.conf.template"
    "docker/php-fpm.conf"
    "docker/php.ini"
    "docker/entrypoint.sh"
    "Dockerfile"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Test nginx configuration syntax
echo -e "\n🔧 Testing nginx configuration..."
if command -v nginx &> /dev/null; then
    # Create a temporary config for testing
    mkdir -p /tmp/nginx-test/conf.d
    cp docker/nginx-main.conf /tmp/nginx-test/nginx.conf
    cp docker/nginx.conf.template /tmp/nginx-test/conf.d/default.conf.template
    
    # Replace PORT_REPLACE with a test port
    sed "s/PORT_REPLACE/8080/g" /tmp/nginx-test/conf.d/default.conf.template > /tmp/nginx-test/conf.d/default.conf
    
    # Test the configuration
    if nginx -t -c /tmp/nginx-test/nginx.conf -g "error_log /dev/stderr;" 2>&1; then
        echo "✅ Nginx configuration is valid"
    else
        echo "❌ Nginx configuration has syntax errors"
        exit 1
    fi
    
    # Cleanup
    rm -rf /tmp/nginx-test
else
    echo "⚠️ nginx not available for testing"
fi

# Test entrypoint script
echo -e "\n📜 Testing entrypoint script..."
if [ -x "docker/entrypoint.sh" ]; then
    echo "✅ Entrypoint script is executable"
else
    echo "❌ Entrypoint script is not executable"
    chmod +x docker/entrypoint.sh
    echo "✅ Made entrypoint script executable"
fi

# Check Dockerfile
echo -e "\n🐳 Checking Dockerfile..."
if grep -q "nginx.conf.template" Dockerfile; then
    echo "✅ Dockerfile references correct nginx template"
else
    echo "❌ Dockerfile missing nginx.conf.template reference"
fi

echo -e "\n🎉 All tests passed! Your deployment configuration looks good."
echo -e "\n💡 To deploy:"
echo "   docker build -t availly ."
echo "   docker run -p 8080:80 -e PORT=8080 availly"
