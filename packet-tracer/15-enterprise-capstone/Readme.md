# Enterprise Network Capstone

## Overview

This project is a large-scale enterprise network built in Cisco Packet Tracer.

The design demonstrates a multi-site network with headquarters, a dedicated
data center, multiple branch offices, Internet connectivity, centralized
services, VLAN segmentation, redundancy, dynamic routing, and security controls.

## Architecture

The network includes:

- Corporate headquarters
- Primary data center
- Three branch offices
- One remote office
- Dual Internet edge routers
- Simulated ISP network
- Core, distribution, and access layers
- Centralized infrastructure services

## Technologies

- VLANs
- 802.1Q trunking
- Inter-VLAN routing
- HSRP
- Rapid-PVST+
- LACP EtherChannel
- OSPF multi-area routing
- DHCP
- DHCP relay
- DNS
- HTTP
- NAT/PAT
- Static NAT
- Extended ACLs
- SSH management
- Port security
- PortFast
- BPDU Guard
- Wireless corporate and guest networks
- DMZ segmentation

## Addressing Strategy

Site summaries:

| Site | Address Block |
|---|---|
| HQ | 10.10.0.0/16 |
| Data Center | 10.20.0.0/16 |
| Branch 1 | 10.31.0.0/16 |
| Branch 2 | 10.32.0.0/16 |
| Branch 3 | 10.33.0.0/16 |
| Remote Office | 10.34.0.0/16 |
| WAN Infrastructure | 10.255.0.0/16 |

## Routing

OSPF is used as the enterprise routing protocol.

- Area 0: enterprise backbone
- Area 20: data center
- Area 31: branch 1
- Area 32: branch 2
- Area 33: branch 3
- Area 34: remote office

## Redundancy

The design includes:

- Dual core switches
- Dual distribution switches
- Dual WAN aggregation switches
- Dual Internet edge routers
- HSRP gateway redundancy
- EtherChannel
- STP redundancy
- Dual branch WAN paths
- OSPF reconvergence

## Security

Security controls include:

- SSH-only administration
- Management access ACLs
- Port security
- BPDU Guard
- PortFast
- Guest network isolation
- CCTV / IoT restrictions
- Internet edge ACLs
- NAT/PAT
- Static NAT for DMZ services
- Unused-port VLANs

## Services

The data center provides:

- DHCP
- DNS
- Internal web services
- Email simulation
- File / FTP services
- Application services
- Database simulation
- Syslog / NTP management services
- Backup services
- DMZ web service

## Automation

The `automation/` directory contains the Packet Tracer File Script Module
scripts used to build and configure the topology in stages.

The staged approach was used because executing all device creation,
configuration, and services in a single Packet Tracer scripting run can
overload the Packet Tracer scripting environment.

## Verification

Useful commands include:

```text
show ip interface brief
show vlan brief
show interfaces trunk
show etherchannel summary
show spanning-tree
show standby brief
show ip ospf neighbor
show ip route
show access-lists
show ip nat translations
show cdp neighbors