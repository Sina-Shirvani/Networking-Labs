var createdNames = {};
var createdObjects = {};


// ============================================================
// OUTPUT
// ============================================================

function out(text)
{
    dprint(text);
}


function banner(text)
{
    out("");
    out("============================================================");
    out(text);
    out("============================================================");
}


function result(step, state, text)
{
    out(
        step +
        " [" +
        state +
        "] " +
        text
    );
}


// ============================================================
// BASIC HELPERS
// ============================================================

function cableType(name)
{
    if (name == "straight")
        return 8100;

    if (name == "crossover")
        return 8101;

    if (name == "auto")
        return 8107;

    if (name == "coaxial")
        return 8110;

    return 8107;
}


function normalize(text)
{
    var x;

    if (!text)
        return "";

    x = ("" + text).toLowerCase();

    x = x.replace(/ /g, "");
    x = x.replace(/-/g, "");
    x = x.replace(/_/g, "");

    return x;
}


// ============================================================
// PORT TYPES
// ============================================================

function isEthernetType(type)
{
    return (
        type == 2 ||
        type == 3 ||
        type == 4 ||
        type == 5 ||
        type == 6 ||
        type == 32
    );
}


function isCoaxType(type)
{
    return (
        type == 21 ||
        type == 22 ||
        type == 27
    );
}


function isWirelessType(type)
{
    return (
        type == 9 ||
        type == 10 ||
        type == 11 ||
        type == 12 ||
        type == 13 ||
        type == 24
    );
}


// ============================================================
// PRINT DEVICE PORTS
// ============================================================

function printPorts(dev, id)
{
    var i;
    var p;

    out(
        "Available ports on " +
        id +
        ":"
    );

    try
    {
        for (
            i = 0;
            i < dev.getPortCount();
            i++
        )
        {
            p =
                dev.getPortAt(i);

            out(
                "   " +
                p.getName() +
                " type=" +
                p.getType()
            );
        }
    }
    catch (e)
    {
        out(
            "PORT ENUM ERROR: " +
            e.toString()
        );
    }
}


// ============================================================
// FIND NAMED PORT
// ============================================================

function findNamedPort(dev, names)
{
    var i;
    var j;
    var p;
    var current;

    if (!names)
        return "";

    for (
        i = 0;
        i < names.length;
        i++
    )
    {
        try
        {
            p =
                dev.getPort(
                    names[i]
                );

            if (p)
                return p.getName();
        }
        catch (e0)
        {
        }
    }


    try
    {
        for (
            i = 0;
            i < dev.getPortCount();
            i++
        )
        {
            p =
                dev.getPortAt(i);

            current =
                normalize(
                    p.getName()
                );

            for (
                j = 0;
                j < names.length;
                j++
            )
            {
                if (
                    current ==
                    normalize(
                        names[j]
                    )
                )
                {
                    return p.getName();
                }
            }
        }
    }
    catch (e1)
    {
    }

    return "";
}


// ============================================================
// FIND PORT BY TYPE
// ============================================================

function findPortByKind(dev, kind)
{
    var i;
    var p;
    var type;

    try
    {
        for (
            i = 0;
            i < dev.getPortCount();
            i++
        )
        {
            p =
                dev.getPortAt(i);

            type =
                p.getType();


            if (
                kind == "ethernet" &&
                isEthernetType(type)
            )
            {
                return p.getName();
            }


            if (
                kind == "coax" &&
                isCoaxType(type)
            )
            {
                return p.getName();
            }


            if (
                kind == "wireless" &&
                isWirelessType(type)
            )
            {
                return p.getName();
            }
        }
    }
    catch (e)
    {
    }

    return "";
}


// ============================================================
// RESOLVE PORT
// ============================================================

function resolvePort(dev, names, kind)
{
    var portName;

    portName =
        findNamedPort(
            dev,
            names
        );

    if (portName)
        return portName;


    if (kind)
    {
        portName =
            findPortByKind(
                dev,
                kind
            );

        if (portName)
            return portName;
    }

    return "";
}


// ============================================================
// INSTALL MODULE
// ============================================================

