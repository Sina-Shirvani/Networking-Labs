/*

STAGE 2

Configures:
- HQ Core 1
- HQ Core 2
- Edge Router 1
- Edge Router 2
- ISP Router 1
- ISP Router 2
- Internet switch

RSA key generation is deferred to Stage 8.
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

function isDeferredCommand(cmd)
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
            "MISSING CLI PLAN: " +
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
            isDeferredCommand(
                item.cmd
            )
        )
        {
            out(
                "DEFERRED: " +
                item.cmd
            );

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
                "CLI WARNING: " +
                item.cmd +
                " : " +
                e.toString()
            );
        }
    }
}

function main()
{
    var file;
    var text;
    var topology;
    var ids;

    var i;
    var id;
    var dev;

    banner(
        "NEXACORE STAGE 2 - HQ CORE / EDGE / ISP"
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

    ids = [
        "NXC-HQ-CORE-SW01",
        "NXC-HQ-CORE-SW02",

        "NXC-EDGE-RTR01",
        "NXC-EDGE-RTR02",

        "NXC-ISP-RTR01",
        "NXC-ISP-RTR02",

        "NXC-INET-SW01"
    ];

    for (i = 0; i < ids.length; i++)
    {
        id =
            ids[i];

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
        "STAGE 2 COMPLETE"
    );

    out(
        "Verify:"
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
        "SAVE THE .PKT BEFORE STAGE 3."
    );
}

function cleanUp()
{
    out(
        "Stage 2 stopped."
    );
}