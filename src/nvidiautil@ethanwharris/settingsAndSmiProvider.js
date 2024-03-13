/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

'use strict';

import * as SettingsProperties from './settingsProperties.js';
import * as SmiProperties from './smiProperties.js';
import * as Processor from './processor.js';
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
        this.storedProperties = [
            new SettingsProperties.UtilisationProperty(gpuCount, Processor.NVIDIA_SETTINGS),
            new SettingsProperties.TemperatureProperty(gpuCount, Processor.NVIDIA_SETTINGS),
            new SettingsProperties.MemoryProperty(gpuCount, Processor.NVIDIA_SETTINGS),
            new SettingsProperties.FanProperty(gpuCount, Processor.NVIDIA_SETTINGS),
            new SmiProperties.PowerProperty(gpuCount, Processor.NVIDIA_SMI),
        ];
        return this.storedProperties;
    }

    retrieveProperties() {
        return this.storedProperties;
    }

    hasSettings() {
        return true;
    }

    openSettings() {
        this.settings.openSettings();
    }
}
