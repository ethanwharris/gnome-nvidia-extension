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

/* exported SettingsAndSmiProvider */
'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SettingsProperties = Me.imports.settingsProperties;
const SmiProperties = Me.imports.smiProperties;
const Processor = Me.imports.processor;

const SettingsProvider = Me.imports.settingsProvider;
const SmiProvider = Me.imports.smiProvider;

var SettingsAndSmiProvider = class {
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
};
