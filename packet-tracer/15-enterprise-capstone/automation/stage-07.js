/*

STAGE 7

Optional / Packet-Tracer-version-sensitive services.

Recommended first run:
ENABLE_OPTIONAL_SERVICES = true
ENABLE_WIRELESS = false

Second run:
ENABLE_OPTIONAL_SERVICES = false
ENABLE_WIRELESS = true
*/

var ENABLE_OPTIONAL_SERVICES = true;
var ENABLE_WIRELESS = false;

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

function configureOptionalServices(dev, cfg, id)
{
    var p;
    var i;

    if (!dev || !cfg)
        return;

    if (cfg.emailUsers)
    {
        try
        {
            p =
                dev.getProcess(
                    "EmailServer"
                );

            if (p)
            {
                for (i = 0; i < cfg.emailUsers.length; i++)
                {
                    try
                    {
                        p.addUser(
                            cfg.emailUsers[i].user,
                            cfg.emailUsers[i].password
                        );
                    }
                    catch (e0)
                    {
                    }
                }

                out(
                    id +
                    ": Email attempted"
                );
            }
        }
        catch (e1)
        {
            out(
                id +
                ": Email API unavailable"
            );
        }
    }

    if (cfg.ftpEnable == true)
    {
        try
        {
            p =
                dev.getProcess(
                    "FtpServer"
                );

            if (p)
            {
                p.setEnable(
                    true
                );

                out(
                    id +
                    ": FTP enabled"
                );
            }
        }
        catch (e2)
        {
            out(
                id +
                ": FTP API unavailable"
            );
        }
    }

    if (cfg.syslogEnable == true)
    {
        try
        {
            p =
                dev.getProcess(
                    "SyslogServer"
                );

            if (p)
            {
                p.setEnable(
                    true
                );

                out(
                    id +
                    ": Syslog enabled"
                );
            }
        }
        catch (e3)
        {
            out(
                id +
                ": Syslog needs GUI verification"
            );
        }
    }

    if (cfg.ntpEnable == true)
    {
        try
        {
            p =
                dev.getProcess(
                    "NtpServer"
                );

            if (p)
            {
                p.setEnable(
                    true
                );

                out(
                    id +
                    ": NTP enabled"
                );
            }
        }
        catch (e4)
        {
            out(
                id +
                ": NTP needs GUI verification"
            );
        }
    }
}

function configureAccessPoint(dev, cfg, id)
{
    var w;
    var wpa;

    if (!dev || !cfg)
        return;

    try
    {
        w =
            dev.getProcess(
                "WirelessServer"
            );

        if (!w)
        {
            out(
                id +
                ": WirelessServer unavailable"
            );

            return;
        }

        try
        {
            w.setNetworkType(
                3
            );
        }
        catch (e0)
        {
        }

        w.setSsid(
            cfg.ssid
        );

        w.setAuthenType(
            cfg.authType
        );

        w.setEncryptType(
            cfg.encryptType
        );

        try
        {
            w.setSsidBrdCastEnabled(
                true
            );
        }
        catch (e1)
        {
        }

        wpa =
            w.getWpaProcess();

        if (wpa)
        {
            wpa.setPasswd(
                cfg.passphrase
            );
        }

        out(
            id +
            ": configured SSID " +
            cfg.ssid
        );
    }
    catch (e)
    {
        out(
            id +
            ": AP AUTOMATION FAILED - USE GUI"
        );
    }
}

function configureWirelessClient(dev, cfg, id)
{
    var w;
    var wpa;
    var port;

    if (!dev || !cfg)
        return;

    /*
    Deliberately DO NOT manipulate laptop modules here.
    Hardware/module changes were unstable in earlier testing.

    If Wireless0 is absent:
    manually install the WPC300N in Packet Tracer first.
    */

    try
    {
        port =
            dev.getPort(
                "Wireless0"
            );

        if (!port)
        {
            out(
                id +
                ": Wireless0 missing - install WPC300N manually"
            );

            return;
        }
    }
    catch (e0)
    {
        out(
            id +
            ": Wireless0 missing - install WPC300N manually"
        );

        return;
    }

    try
    {
        w =
            dev.getProcess(
                "WirelessClient"
            );

        if (!w)
        {
            out(
                id +
                ": WirelessClient unavailable"
            );

            return;
        }

        try
        {
            w.setPort(
                "Wireless0"
            );
        }
        catch (e1)
        {
        }

        try
        {
            w.setNetworkType(
                3
            );
        }
        catch (e2)
        {
        }

        w.setSsid(
            cfg.ssid
        );

        w.setAuthenType(
            cfg.authType
        );

        w.setEncryptType(
            cfg.encryptType
        );

        wpa =
            w.getWpaProcess();

        if (wpa)
        {
            wpa.setPasswd(
                cfg.passphrase
            );
        }

        port.setPower(
            true
        );

        try
        {
            port.setDhcpClientFlag(
                true
            );
        }
        catch (e3)
        {
        }

        try
        {
            dev.setDhcpFlag(
                true
            );
        }
        catch (e4)
        {
        }

        out(
            id +
            ": joined profile " +
            cfg.ssid
        );
    }
    catch (e)
    {
        out(
            id +
            ": wireless automation failed - configure GUI manually"
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

    banner(
        "NEXACORE STAGE 7"
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

    if (
        ENABLE_OPTIONAL_SERVICES == true
    )
    {
        banner(
            "OPTIONAL SERVER SERVICES"
        );

        for (id in topology.serverConfigs)
        {
            dev =
                getDevice(
                    id
                );

            if (dev)
            {
                configureOptionalServices(
                    dev,
                    topology.serverConfigs[id],
                    id
                );
            }
        }
    }

    if (
        ENABLE_WIRELESS == true
    )
    {
        banner(
            "WIRELESS ACCESS POINTS"
        );

        for (id in topology.wirelessConfigs)
        {
            dev =
                getDevice(
                    id
                );

            if (dev)
            {
                configureAccessPoint(
                    dev,
                    topology.wirelessConfigs[id],
                    id
                );
            }
        }

        banner(
            "WIRELESS CLIENTS"
        );

        for (id in topology.wirelessClientConfigs)
        {
            dev =
                getDevice(
                    id
                );

            if (dev)
            {
                configureWirelessClient(
                    dev,
                    topology.wirelessClientConfigs[id],
                    id
                );
            }
        }
    }

    banner(
        "STAGE 7 COMPLETE"
    );

    out(
        "SAVE THE .PKT FILE."
    );
}

function cleanUp()
{
    out(
        "Stage 7 stopped."
    );
}