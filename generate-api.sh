./node_modules/.bin/openapi-generator-cli generate \
 -i https://spacetraders.io/SpaceTraders.json \
 -o src/api \
 -g typescript-axios \
 --additional-properties=npmName="spacetraders-sdk" \
 --additional-properties=npmVersion="2.0.0" \
 --additional-properties=supportsES6=true \
 --skip-validate-spec