function installModule(dev, slot, model, id)
{
    var root;

    try
    {
        dev.setPower(
            false
        );
    }
    catch (e0)
    {
    }


    try
    {
        root =
            dev.getRootModule();


        try
        {
            root.removeModuleAt(
                slot
            );
        }
        catch (e1)
        {
        }


        root.addModuleAt(
            model,
            slot
        );


        out(
            id +
            ": installed " +
            model
        );
    }
    catch (e2)
    {
        out(
            id +
            ": MODULE WARNING: " +
            e2.toString()
        );
    }


    try
    {
        dev.setPower(
            true
        );
    }
    catch (e3)
    {
    }
}


// ============================================================
// CREATE LINK
// ============================================================

function createLink(
    logical,
    link
)
{
    var a;
    var b;

    var devA;
    var devB;

    var portA;
    var portB;

    var resultValue;


    a =
        createdNames[
            link.from
        ];


    b =
        createdNames[
            link.to
        ];


    devA =
        createdObjects[
            link.from
        ];


    devB =
        createdObjects[
            link.to
        ];


    if (!a || !b || !devA || !devB)
    {
        out(
            "LINK ERROR: missing device"
        );

        return false;
    }


    portA =
        resolvePort(
            devA,
            link.fromPort,
            link.fromKind
        );


    portB =
        resolvePort(
            devB,
            link.toPort,
            link.toKind
        );


    if (!portA || !portB)
    {
        out(
            "LINK PORT ERROR: " +
            link.from +
            " -> " +
            link.to
        );


        if (!portA)
        {
            printPorts(
                devA,
                link.from
            );
        }


        if (!portB)
        {
            printPorts(
                devB,
                link.to
            );
        }


        return false;
    }


    try
    {
        resultValue =
            logical.createLink(
                a,
                portA,
                b,
                portB,
                cableType(
                    link.cable
                )
            );


        out(
            "Connected: " +
            link.from +
            ":" +
            portA +
            " <--> " +
            link.to +
            ":" +
            portB
        );


        return true;
    }
    catch (e)
    {
        out(
            "CREATE LINK ERROR: " +
            e.toString()
        );

        return false;
    }
}


// ============================================================
// CLOUD BRIDGE
//
// Cable Provider:
// coax <-> Ethernet
//
// ============================================================

function configureCableProvider(dev)
{
    var coax;
    var ethernet;


    coax =
        findPortByKind(
            dev,
            "coax"
        );


    ethernet =
        findPortByKind(
            dev,
            "ethernet"
        );


    if (!coax || !ethernet)
    {
        out(
            "Cable Provider bridge ports unavailable"
        );

        printPorts(
            dev,
            "Cable-Provider"
        );

        return;
    }


    try
    {
        try
        {
            dev.removeAllPortConnection(
                coax
            );
        }
        catch (e0)
        {
        }


        dev.addPortConnection(
            coax,
            ethernet
        );


        out(
            "Cable Provider bridge: " +
            coax +
            " <-> " +
            ethernet
        );
    }
    catch (e)
    {
        out(
            "Cable Provider bridge warning: " +
            e.toString()
        );
    }
}


// ============================================================
// PROVIDER SERVER
// ============================================================

function configureProviderServer(
    dev,
    cfg
)
{
    var port;

    var mainProcess;
    var dhcp;

    var dns;
    var http;

    var oldPool;


    // --------------------------------------------------------
    // STATIC IP
    // --------------------------------------------------------

    try
    {
        port =
            dev.getPort(
                "FastEthernet0"
            );


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


        out(
            "skillsforall.srv IP = " +
            cfg.ip
        );
    }
    catch (e1)
    {
        out(
            "Provider server IP ERROR: " +
            e1.toString()
        );
    }


    // --------------------------------------------------------
    // DHCP FOR HOME ROUTER WAN
    // --------------------------------------------------------

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


        try
        {
            oldPool =
                dhcp.getPool(
                    cfg.dhcp.pool
                );


            if (oldPool)
            {
                dhcp.removePool(
                    cfg.dhcp.pool
                );
            }
        }
        catch (e2)
        {
        }


        dhcp.addNewPool(
            cfg.dhcp.pool,
            cfg.dhcp.gateway,
            cfg.dhcp.dns,
            cfg.dhcp.startIp,
            cfg.dhcp.mask,
            cfg.dhcp.maxUsers,
            "0.0.0.0",
            "0.0.0.0"
        );


        out(
            "Cable-provider DHCP enabled"
        );
    }
    catch (e3)
    {
        out(
            "Provider DHCP ERROR: " +
            e3.toString()
        );
    }


    // --------------------------------------------------------
    // DNS
    // --------------------------------------------------------

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
        catch (e4)
        {
        }


        dns.addARecordToNameServerDb(
            cfg.dns.name,
            cfg.dns.ip
        );


        out(
            "DNS: " +
            cfg.dns.name +
            " -> " +
            cfg.dns.ip
        );
    }
    catch (e5)
    {
        out(
            "DNS ERROR: " +
            e5.toString()
        );
    }


    // --------------------------------------------------------
    // HTTP
    // --------------------------------------------------------

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
            "<html><body><h1>Skills for All</h1><p>Natsumi home Internet connection is working.</p></body></html>"
        );


        out(
            "skillsforall.srv HTTP enabled"
        );
    }
    catch (e6)
    {
        out(
            "HTTP ERROR: " +
            e6.toString()
        );
    }
}


