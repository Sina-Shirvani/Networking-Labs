/*

STAGE 4

Configures:
- WAN Core 1
- WAN Core 2
- DC Distribution 1
- DC Distribution 2
- DC Access 1
- DC Access 2
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
            "NO PLAN: " +
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

    var ids;
    var i;
    var id;

    banner(
        "NEXACORE STAGE 4 - WAN / DATA CENTER"
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
        "NXC-WAN-CORE-SW01",
        "NXC-WAN-CORE-SW02",

        "NXC-DC-DIST-SW01",
        "NXC-DC-DIST-SW02",

        "NXC-DC-ACC-SW01",
        "NXC-DC-ACC-SW02"
    ];

    for (i = 0; i < ids.length; i++)
    {
        id =
            ids[i];

        applyPlan(
            getDevice(id),
            topology.cliPlans[id],
            id
        );
    }

    banner(
        "STAGE 4 COMPLETE"
    );

    out(
        "VERIFY:"
    );

    out(
        "show ip ospf neighbor"
    );

    out(
        "show ip route"
    );

    out(
        "show standby brief"
    );

    out(
        "show etherchannel summary"
    );

    out(
        "show interfaces trunk"
    );

    out(
        "SAVE BEFORE STAGE 5."
    );
}

function cleanUp()
{
    out(
        "Stage 4 stopped."
    );
}