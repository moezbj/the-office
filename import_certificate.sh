#!/bin/bash

# Path to the .p12 file
P12_PATH="./my-certificate.p12"

# Command to import the .p12 file into the specified Keychain
security import "$P12_PATH" -T /usr/bin/codesign

# Optional: Unlock the keychain to ensure the certificate is accessible
security unlock-keychain "$KEYCHAIN"

# Optional: Set key partition list for the private key to make it accessible to codesign
KEY_ALIAS="your-certificate-alias"
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -t private "$KEY_ALIAS"

echo "Certificate imported successfully."
