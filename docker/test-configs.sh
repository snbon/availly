#!/bin/bash
set -e

echo "🧪 Testing Nginx Configurations..."
echo "=================================="

PORT="8080"

echo "📋 Testing original configuration..."
sed "s/PORT_REPLACE/${PORT}/g" docker/nginx.conf.template > /tmp/original.conf

echo "Original config syntax check:"
if nginx -t -c /tmp/original.conf 2>&1; then
    echo "✅ Original config syntax is valid"
else
    echo "❌ Original config has syntax errors"
fi

echo -e "\n📋 Testing minimal configuration..."
sed "s/PORT_REPLACE/${PORT}/g" docker/nginx-minimal.conf.template > /tmp/minimal.conf

echo "Minimal config syntax check:"
if nginx -t -c /tmp/minimal.conf 2>&1; then
    echo "✅ Minimal config syntax is valid"
else
    echo "❌ Minimal config has syntax errors"
fi

echo -e "\n🔍 Comparing configurations..."
echo "Original config size: $(wc -l < /tmp/original.conf) lines"
echo "Minimal config size: $(wc -l < /tmp/minimal.conf) lines"

echo -e "\n📄 Original config (first 20 lines):"
head -20 /tmp/original.conf

echo -e "\n📄 Minimal config (first 20 lines):"
head -20 /tmp/minimal.conf

# Cleanup
rm -f /tmp/original.conf /tmp/minimal.conf

echo -e "\n💡 If minimal config works but original doesn't, there's a syntax issue in the original."
echo "If both fail, there's a fundamental nginx configuration problem."