// ============================================================
// GET HOME ROUTER DHCP PROCESS
// ============================================================

function getHomeDhcp(dev)
{
    var dhcp;
    var mainProcess;

    var i;
    var p;


    try
    {
        dhcp =
            dev.getProcess(
                "DhcpServer"
            );


        if (dhcp)
            return dhcp;
    }
    catch (e0)
    {
    }


    try
    {
        mainProcess =
            dev.getProcess(
                "DhcpServerMain"
            );


        if (!mainProcess)
            return null;


        for (
            i = 0;
            i < dev.getPortCount();
            i++
        )
        {
            p =
                dev.getPortAt(i);


            try
            {
                dhcp =
                    mainProcess.getDhcpServerProcessByPortName(
                        p.getName()
                    );


                if (dhcp)
                    return dhcp;
            }
            catch (e1)
            {
            }
        }
    }
    catch (e2)
    {
    }


    return null;
}


// ============================================================
// GET FIRST DHCP POOL
// ============================================================

function getFirstPool(dhcp)
{
    var pool;

    if (!dhcp)
        return null;


    try
    {
        if (dhcp.getPoolCount() > 0)
        {
            pool =
                dhcp.getPoolAt(
                    0
                );


            if (pool)
                return pool;
        }
    }
    catch (e)
    {
    }


    return null;
}


// ============================================================
// HOME ROUTER WAN DHCP
// ============================================================

function configureRouterWanDhcp(dev)
{
    var portName;
    var port;


    try
    {
        dev.setInternetConnectionType(
            0
        );
    }
    catch (e0)
    {
    }


    portName =
        resolvePort(
            dev,
            [
                "Internet",
                "Internet0"
            ],
            "ethernet"
        );


    if (!portName)
    {
        out(
            "Home Router Internet port not found"
        );

        return;
    }


    try
    {
        port =
            dev.getPort(
                portName
            );


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


        out(
            "Home Router Internet port = DHCP"
        );
    }
    catch (e2)
    {
        out(
            "WAN DHCP ERROR: " +
            e2.toString()
        );
    }
}


// ============================================================
// SET HOME ROUTER DHCP MAX USERS
// ============================================================

function setMaximumUsers(
    dev,
    maximum
)
{
    var dhcp;
    var pool;


    dhcp =
        getHomeDhcp(
            dev
        );


    if (!dhcp)
    {
        out(
            "Home Router DHCP process unavailable"
        );

        return false;
    }


    try
    {
        dhcp.setEnable(
            true
        );
    }
    catch (e0)
    {
    }


    pool =
        getFirstPool(
            dhcp
        );


    if (!pool)
    {
        out(
            "Home Router default DHCP pool unavailable"
        );

        return false;
    }


    try
    {
        pool.setMaxUsers(
            maximum
        );


        return true;
    }
    catch (e1)
    {
        out(
            "Maximum users ERROR: " +
            e1.toString()
        );


        return false;
    }
}


// ============================================================
// HOME ROUTER DNS FOR STANDALONE LAB
// ============================================================

