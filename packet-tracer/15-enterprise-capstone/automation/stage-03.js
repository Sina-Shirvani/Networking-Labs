/*

STAGE 3

Configures:
- HQ Distribution 1
- HQ Distribution 2
- HQ Access 1-4
- VLANs
- SVIs
- HSRP
- Rapid-PVST
- EtherChannel
- Access security
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
        "NEXACORE STAGE 3 - HQ DISTRIBUTION / ACCESS"
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
        "NXC-HQ-DIST-SW01",
        "NXC-HQ-DIST-SW02",

        "NXC-HQ-ACC-SW01",
        "NXC-HQ-ACC-SW02",
        "NXC-HQ-ACC-SW03",
        "NXC-HQ-ACC-SW04"
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
        "STAGE 3 COMPLETE"
    );

    out(
        "VERIFY:"
    );

    out(
        "show vlan brief"
    );

    out(
        "show interfaces trunk"
    );

    out(
        "show etherchannel summary"
    );

    out(
        "show spanning-tree"
    );

    out(
        "show standby brief"
    );

    out(
        "SAVE BEFORE STAGE 4."
    );
}

function cleanUp()
{
    out(
        "Stage 3 stopped."
    );
}