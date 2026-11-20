#!/usr/bin/env bash
# Starts Expo with the LAN IP forced into the QR code.
# Needed when VPN/Tailscale/Docker interfaces make Expo advertise an address the iPhone can't reach.
set -euo pipefail
IP="${1:-$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for (i = 1; i < NF; i++) if ($i == "src") { print $(i + 1); exit }}')}"
if [[ -z "${IP}" ]]; then
  echo "Could not detect LAN IP. Usage: npm run start:lan -- 192.168.1.23" >&2
  exit 1
fi
echo "LAN IP: ${IP}"
echo "Test from the iPhone in Safari: http://${IP}:8081/status  (should show packager-status:running)"
REACT_NATIVE_PACKAGER_HOSTNAME="${IP}" exec npx expo start --clear
