# Home Wireless Network Lab

## Overview

This Packet Tracer lab recreates a small residential network using a
cable-provider connection, cable modem, wireless home router, wired clients,
and a wireless laptop.

The purpose of the lab was to practice:

- Ethernet and coaxial connectivity
- Cable modem connectivity
- Home-router configuration
- DHCP
- Wireless LAN configuration
- WPA2 Personal
- DNS and HTTP testing
- Wireless client association
- Packet Tracer scripting experiments

## Topology

The home network contains:

- Cable provider cloud
- Cable splitter
- Cable modem
- Television
- Home wireless router
- Office PC
- Bedroom PC
- Wireless laptop
- External test server

## Required Connections

```text
Cable Provider
      |
    Coax
      |
Cable Splitter
   /       \
Modem      TV
  |
Internet
  |
Home Router
 /    |    \
PC    PC   Wi-Fi
            |
          Laptop
Wireless Configuration

SSID:

MyHome

Security:

WPA2 Personal

Passphrase:

MyPassPhrase1!
Router Configuration

Maximum DHCP clients:

10

Administration username:

admin

The lab changes the default router password as part of the exercise.

Client Configuration

Office PC:

DHCP

Bedroom PC:

DHCP

Laptop:

SSID: MyHome
Addressing: DHCP
Verification

The final tests include:

DHCP address assignment
Wireless association
DNS resolution
HTTP connectivity

The clients should be able to access:

skillsforall.srv
Packet Tracer Automation

This folder also contains:

topology.txt
Build.js

These files were part of an experiment to automatically create and configure
the topology using Packet Tracer's File Script Module API.

Known Packet Tracer Automation Limitations

During testing I encountered differences between normal Packet Tracer GUI
devices and devices exposed through the scripting API.

Examples included:

Home Router model creation differences
Laptop wireless-module handling
Device type/model identifiers
Some Packet Tracer APIs not being available in the embedded JavaScript engine

These issues were useful for understanding the difference between simulator
features and real IOS/network behavior.

Skills Practiced
Network topology design
DHCP
DNS
HTTP
Wi-Fi
WPA2
Client connectivity troubleshooting
Packet Tracer scripting
6. **Create `.gitignore`.** Use:

```gitignore
# Temporary files
*.tmp
*.bak
*.log

# Editor files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Python
__pycache__/
*.pyc

# Large / proprietary network images
*.qcow2
*.qcow
*.vmdk
*.iso
*.image
*.bin

# Credentials / secrets
.env
.env.*
secrets/
credentials/