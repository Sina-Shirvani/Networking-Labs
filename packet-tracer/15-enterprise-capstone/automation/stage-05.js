/*

STAGE 5

Configures:
BR1
BR2
BR3
RO1

Includes creation of router subinterfaces.
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

function createSubInterfaces(dev, id, numbers)
{
    var i;

    if (!dev)
    {
        out(
            "MISSING ROUTER: " +
            id
        );

        return;
    }

    for (i = 0; i < numbers.length; i++)
    {
        try
        {
            dev.addSubInt(
                "GigabitEthernet0/0",
                numbers[i]
            );

            out(
                id +
                ": created Gi0/0." +
                numbers[i]
            );
        }
        catch (e)
        {
            out(
                id +
                ": Gi0/0." +
                numbers[i] +
                " already exists or unavailable"
            );
        }
    }
}

function deferred(cmd)
{
    if (!cmd)
        return false;

    if (
        cmd.indexOf(
            "crypto key generate rsa"
        ) == 0
    )
    {
        return true;
    }

    return false;
}

function applyPlan(dev, plan, id)
{
    var i;
    var item;

    if (!dev)
    {
        out(
            "MISSING DEVICE: " +
            id
        );

        return;
    }

    if (!plan)
    {
        out(
            "NO CLI PLAN: " +
            id
        );

        return;
    }

    out("");
    out(
        "CONFIGURING " +
        id
    );

    for (i = 0; i < plan.length; i++)
    {
        item =
            plan[i];

        if (
            deferred(
                item.cmd
            )
        )
        {
            continue;
        }

        try
        {
            dev.enterCommand(
                item.cmd,
                item.ctx
            );
        }
        catch (e)
        {
            out(
                "CLI WARNING [" +
                id +
                "] " +
                item.cmd
            );
        }
    }
}

function main()
{
    var file;
    var text;
    var topology;

    var routers;
    var switches;

    var i;
    var id;
    var dev;

    banner(
        "NEXACORE STAGE 5 - BRANCHES"
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
        "CREATE BRANCH SUBINTERFACES"
    );

    createSubInterfaces(
        getDevice("NXC-BR1-RTR01"),
        "NXC-BR1-RTR01",
        [
            10,
            50,
            70,
            90,
            100,
            110,
            998
        ]
    );

    createSubInterfaces(
        getDevice("NXC-BR2-RTR01"),
        "NXC-BR2-RTR01",
        [
            10,
            30,
            80,
            90,
            100,
            110,
            998
        ]
    );

    createSubInterfaces(
        getDevice("NXC-BR3-RTR01"),
        "NXC-BR3-RTR01",
        [
            10,
            50,
            75,
            90,
            100,
            110,
            998
        ]
    );

    createSubInterfaces(
        getDevice("NXC-RO1-RTR01"),
        "NXC-RO1-RTR01",
        [
            10,
            80,
            100,
            110,
            998
        ]
    );

    routers = [
        "NXC-BR1-RTR01",
        "NXC-BR2-RTR01",
        "NXC-BR3-RTR01",
        "NXC-RO1-RTR01"
    ];

    switches = [
        "NXC-BR1-SW01",
        "NXC-BR2-SW01",
        "NXC-BR3-SW01",
        "NXC-RO1-SW01"
    ];

    banner(
        "CONFIGURE BRANCH ROUTERS"
    );

    for (i = 0; i < routers.length; i++)
    {
        id =
            routers[i];

        dev =
            getDevice(
                id
            );

        applyPlan(
            dev,
            topology.cliPlans[id],
            id
        );
    }

    banner(
        "CONFIGURE BRANCH SWITCHES"
    );

    for (i = 0; i < switches.length; i++)
    {
        id =
            switches[i];

        applyPlan(
            getDevice(id),
            topology.cliPlans[id],
            id
        );
    }

    banner(
        "STAGE 5 COMPLETE"
    );

    out(
        "VERIFY BRANCH ROUTERS:"
    );

    out(
        "show ip interface brief"
    );

    out(
        "show ip ospf neighbor"
    );

    out(
        "show ip route"
    );

    out(
        "SAVE BEFORE STAGE 6."
    );
}

function cleanUp()
{
    out(
        "Stage 5 stopped."
    );
}