/*

STAGE 6

Core service configuration:
- Static server addresses
- DHCP
- DNS
- HTTP
- Wired endpoint DHCP/static addressing

NO wireless hardware manipulation.
*/

function out(s)
{
    dprint(s);
}

function banner(s)
{
    out("");
    out("============================================================");
    out(s);
    out("============================================================");
}

function getDevice(id)
{
    try
    {
        return ipc.network().getDevice(
            id
        );
    }
    catch (e)
    {
        return null;
    }
}

function staticHost(dev, cfg, id)
{
    var port;

    if (!dev)
    {
        out(
            "MISSING: " +
            id
        );

        return;
    }

    try
    {
        port =
            dev.getPort(
                "FastEthernet0"
            );

        if (!port)
        {
            out(
                id +
                ": FastEthernet0 unavailable"
            );

            return;
        }

        try
        {
            port.setDhcpClientFlag(
                false
            );
        }
        catch (e0)
        {
        }

        port.setIpSubnetMask(
            cfg.ip,
            cfg.mask
        );

        port.setPower(
            true
        );

        try
        {
            dev.setDefaultGateway(
                cfg.gateway
            );
        }
        catch (e1)
        {
        }

        out(
            id +
            " = " +
            cfg.ip
        );
    }
    catch (e)
    {
        out(
            id +
            " STATIC ERROR: " +
            e.toString()
        );
    }
}

function dhcpClient(dev, id)
{
    var port;

    if (!dev)
        return;

    try
    {
        dev.setDhcpFlag(
            true
        );
    }
    catch (e0)
    {
    }

    try
    {
        port =
            dev.getPort(
                "FastEthernet0"
            );

        if (port)
        {
            port.setPower(
                true
            );

            try
            {
                port.setDhcpClientFlag(
                    true
                );
            }
            catch (e1)
            {
            }
        }
    }
    catch (e2)
    {
    }

    out(
        "DHCP CLIENT: " +
        id
    );
}

function configureDhcpServer(dev, pools, id)
{
    var mainProcess;
    var dhcp;

    var i;
    var p;
    var oldPool;

    if (!dev || !pools)
        return;

    try
    {
        mainProcess =
            dev.getProcess(
                "DhcpServerMain"
            );

        dhcp =
            mainProcess.getDhcpServerProcessByPortName(
                "FastEthernet0"
            );

        dhcp.setEnable(
            true
        );

        for (i = 0; i < pools.length; i++)
        {
            p =
                pools[i];

            try
            {
                oldPool =
                    dhcp.getPool(
                        p.name
                    );

                if (oldPool)
                {
                    dhcp.removePool(
                        p.name
                    );
                }
            }
            catch (e0)
            {
            }

            try
            {
                dhcp.addNewPool(
                    p.name,
                    p.gateway,
                    p.dns,
                    p.startIp,
                    p.mask,
                    p.maxUsers,
                    "0.0.0.0",
                    "0.0.0.0"
                );

                out(
                    "DHCP POOL: " +
                    p.name
                );
            }
            catch (e1)
            {
                out(
                    "DHCP POOL ERROR: " +
                    p.name
                );
            }
        }
    }
    catch (e)
    {
        out(
            id +
            " DHCP ERROR: " +
            e.toString()
        );
    }
}

function configureDns(dev, records, id)
{
    var dns;
    var i;

    if (!dev || !records)
        return;

    try
    {
        dns =
            dev.getProcess(
                "DnsServer"
            );

        dns.setEnable(
            true
        );

        try
        {
            dns.setPortNumber(
                53
            );
        }
        catch (e0)
        {
        }

        for (i = 0; i < records.length; i++)
        {
            try
            {
                dns.addARecordToNameServerDb(
                    records[i].name,
                    records[i].ip
                );

                out(
                    "DNS " +
                    records[i].name +
                    " -> " +
                    records[i].ip
                );
            }
            catch (e1)
            {
            }
        }
    }
    catch (e)
    {
        out(
            id +
            " DNS ERROR"
        );
    }
}

function configureHttp(dev, page, id)
{
    var http;

    if (!dev || !page)
        return;

    try
    {
        http =
            dev.getProcess(
                "HttpServer"
            );

        http.setPortNumber(
            80
        );

        http.setEnable(
            true
        );

        http.setPageContents(
            "index.html",
            page
        );

        out(
            id +
            ": HTTP enabled"
        );
    }
    catch (e)
    {
        out(
            id +
            ": HTTP ERROR"
        );
    }
}

function main()
{
    var file;
    var text;
    var topology;

    var id;
    var dev;
    var cfg;

    banner(
        "NEXACORE STAGE 6 - SERVICES / CLIENTS"
    );

    file =
        ipc.appWindow().getActiveFile();

    if (!file)
    {
        out(
            "ERROR: no active file"
        );

        return;
    }

    text =
        file.getScriptDataStore(
            "topology.txt"
        );

    if (!text)
    {
        out(
            "ERROR: topology.txt missing"
        );

        return;
    }

    topology =
        JSON.parse(
            text
        );

    banner(
        "SERVER STATIC ADDRESSING"
    );

    for (id in topology.serverConfigs)
    {
        dev =
            getDevice(
                id
            );

        cfg =
            topology.serverConfigs[
                id
            ];

        if (!dev)
        {
            out(
                "SERVER MISSING: " +
                id
            );

            continue;
        }

        staticHost(
            dev,
            cfg,
            id
        );
    }

    banner(
        "DHCP / DNS / HTTP"
    );

    for (id in topology.serverConfigs)
    {
        dev =
            getDevice(
                id
            );

        cfg =
            topology.serverConfigs[
                id
            ];

        if (!dev)
            continue;

        if (cfg.dhcpPools)
        {
            configureDhcpServer(
                dev,
                cfg.dhcpPools,
                id
            );
        }

        if (cfg.dnsRecords)
        {
            configureDns(
                dev,
                cfg.dnsRecords,
                id
            );
        }

        if (cfg.httpPage)
        {
            configureHttp(
                dev,
                cfg.httpPage,
                id
            );
        }

        if (cfg.limitation)
        {
            out(
                id +
                " LIMITATION: " +
                cfg.limitation
            );
        }
    }

    banner(
        "WIRED CLIENT ADDRESSING"
    );

    for (id in topology.hostConfigs)
    {
        dev =
            getDevice(
                id
            );

        cfg =
            topology.hostConfigs[
                id
            ];

        if (!dev)
            continue;

        if (cfg.mode == "static")
        {
            staticHost(
                dev,
                cfg,
                id
            );
        }
        else
        {
            dhcpClient(
                dev,
                id
            );
        }
    }

    banner(
        "STAGE 6 COMPLETE"
    );

    out(
        "Use Fast Forward Time."
    );

    out(
        "Test DHCP, DNS and HTTP before Stage 7."
    );

    out(
        "SAVE THE .PKT FILE."
    );
}

function cleanUp()
{
    out(
        "Stage 6 stopped."
    );
}