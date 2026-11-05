'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const [tag, outputPath, ...assetPaths] = process.argv.slice(2);
const version = typeof tag === 'string' ? tag.replace(/^v/, '') : '';
if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error('Release tag must contain a semantic version, such as v1.2.3.');
}
if (!outputPath || assetPaths.length !== 2) {
  throw new Error('Usage: node scripts/create-release-manifest.js <tag> <output> <installer.exe> <app.apk>');
}

function describeAsset(assetPath, expectedName) {
  if (path.basename(assetPath) !== expectedName) {
    throw new Error(`Expected release asset ${expectedName}.`);
  }
  const stat = fs.statSync(assetPath);
  if (!stat.isFile() || stat.size === 0) {
    throw new Error(`Release asset ${expectedName} is missing or empty.`);
  }
  const sha256 = crypto.createHash('sha256').update(fs.readFileSync(assetPath)).digest('hex');
  return {
    fileName: expectedName,
    version,
    sizeBytes: stat.size,
    sha256,
    signatureVerified: false,
    verificationStatus: 'unverified'
  };
}

const androidSignerFingerprint = process.env.AAKI_ANDROID_SIGNER_FINGERPRINT || '';
const androidSignerSubject = process.env.AAKI_ANDROID_SIGNER_SUBJECT || '';
if (Boolean(androidSignerFingerprint) !== Boolean(androidSignerSubject)
  || (androidSignerFingerprint && !/^[a-f0-9]{64}$/i.test(androidSignerFingerprint))) {
  throw new Error('Provide both a valid Android signer SHA-256 fingerprint and signer subject after signature verification.');
}

const manifest = {
  tag,
  version,
  windows: describeAsset(assetPaths[0], 'aaki-marine-setup.exe'),
  android: {
    ...describeAsset(assetPaths[1], 'aaki-marine.apk'),
    signatureVerified: Boolean(androidSignerFingerprint),
    verificationStatus: androidSignerFingerprint ? 'verified' : 'unverified',
    signerFingerprint: androidSignerFingerprint.toLowerCase(),
    signerSubject: androidSignerSubject
  }
};

fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'w' });
console.log(`Created release manifest for ${tag}.`);
