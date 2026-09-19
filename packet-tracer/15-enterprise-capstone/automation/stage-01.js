/*

STAGE 1
Create devices, create physical links, rename devices.

RUN ONLY ON A BLANK .PKT FILE.
*/

var createdNames = {};
var createdObjects = {};
var failures = [];

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

function cableType(name)
{
    if (name == "straight")
        return 8100;

    if (name == "crossover")
        return 8101;

    return 8107;
}

function addDeviceWithFallback(logical, item)
{
    var i;
    var j;
    var name;

    for (i = 0; i < item.typeCandidates.length; i++)
    {
        for (j = 0; j < item.modelCandidates.length; j++)
        {
            try
            {
                name = logical.addDevice(
                    item.typeCandidates[i],
                    item.modelCandidates[j],
                    item.x,
                    item.y
                );

                if (name)
                {
                    out(
                        "CREATED " +
                        item.id +
                        " -> " +
                        name
                    );

                    return name;
                }
            }
            catch (e)
            {
            }
        }
    }

    if (item.optional == true)
    {
        out(
            "OPTIONAL DEVICE NOT CREATED: " +
            item.id
        );

        return "";
    }

    out(
        "FAILED TO CREATE: " +
        item.id
    );

    failures.push(
        item.id
    );

    return "";
}

function prepareCisco(dev, id)
{
    try
    {
        if (dev.isBooting())
        {
            out(
                id +
                ": skipping boot"
            );

            dev.skipBoot();
        }
    }
    catch (e)
    {
    }
}

function createLink(logical, link)
{
    var a;
    var b;
    var result;

    a = createdNames[link.a];
    b = createdNames[link.b];

    if (!a || !b)
    {
        out(
            "LINK SKIPPED: " +
            link.a +
            " -> " +
            link.b
        );

        return false;
    }

    try
    {
        result = logical.createLink(
            a,
            link.aPort,
            b,
            link.bPort,
            cableType(link.cable)
        );

        out(
            "LINK " +
            link.a +
            ":" +
            link.aPort +
            " <-> " +
            link.b +
            ":" +
            link.bPort +
            " result=" +
            result
        );

        return true;
    }
    catch (e)
    {
        out(
            "LINK ERROR: " +
            link.a +
            " -> " +
            link.b +
            " : " +
            e.toString()
        );

        return false;
    }
}

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

    banner(
        "NEXACORE STAGE 1 - DEVICES AND CABLING"
    );

    app = ipc.appWindow();
    file = app.getActiveFile();

    if (!file)
    {
        out(
            "ERROR: no active Packet Tracer file"
        );

        return;
    }

    workspace =
        file.getWorkspace();

    logical =
        workspace.getLogicalWorkspace();

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
    catch (e)
    {
        out(
            "JSON ERROR: " +
            e.toString()
        );

        return;
    }

    banner(
        "CREATE DEVICES"
    );

    for (i = 0; i < topology.devices.length; i++)
    {
        item =
            topology.devices[i];

        name =
            addDeviceWithFallback(
                logical,
                item
            );

        if (!name)
            continue;

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

        if (item.cisco == true)
        {
            prepareCisco(
                dev,
                item.id
            );
        }
    }

    banner(
        "CREATE LINKS"
    );

    for (i = 0; i < topology.links.length; i++)
    {
        createLink(
            logical,
            topology.links[i]
        );
    }

    banner(
        "RENAME DEVICES"
    );

    for (i = 0; i < topology.devices.length; i++)
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

        if (item.cisco == true)
        {
            try
            {
                dev.setHostName(
                    item.id
                );
            }
            catch (e1)
            {
            }
        }
    }

    banner(
        "STAGE 1 COMPLETE"
    );

    out(
        "SAVE THE .PKT FILE NOW."
    );

    out(
        "Then replace this script with Stage 2."
    );
}

function cleanUp()
{
    out(
        "Stage 1 stopped."
    );
}