/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

'use strict';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import * as Processor from './processor.js';

export class ProcessorHandler {
    constructor() {
        this._processors = [false, false, false];
    }

    process() {
        for (let i = 0; i < this._processors.length; i++) {
            if (this._processors[i]) {
                try {
                    this._processors[i].process();
                } catch (err) {
                    Main.notifyError(`Error parsing ${this._processors[i].getName()}`, err.message);
                    this._processors[i] = false;
                }
            }
        }
    }

    addProperty(property, listeners) {
        let processor = property.declare();
        if (!this._processors[processor])
            this._processors[processor] = new Processor.LIST[processor]();


        this._processors[processor].addProperty(function (lines) {
            let values = property.parse(lines);
            for (let i = 0; i < values.length; i++)
                listeners[i].handle(values[i]);
        }, property.getCallExtension());
    }

    reset() {
        this._processors = [false, false, false];
    }
}
