@"
# Home Wireless Network Lab

## Objective

Build and configure a residential network using:

- Cable provider connection
- Cable splitter
- Cable modem
- Home wireless router
- Two wired PCs
- Wireless laptop
- DHCP
- DNS
- HTTP
- WPA2 Personal

## Wireless Configuration

SSID:

MyHome

Security:

WPA2 Personal

Passphrase:

MyPassPhrase1!

## DHCP

Maximum wireless/home-network clients:

10

## Verification

The final clients should be able to:

- Receive IPv4 configuration through DHCP
- Connect to the MyHome wireless network
- Resolve skillsforall.srv
- Access skillsforall.srv through HTTP
"@ | Set-Content packet-tracer\14-home-wireless\README.md
