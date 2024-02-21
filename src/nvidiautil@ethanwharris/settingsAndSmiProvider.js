/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

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
};
