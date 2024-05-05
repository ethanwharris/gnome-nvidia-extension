/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

'use strict';

import * as SettingsProvider from './settingsProvider.js';
import * as SmiProvider from './smiProvider.js';

export class SettingsAndSmiProvider {
    constructor() {
        this.settings = new SettingsProvider.SettingsProvider();
        this.smi = new SmiProvider.SmiProvider();
    }

    getGpuNames() {
        return this.smi.getGpuNames();
    }

    getProperties(gpuCount) {
        return this.smi.getProperties(gpuCount);
    }

    retrieveProperties() {
        return this.smi.retrieveProperties();
    }

    hasSettings() {
        return true;
    }

    openSettings() {
        this.settings.openSettings();
    }
}
