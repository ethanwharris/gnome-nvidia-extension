/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

'use strict';

import * as Formatter from './formatter.js';
import {Property} from './property.js';
import * as GIcons from './gIcons.js';

export class UtilisationProperty extends Property {
    constructor(gpuCount, processor) {
        super(processor, 'Utilisation', 'utilization.gpu,', GIcons.get(GIcons.Icon.Card),
            new Formatter.PercentFormatter('UtilisationFormatter'), gpuCount);
    }
}

export class PowerProperty extends Property {
    constructor(gpuCount, processor) {
        super(processor, 'Power Usage (W)', 'power.draw,', GIcons.get(GIcons.Icon.Power),
            new Formatter.PowerFormatter(), gpuCount);
    }
}

export class TemperatureProperty extends Property {
    constructor(gpuCount, processor) {
        super(processor, 'Temperature', 'temperature.gpu,', GIcons.get(GIcons.Icon.Temp),
            new Formatter.TempFormatter(Formatter.CENTIGRADE), gpuCount);
    }

    setUnit(unit) {
        this._formatter.setUnit(unit);
    }
}

export class MemoryProperty extends Property {
    constructor(gpuCount, processor) {
        super(processor, 'Memory Usage', 'memory.used,memory.total,', GIcons.get(GIcons.Icon.RAM),
            new Formatter.MemoryFormatter('MemoryFormatter'), gpuCount);
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
        super(processor, 'Fan Speed', 'fan.speed,', GIcons.get(GIcons.Icon.Fan),
            new Formatter.PercentFormatter('FanFormatter'), gpuCount);
    }
}
