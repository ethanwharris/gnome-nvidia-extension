/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

/* exported SmiProvider */
'use strict';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
//const Main = imports.ui.main;
//const ExtensionUtils = imports.misc.extensionUtils;
//const Me = ExtensionUtils.getCurrentExtension();

import * as Processor from './processor.js';
import * as SmiProperties from './smiProperties.js';
import * as Subprocess from './subprocess.js';
//const Processor = Me.imports.processor;
//const SmiProperties = Me.imports.smiProperties;
//const Subprocess = Me.imports.subprocess;

export class SmiProvider {
    getGpuNames() {
        return Subprocess.execCommunicate(['nvidia-smi', '--query-gpu=gpu_name', '--format=csv,noheader'])
      .then(output => output.split('\n').map((gpu, index) => `${index}: ${gpu}`));
    }

    getProperties(gpuCount) {
        this.storedProperties = [
            new SmiProperties.UtilisationProperty(gpuCount, Processor.NVIDIA_SMI),
            new SmiProperties.TemperatureProperty(gpuCount, Processor.NVIDIA_SMI),
            new SmiProperties.MemoryProperty(gpuCount, Processor.NVIDIA_SMI),
            new SmiProperties.FanProperty(gpuCount, Processor.NVIDIA_SMI),
            new SmiProperties.PowerProperty(gpuCount, Processor.NVIDIA_SMI),
        ];
        return this.storedProperties;
    }

    retrieveProperties() {
        return this.storedProperties;
    }

    hasSettings() {
        return false;
    }

    openSettings() {
        Main.notifyError('Settings are not available in smi mode', 'Switch to a provider which supports nivida-settings');
    }
};
