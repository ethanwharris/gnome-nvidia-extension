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

'use strict';

const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Subprocess = Me.imports.subprocess;

var NVIDIA_SETTINGS = 0;
var NVIDIA_SMI = 1;
var OPTIMUS = 2;

/*
 * Utility function to perform one function and then another
 */
function andThen(first, second) {
    return function (lines) {
        first(lines);
        return second(lines);
    };
}

/* const class */
var Processor = class {
    // Abstract: true,
    constructor(name, baseCall, tailCall) {
        this._name = name;
        this._baseCall = baseCall;
        this._tailCall = tailCall;
        this._call = this._baseCall;

        this._parseFunction = function (lines) {

        };
    }

    parse(output) {
    // Do Nothing
    }

    process() {
        let call = this._call + this._tailCall;
        Subprocess.execCommunicate(call.split(' '))
      .then(output => this.parse(output)).catch(e => {
          let title = `Execution of ${call} failed:`;
          Main.notifyError(title, e.message);
      });
    }

    addProperty(parseFunction, callExtension) {
        this._call += callExtension;
        this._parseFunction = andThen(this._parseFunction, parseFunction);
    }

    getName() {
        return this._name;
    }
};

var NvidiaSettingsProcessor = class extends Processor {
    constructor() {
        super('nvidia-settings', 'nvidia-settings ', '-t');
    }

    parse(output) {
        this._parseFunction(output.split('\n'));
    }
};

var OptimusSettingsProcessor = class extends Processor {
    constructor() {
        super('optirun nvidia-smi', 'optirun nvidia-smi --query-gpu=', ' --format=csv,noheader,nounits');
    }

    parse(output) {
        let items = output.split('\n').map(line => line.split(',')).flat();
        this._parseFunction(items);
    }
};

var NvidiaSmiProcessor = class extends Processor {
    constructor() {
        super('nvidia-smi', 'nvidia-smi --query-gpu=', ' --format=csv,noheader,nounits');
    }

    parse(output) {
        let items = output.split('\n').map(line => line.split(',')).flat();
        this._parseFunction(items);
    }
};

var LIST = [
    NvidiaSettingsProcessor,
    NvidiaSmiProcessor,
    OptimusSettingsProcessor,
];
