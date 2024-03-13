/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

'use strict';

export const CENTIGRADE = 0;
export const FAHRENHEIT = 1;

class _Formatter {
    constructor(name) {
        this._name = name;
    }

    format(values) {
        for (let i = 0; i < values.length; i++) {
            let stringValue = values[i].replace(/[^0-9.]/g, '');
            values[i] = parseFloat(stringValue);
            if (stringValue === '' || isNaN(values[i]) || !isFinite(stringValue))
                return 'ERR';
        }
        return this._format(values);
    }

    _format(values) {
        return values;
    }
}

export class PercentFormatter extends _Formatter {
    // implicitly use super constructor

    _format(values) {
        return `${values[0]}%`;
    }
}

export class PowerFormatter extends _Formatter {
    constructor() {
        super('PowerFormatter');
    }

    _format(values) {
        return `${Math.floor(values[0])}W`;
    }
}

export class MemoryFormatter extends _Formatter {
    constructor() {
        super('MemoryFormatter');
    }

    _format(values) {
        let mem_usage = Math.floor((values[0] / values[1]) * 100);
        return `${mem_usage}%`;
    }
}

export class TempFormatter extends _Formatter {
    constructor(unit) {
        super('TempFormatter');
        this.currentUnit = unit;
    }

    setUnit(unit) {
        this.currentUnit = unit;
    }

    _format(value) {
        if (this.currentUnit === CENTIGRADE)
            return `${value}\xB0C`;
        else if (this.currentUnit === FAHRENHEIT)
            return `${Math.floor(value * 9 / 5 + 32)}\xB0F`;
    }
}