function configureHomeDns(
    dev,
    dnsAddress
)
{
    var dhcp;
    var pool;


    dhcp =
        getHomeDhcp(
            dev
        );


    pool =
        getFirstPool(
            dhcp
        );


    if (!pool)
        return;


    try
    {
        pool.setDnsServerIp(
            dnsAddress
        );


        out(
            "Home DHCP DNS = " +
            dnsAddress
        );
    }
    catch (e)
    {
    }
}


// ============================================================
// HOME ROUTER ADMIN PASSWORD
// ============================================================

function configureAdmin(
    dev,
    username,
    password
)
{
    var http;


    try
    {
        http =
            dev.getProcess(
                "HttpServer"
            );


        if (!http)
            return false;


        http.setUsername(
            username
        );


        http.setPassword(
            password
        );


        http.setEnable(
            true
        );


        return true;
    }
    catch (e)
    {
        out(
            "Router admin ERROR: " +
            e.toString()
        );


        return false;
    }
}


// ============================================================
// HOME ROUTER 2.4 GHz WLAN
//
// authType 4    = WPA2 Personal / WPA2-PSK
// encryptType 4 = AES
//
// ============================================================

function configureWirelessRouter(
    dev,
    cfg
)
{
    var wireless;
    var wirelessPort;
    var wpa;


    try
    {
        wireless =
            dev.getProcess(
                "WirelessServer"
            );


        if (!wireless)
        {
            out(
                "WirelessServer process unavailable"
            );

            return false;
        }


        wirelessPort =
            resolvePort(
                dev,
                [
                    "Wireless0",
                    "Wireless 0",
                    "2.4GHz",
                    "2.4 GHz"
                ],
                "wireless"
            );


        if (wirelessPort)
        {
            try
            {
                wireless.setPort(
                    wirelessPort
                );
            }
            catch (e0)
            {
            }
        }


        // Infrastructure / AP mode
        try
        {
            wireless.setNetworkType(
                3
            );
        }
        catch (e1)
        {
        }


        wireless.setSsid(
            cfg.ssid
        );


        wireless.setAuthenType(
            cfg.authType
        );


        wireless.setEncryptType(
            cfg.encryptType
        );


        try
        {
            wireless.setSsidBrdCastEnabled(
                true
            );
        }
        catch (e2)
        {
        }


        wpa =
            wireless.getWpaProcess();


        if (wpa)
        {
            wpa.setPasswd(
                cfg.passphrase
            );
        }


        try
        {
            wireless.resetAllAssociations();
        }
        catch (e3)
        {
        }


        return true;
    }
    catch (e4)
    {
        out(
            "WIRELESS ROUTER ERROR: " +
            e4.toString()
        );


        return false;
    }
}


// ============================================================
// PC DHCP
// ============================================================

function enablePcDhcp(dev, id)
{
    var i;
    var p;


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
        for (
            i = 0;
            i < dev.getPortCount();
            i++
        )
        {
            p =
                dev.getPortAt(i);


            if (
                isEthernetType(
                    p.getType()
                )
            )
            {
                p.setPower(
                    true
                );


                try
                {
                    p.setDhcpClientFlag(
                        true
                    );
                }
                catch (e1)
                {
                }
            }
        }
    }
    catch (e2)
    {
    }


    out(
        id +
        " DHCP mode enabled"
    );
}


// ============================================================
// LAPTOP WI-FI
// ============================================================

function configureLaptopWireless(
    dev,
    cfg
)
{
    var wireless;
    var portName;
    var port;
    var status;


    try
    {
        wireless =
            dev.getProcess(
                "WirelessClient"
            );


        if (!wireless)
        {
            out(
                "Laptop WirelessClient process unavailable"
            );

            return false;
        }


        portName =
            resolvePort(
                dev,
                [
                    "Wireless0",
                    "Wireless 0"
                ],
                "wireless"
            );


        if (!portName)
        {
            out(
                "Laptop wireless interface unavailable"
            );


            printPorts(
                dev,
                "Laptop"
            );


            return false;
        }


        wireless.setPort(
            portName
        );


        status =
            wireless.setCurrentProfileStringIPs(
                cfg.profile,
                cfg.ssid,
                3,
                "",
                cfg.authType,
                cfg.encryptType,
                "",
                "",
                cfg.passphrase,
                true,
                false,
                "0.0.0.0",
                "0.0.0.0",
                "0.0.0.0",
                "0.0.0.0"
            );


        port =
            dev.getPort(
                portName
            );


        port.setPower(
            true
        );


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
            port.setDhcpClientFlag(
                true
            );
        }
        catch (e1)
        {
        }


        try
        {
            wireless.resetAllAssociations();
        }
        catch (e2)
        {
        }


        return status;
    }
    catch (e3)
    {
        out(
            "LAPTOP WIRELESS ERROR: " +
            e3.toString()
        );


        return false;
    }
}


