/* This file is part of Nvidia Util Gnome Extension.

Nvidia Util Gnome Extension is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Nvidia Util Gnome Extension is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Nvidia Util Gnome Extension.  If not, see <http://www.gnu.org/licenses/>.*/

/* exported CENTIGRADE FAHRENHEIT PercentFormatter PowerFormatter MemoryFormatter TempFormatter */
'use strict';

var CENTIGRADE = 0;
var FAHRENHEIT = 1;

class Formatter {
    // Abstract: true,
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

var PercentFormatter = class extends Formatter {
    // implicitly use super constructor
    // constructor(name) {
    //     super(name);
    // }

    _format(values) {
        return `${values[0]}%`;
    }
};

var PowerFormatter = class extends Formatter {
    constructor() {
        super('PowerFormatter');
    }

    _format(values) {
        return `${Math.floor(values[0])}W`;
    }
};

var MemoryFormatter = class extends Formatter {
    constructor() {
        super('MemoryFormatter');
    }

    _format(values) {
        let mem_usage = Math.floor((values[0] / values[1]) * 100);
        return `${mem_usage}%`;
    }
};

var TempFormatter = class extends Formatter {
    // currentUnit: 0,
    constructor(unit) {
        super('TempFormatter');
        this.currentUnit = unit;
    }

    setUnit(unit) {
        this.currentUnit = unit;
    }

    _format(value) {
        if (this.currentUnit === CENTIGRADE)
            return this._formatCentigrade(value);
        else if (this.currentUnit === FAHRENHEIT)
            return this._formatFehrenheit(value);
    }

    _formatCentigrade(value) {
        return `${value}\xB0C`;
    }

    _formatFehrenheit(value) {
        return `${Math.floor(value * 9 / 5 + 32)}\xB0C`;
    }
};
