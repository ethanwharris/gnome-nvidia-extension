/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

/* exported UtilisationProperty TemperatureProperty MemoryProperty FanProperty */
'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Formatter = Me.imports.formatter;
const Property = Me.imports.property;
const GIcons = Me.imports.gIcons;

var UtilisationProperty = class extends Property.Property {
    constructor(gpuCount, processor) {
        super(processor, 'Utilisation', '-q GPUUtilization ', GIcons.Icon.Card.get(),
            new Formatter.PercentFormatter('UtilisationFormatter'), gpuCount);
    }

    parse(lines) {
        for (let i = 0; i < this._gpuCount; i++)
            lines[i] = lines[i].substring(9, 11);


        return super.parse(lines);
    }
};

var TemperatureProperty = class extends Property.Property {
    constructor(gpuCount, processor) {
        super(processor, 'Temperature', '-q [GPU]/GPUCoreTemp ', GIcons.Icon.Temp.get(),
            new Formatter.TempFormatter(Formatter.CENTIGRADE), gpuCount);
    }

    setUnit(unit) {
        this._formatter.setUnit(unit);
    }
};

var MemoryProperty = class extends Property.Property {
    constructor(gpuCount, processor) {
        super(processor, 'Memory Usage', '-q UsedDedicatedGPUMemory -q TotalDedicatedGPUMemory ', GIcons.Icon.RAM.get(),
            new Formatter.MemoryFormatter(), gpuCount);
    }

    parse(lines) {
        let values = [];
        let used_memory = [];

        for (let i = 0; i < this._gpuCount; i++)
            used_memory[i] = lines.shift();


        for (let i = 0; i < this._gpuCount; i++) {
            let total_memory = lines.shift();

            values = values.concat(this._formatter.format([used_memory[i], total_memory]));
        }

        return values;
    }
};

var FanProperty = class extends Property.Property {
    constructor(gpuCount, processor) {
        super(processor, 'Fan Speed', '-q GPUCurrentFanSpeed ', GIcons.Icon.Fan.get(),
            new Formatter.PercentFormatter('FanFormatter'), gpuCount);
    }

    // NOTE: to check logs, use `journalctl` and `journalctl | grep -e "nvidia gnome extension"`
    //       (the former for errors, latter for expected output)
    parse(lines) {
        let values = [];

        // Sanity check: How many times are we going to loop
        log(`[nvidia gnome extension]: gpu #: \`${this._gpuCount}\``);

        for (let i = 0; i < this._gpuCount; i++) {
            let currentValue = lines.shift();

            // Sanity check: Output current value
            log(`[nvidia gnome extension]: fan query output: \`${currentValue}\``);

            // TEST: used for ensuring the new value works
            // values = values.concat('N/A');

            // NOTE: this may change... could check for "ERROR" prefix instead to be more stable?
            // TODO: check nvidia-smi equivalent message
            if (currentValue === 'ERROR: The requested operation is not available on target device')
                values = values.concat('N/A');
            else
                values = values.concat(this._formatter.format([currentValue]));
        }

        // Sanity check: Will not be present in logs if this._formatter.format(...) fails
        log('[nvidia gnome extension]: done! returning values..');

        return values;
    }
};
