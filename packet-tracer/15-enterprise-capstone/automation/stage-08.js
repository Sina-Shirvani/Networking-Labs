

var SSH_DEVICE_INDEX = 0;

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

function getDeviceList()
{
    return [
        "NXC-HQ-CORE-SW01",
        "NXC-HQ-CORE-SW02",

        "NXC-HQ-DIST-SW01",
        "NXC-HQ-DIST-SW02",

        "NXC-HQ-ACC-SW01",
        "NXC-HQ-ACC-SW02",
        "NXC-HQ-ACC-SW03",
        "NXC-HQ-ACC-SW04",

        "NXC-WAN-CORE-SW01",
        "NXC-WAN-CORE-SW02",

        "NXC-EDGE-RTR01",
        "NXC-EDGE-RTR02",

        "NXC-DC-DIST-SW01",
        "NXC-DC-DIST-SW02",

        "NXC-DC-ACC-SW01",
        "NXC-DC-ACC-SW02",

        "NXC-BR1-RTR01",
        "NXC-BR1-SW01",

        "NXC-BR2-RTR01",
        "NXC-BR2-SW01",

        "NXC-BR3-RTR01",
        "NXC-BR3-SW01",

        "NXC-RO1-RTR01",
        "NXC-RO1-SW01"
    ];
}

function main()
{
    var ids;
    var id;
    var dev;

    banner(
        "NEXACORE STAGE 8 - SSH RSA"
    );

    ids =
        getDeviceList();

    if (
        SSH_DEVICE_INDEX < 0 ||
        SSH_DEVICE_INDEX >= ids.length
    )
    {
        out(
            "INDEX OUT OF RANGE"
        );

        out(
            "Valid values: 0 through " +
            (ids.length - 1)
        );

        return;
    }

    id =
        ids[
            SSH_DEVICE_INDEX
        ];

    dev =
        getDevice(
            id
        );

    if (!dev)
    {
        out(
            "DEVICE NOT FOUND: " +
            id
        );

        return;
    }

    out(
        "Generating RSA key for:"
    );

    out(
        id
    );

    try
    {
        dev.enterCommand(
            "crypto key generate rsa general-keys modulus 1024",
            "global"
        );

        out(
            "RSA command sent successfully."
        );
    }
    catch (e)
    {
        out(
            "RSA ERROR: " +
            e.toString()
        );

        return;
    }

    out("");
    out(
        "Verify on the device:"
    );

    out(
        "show ip ssh"
    );

    out("");
    out(
        "NEXT INDEX = " +
        (SSH_DEVICE_INDEX + 1)
    );

    out(
        "SAVE THE .PKT AFTER EACH FEW DEVICES."
    );
}

function cleanUp()
{
    out(
        "Stage 8 stopped."
    );
}