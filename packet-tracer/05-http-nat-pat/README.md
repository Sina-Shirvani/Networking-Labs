# HTTP Access with NAT/PAT

Application connectivity through the network edge.

## Lab file

[Open or download the Packet Tracer lab](./HTTP.pkt). Open the file in Cisco Packet Tracer; if compatibility warnings appear, use a compatible release and work from a copy.

## Supplied evidence

The supplied screenshot shows PC20 opening http://internet.lab.local and an external server page identifying 198.51.100.10. The visible NAT table includes internal clients 192.168.10.100 and 192.168.20.100 translated through 203.0.113.2 with distinct TCP ports.

![Lab evidence](./screenshots/Internet%20accesss-ip-nat-translation.PNG)

## Verification checklist

These are proposed checks to run in Packet Tracer, not recorded test results.

- [ ] Open http://internet.lab.local from an internal client.
- [ ] Inspect show ip nat translations while generating HTTP traffic.
- [ ] Record inside and outside interfaces and test both client networks.

## Documentation status

The original binary lab is preserved. Topic labels are based on its filename and any supplied screenshot. The saved device configurations have not been inspected or simulated for this portfolio update.

To complete the case study, record the topology, addressing plan, relevant configuration, command output, and observed troubleshooting or failover results.
