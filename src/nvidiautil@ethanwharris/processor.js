/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

/* exported NVIDIA_SETTINGS NVIDIA_SMI OPTIMUS LIST */
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
class Processor {
    // Abstract: true,
    constructor(name, baseCall, tailCall) {
        this._name = name;
        this._baseCall = baseCall;
        this._tailCall = tailCall;
        this._call = this._baseCall;

        this._parseFunction = function () {};
    }

    parse() {
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
}

class NvidiaSettingsProcessor extends Processor {
    constructor() {
        super('nvidia-settings', 'nvidia-settings ', '-t');
    }

    parse(output) {
        this._parseFunction(output.split('\n'));
    }
}

class OptimusSettingsProcessor extends Processor {
    constructor() {
        super('optirun nvidia-smi', 'optirun nvidia-smi --query-gpu=', ' --format=csv,noheader,nounits');
    }

    parse(output) {
        let items = output.split('\n').map(line => line.split(',')).flat();
        this._parseFunction(items);
    }
}

class NvidiaSmiProcessor extends Processor {
    constructor() {
        super('nvidia-smi', 'nvidia-smi --query-gpu=', ' --format=csv,noheader,nounits');
    }

    parse(output) {
        let items = output.split('\n').map(line => line.split(',')).flat();
        this._parseFunction(items);
    }
}

var LIST = [
    NvidiaSettingsProcessor,
    NvidiaSmiProcessor,
    OptimusSettingsProcessor,
];
