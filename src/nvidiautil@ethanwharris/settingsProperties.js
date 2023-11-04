/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

'use strict';

import * as Formatter from './formatter.js';
import {Property} from './property.js';
import * as GIcons from './gIcons.js';

export class UtilisationProperty extends Property {
    constructor(gpuCount, processor) {
        super(processor, 'Utilisation', '-q GPUUtilization ', GIcons.Icon.Card.get(),
            new Formatter.PercentFormatter('UtilisationFormatter'), gpuCount);
    }

    parse(lines) {
        for (let i = 0; i < this._gpuCount; i++)
            lines[i] = lines[i].substring(9, 11);


        return super.parse(lines);
    }
}

export class TemperatureProperty extends Property {
    constructor(gpuCount, processor) {
        super(processor, 'Temperature', '-q [GPU]/GPUCoreTemp ', GIcons.Icon.Temp.get(),
            new Formatter.TempFormatter(Formatter.CENTIGRADE), gpuCount);
    }

    setUnit(unit) {
        this._formatter.setUnit(unit);
    }
}

export class MemoryProperty extends Property {
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
}

export class FanProperty extends Property {
    constructor(gpuCount, processor) {
        super(processor, 'Fan Speed', '-q GPUCurrentFanSpeed ', GIcons.Icon.Fan.get(),
            new Formatter.PercentFormatter('FanFormatter'), gpuCount);
    }
}