// ============================================================
// MAIN
// ============================================================

function main()
{
    var app;
    var file;
    var workspace;
    var logical;

    var text;
    var topology;

    var i;

    var item;
    var name;
    var dev;

    var router;
    var office;
    var bedroom;
    var laptop;
    var provider;
    var server;
    var tv;

    var routerCfg;
    var laptopCfg;

    var ok;


    banner(
        "NATSUMI - HOME WIRELESS ROUTER LAB"
    );


    try
    {
        // ====================================================
        // LOAD ACTIVE PACKET TRACER FILE
        // ====================================================

        app =
            ipc.appWindow();


        file =
            app.getActiveFile();


        if (!file)
        {
            out(
                "ERROR: no active file"
            );

            return;
        }


        workspace =
            file.getWorkspace();


        logical =
            workspace.getLogicalWorkspace();


        // ====================================================
        // LOAD topology.txt
        // ====================================================

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


        try
        {
            topology =
                JSON.parse(
                    text
                );
        }
        catch (jsonError)
        {
            out(
                "JSON ERROR: " +
                jsonError.toString()
            );

            return;
        }


        // ====================================================
        // CREATE DEVICES
        // ====================================================

        banner(
            "BUILD - CREATE DEVICES"
        );


        for (
            i = 0;
            i < topology.devices.length;
            i++
        )
        {
            item =
                topology.devices[i];


            try
            {
                name =
                    logical.addDevice(
                        item.type,
                        item.model,
                        item.x,
                        item.y
                    );
            }
            catch (createError)
            {
                name =
                    "";
            }


            if (!name)
            {
                out(
                    "FAILED TO CREATE: " +
                    item.id +
                    " model=" +
                    item.model
                );

                continue;
            }


            createdNames[
                item.id
            ] =
                name;


            dev =
                ipc.network().getDevice(
                    name
                );


            createdObjects[
                item.id
            ] =
                dev;


            out(
                "Created " +
                item.id +
                " -> " +
                name
            );
        }


        // ====================================================
        // INSTALL MODULES
        // ====================================================

        banner(
            "BUILD - INSTALL MODULES"
        );


        provider =
            createdObjects[
                "Cable-Provider"
            ];


        if (provider)
        {
            installModule(
                provider,
                0,
                "PT-CLOUD-NM-1CX",
                "Cable-Provider"
            );


            installModule(
                provider,
                1,
                "PT-CLOUD-NM-1CFE",
                "Cable-Provider"
            );
        }


        dev =
            createdObjects[
                "Cable-Modem"
            ];


        if (dev)
        {
            if (
                !findPortByKind(
                    dev,
                    "ethernet"
                )
            )
            {
                installModule(
                    dev,
                    0,
                    "PT-MODEM-NM-1CFE",
                    "Cable-Modem"
                );
            }
        }


        laptop =
            createdObjects[
                "Laptop"
            ];


        if (laptop)
        {
            if (
                !findPortByKind(
                    laptop,
                    "wireless"
                )
            )
            {
                installModule(
                    laptop,
                    0,
                    "WPC300N",
                    "Laptop"
                );
            }
        }


        // ====================================================
        // SUPPORT NETWORK
        // ====================================================

        banner(
            "SUPPORT INFRASTRUCTURE"
        );


        for (
            i = 0;
            i < topology.supportLinks.length;
            i++
        )
        {
            createLink(
                logical,
                topology.supportLinks[i]
            );
        }


        if (provider)
        {
            configureCableProvider(
                provider
            );
        }


        server =
            createdObjects[
                "skillsforall.srv"
            ];


        if (server)
        {
            for (
                i = 0;
                i < topology.devices.length;
                i++
            )
            {
                item =
                    topology.devices[i];


                if (
                    item.id ==
                    "skillsforall.srv"
                )
                {
                    configureProviderServer(
                        server,
                        item.server
                    );
                }
            }
        }


        // ====================================================
        // PART 1
        // CONNECT DEVICES IN THE SAME ORDER AS THE ACTIVITY
        // ====================================================

        banner(
            "PART 1 - CONNECT THE DEVICES"
        );


        for (
            i = 0;
            i < topology.links.length;
            i++
        )
        {
            ok =
                createLink(
                    logical,
                    topology.links[i]
                );


            result(
                topology.links[i].step,
                ok ? "DONE" : "FAILED",
                topology.links[i].description
            );


            // After splitter -> TV link:
            // source activity asks us to turn TV on.

            if (i == 1)
            {
                tv =
                    createdObjects[
                        "TV"
                    ];


                if (tv)
                {
                    try
                    {
                        tv.setPower(
                            true
                        );


                        result(
                            "Part 1 / Step 1 f",
                            "DONE",
                            "TV Status = ON"
                        );
                    }
                    catch (tvError)
                    {
                        result(
                            "Part 1 / Step 1 f",
                            "VERIFY",
                            "Open TV and set Status to ON"
                        );
                    }
                }
            }
        }


        // ====================================================
        // RENAME AFTER CABLING
        // ====================================================

        for (
            i = 0;
            i < topology.devices.length;
            i++
        )
        {
            item =
                topology.devices[i];


            dev =
                createdObjects[
                    item.id
                ];


            if (!dev)
                continue;


            try
            {
                dev.setName(
                    item.id
                );
            }
            catch (e0)
            {
            }
        }


        // ====================================================
        // FIND MAIN DEVICES / SETTINGS
        // ====================================================

        router =
            createdObjects[
                "Home-Wireless-Router"
            ];


        office =
            createdObjects[
                "Office-PC"
            ];


        bedroom =
            createdObjects[
                "Bedroom-PC"
            ];


        laptop =
            createdObjects[
                "Laptop"
            ];


        routerCfg =
            null;


        laptopCfg =
            null;


        for (
            i = 0;
            i < topology.devices.length;
            i++
        )
        {
            item =
                topology.devices[i];


            if (
                item.id ==
                "Home-Wireless-Router"
            )
            {
                routerCfg =
                    item.router;
            }


            if (
                item.id ==
                "Laptop"
            )
            {
                laptopCfg =
                    item.wireless;
            }
        }


        // ====================================================
        // HOME ROUTER WAN
        // ====================================================

        if (router)
        {
            configureRouterWanDhcp(
                router
            );


            configureHomeDns(
                router,
                "209.165.200.10"
            );
        }


        // ====================================================
        // PART 2
        // STEP 1 - OFFICE PC DHCP / ACCESS ROUTER GUI
        // ====================================================

        banner(
            "PART 2 - CONFIGURE THE WIRELESS ROUTER"
        );


        if (office)
        {
            enablePcDhcp(
                office,
                "Office-PC"
            );


            result(
                "Part 2 / Step 1 b",
                "DONE",
                "Office PC set to DHCP"
            );
        }


        result(
            "Part 2 / Step 1 c",
            "VERIFY",
            "Office PC IPv4 address should begin with 192. Use Fast Forward Time if needed."
        );


        result(
            "Part 2 / Step 1 d",
            "VERIFY",
            "Record the Office PC default gateway. It is the Home Wireless Router address."
        );


        result(
            "Part 2 / Step 1 e",
            "VERIFY",
            "Office PC > Desktop > Web Browser > browse to the default gateway."
        );


        result(
            "Part 2 / Step 1 f",
            "VERIFY",
            "Initial Home Router GUI login is admin / admin."
        );


        // ====================================================
        // PART 2
        // STEP 2 - MAXIMUM DHCP USERS
        // ====================================================

        if (
            router &&
            routerCfg
        )
        {
            ok =
                setMaximumUsers(
                    router,
                    routerCfg.maxUsers
                );


            result(
                "Part 2 / Step 2 a",
                ok ? "DONE" : "VERIFY",
                "Maximum Number of DHCP Users = 10"
            );


            // =================================================
            // CHANGE ADMIN PASSWORD
            // =================================================

            ok =
                configureAdmin(
                    router,
                    routerCfg.adminUsername,
                    routerCfg.adminPassword
                );


            result(
                "Part 2 / Step 2 b",
                ok ? "DONE" : "VERIFY",
                "Router password changed to MyPassword1!"
            );


            result(
                "Part 2 / Step 2 b",
                "INFO",
                "New GUI login: admin / MyPassword1!"
            );
        }


        // ====================================================
        // PART 2
        // STEP 3 - 2.4 GHz WLAN
        // ====================================================

        if (
            router &&
            routerCfg
        )
        {
            ok =
                configureWirelessRouter(
                    router,
                    routerCfg.wireless
                );


            result(
                "Part 2 / Step 3 b",
                ok ? "DONE" : "VERIFY",
                "2.4 GHz wireless network enabled"
            );


            result(
                "Part 2 / Step 3 c",
                ok ? "DONE" : "VERIFY",
                "Network Name SSID = MyHome"
            );


            result(
                "Part 2 / Step 3 e",
                ok ? "DONE" : "VERIFY",
                "Wireless security = WPA2 Personal"
            );


            result(
                "Part 2 / Step 3 f",
                ok ? "DONE" : "VERIFY",
                "Passphrase = MyPassPhrase1!"
            );
        }


        // ====================================================
        // PART 3
        // ====================================================

        banner(
            "PART 3 - IP ADDRESSING AND CONNECTIVITY"
        );


        // ====================================================
        // PART 3 STEP 1 - LAPTOP WLAN
        // ====================================================

        if (
            laptop &&
            laptopCfg
        )
        {
            ok =
                configureLaptopWireless(
                    laptop,
                    laptopCfg
                );


            result(
                "Part 3 / Step 1 c-d",
                ok ? "DONE" : "VERIFY",
                "Laptop connects to MyHome using MyPassPhrase1!"
            );


            result(
                "Part 3 / Step 1 e",
                "VERIFY",
                "Laptop > PC Wireless > Link Information should show successful connection."
            );


            result(
                "Part 3 / Step 1 f",
                "VERIFY",
                "Laptop IPv4 address should begin with 192."
            );


            result(
                "Part 3 / Step 1 g",
                "TEST",
                "Laptop Web Browser -> skillsforall.srv"
            );
        }


        // ====================================================
        // PART 3 STEP 2 - OFFICE PC INTERNET
        // ====================================================

        result(
            "Part 3 / Step 2",
            "TEST",
            "Office PC Web Browser -> skillsforall.srv"
        );


        // ====================================================
        // PART 3 STEP 3 - BEDROOM PC DHCP
        //
        // IMPORTANT:
        // This is deliberately done here because the original
        // activity does not configure Bedroom PC DHCP until
        // Part 3 Step 3.
        // ====================================================

        if (bedroom)
        {
            enablePcDhcp(
                bedroom,
                "Bedroom-PC"
            );


            result(
                "Part 3 / Step 3 a",
                "DONE",
                "Bedroom PC set to DHCP"
            );


            result(
                "Part 3 / Step 3 a",
                "VERIFY",
                "Bedroom PC IPv4 address should begin with 192."
            );


            result(
                "Part 3 / Step 3 b",
                "TEST",
                "Bedroom PC Web Browser -> skillsforall.srv"
            );
        }


        // ====================================================
        // COMPLETE
        // ====================================================

        banner(
            "PROJECT COMPLETE"
        );


        out(
            "Final success criteria:"
        );


        out(
            "1. Laptop is connected to MyHome."
        );


        out(
            "2. Laptop can open skillsforall.srv."
        );


        out(
            "3. Office PC can open skillsforall.srv."
        );


        out(
            "4. Bedroom PC receives DHCP addressing."
        );


        out(
            "5. Bedroom PC can open skillsforall.srv."
        );


        out("");


        out(
            "If DHCP or Wi-Fi has not converged yet:"
        );


        out(
            "Use Fast Forward Time."
        );
    }
    catch (e)
    {
        out(
            "FATAL ERROR: " +
            e.toString()
        );
    }
}


// ============================================================
// CLEANUP
// ============================================================

function cleanUp()
{
    out(
        "Natsumi home wireless project stopped."
    );
}