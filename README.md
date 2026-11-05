# AAKI Marine public downloads

This repository publishes AAKI Marine's Windows installer and Android APK as GitHub Release assets so visitors can download them without access to the private source repository.

## Publishing a release

Attach the following exact asset names to a GitHub Release and publish it:

- `aaki-marine-setup.exe`
- `aaki-marine.apk`

The `Sync download release` workflow calculates SHA-256 checksums, runs Android `apksigner` verification, and attaches `release-manifest.json`. Windows binaries without Authenticode signing are explicitly marked unverified. A valid Android APK signature proves that the APK is signed, not that its signer is the AAKI Marine publisher. Review the certificate identity and release checksums before installing software.

The private HOSTWEB website reads the latest public release automatically. Do not upload secrets, private source, user data, or files you are not authorized to redistribute.
