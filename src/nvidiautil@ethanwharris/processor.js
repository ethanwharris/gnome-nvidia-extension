/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

'use strict';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import * as Subprocess from './subprocess.js';

export const NVIDIA_SETTINGS = 0;
export const NVIDIA_SMI = 1;
export const OPTIMUS = 2;

/**
 * Utility function to perform one function and then another
 *
 * @param {Function} first The function executed first
 * @param {Function} second The function executed second
 * @returns {Function} A function that runs both given functions
 */
function _andThen(first, second) {
    return function (lines) {
        first(lines);
        return second(lines);
    };
}

class _Processor {
    constructor(name, baseCall, tailCall) {
        this._name = name;
        this._baseCall = baseCall;
        this._tailCall = tailCall;
        this._call = this._baseCall;

        this._parseFunction = function () {};
    }

    parse() {
        // Implemented by child classes
    }

    process() {
        let call = this._call + this._tailCall;
        Subprocess.execCommunicate(call.split(' '))
      .then(output => this.parse(output))
      .catch(e => Main.notifyError(`Execution of ${call} failed:`, e.message));
    }

    addProperty(parseFunction, callExtension) {
        this._call += callExtension;
        this._parseFunction = _andThen(this._parseFunction, parseFunction);
    }

    getName() {
        return this._name;
    }
}

class NvidiaSettingsProcessor extends _Processor {
    constructor() {
        super('nvidia-settings', 'nvidia-settings ', '-t');
    }

    parse(output) {
        this._parseFunction(output.split('\n'));
    }
}

class OptimusSettingsProcessor extends _Processor {
    constructor() {
        super('optirun nvidia-smi', 'optirun nvidia-smi --query-gpu=', ' --format=csv,noheader,nounits');
    }

    parse(output) {
        let items = output.split('\n').map(line => line.split(',')).flat();
        this._parseFunction(items);
    }
}

class NvidiaSmiProcessor extends _Processor {
    constructor() {
        super('nvidia-smi', 'nvidia-smi --query-gpu=', ' --format=csv,noheader,nounits');
    }

    parse(output) {
        let items = output.split('\n').map(line => line.split(',')).flat();
        this._parseFunction(items);
    }
}

/* The public interface consists of this array and the constants for indexing */
export const LIST = [
    NvidiaSettingsProcessor,
    NvidiaSmiProcessor,
    OptimusSettingsProcessor,
];
