/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

/* exported Icon */
'use strict';

import Gio from 'gi://Gio';
//const Gio = imports.gi.Gio;
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

//const ExtensionUtils = imports.misc.extensionUtils;
//const Me = ExtensionUtils.getCurrentExtension();

export class Icon {
    static Card = new this('card-symbolic');
    static Temp = new this('temp-symbolic');
    static RAM = new this('ram-symbolic');
    static Fan = new this('fan-symbolic');
    static Power = new this('power-symbolic');
    static Wrench = new this('wrench-symbolic');
    static Cog = new this('cog-symbolic');

    constructor(name) {
        this.name = name;
    }

    get() {
        let extensionObject = Extension.lookupByURL(import.meta.url);
        return Gio.icon_new_for_string(`${extensionObject.path}/icons/${this.name}.svg`);
    }
};
