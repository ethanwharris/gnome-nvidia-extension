/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

/* exported Icon */
'use strict';

const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

class Icon {
    static Card = new Icon('card-symbolic');
    static Temp = new Icon('temp-symbolic');
    static RAM = new Icon('ram-symbolic');
    static Fan = new Icon('fan-symbolic');
    static Power = new Icon('power-symbolic');
    static Wrench = new Icon('wrench-symbolic');
    static Cog = new Icon('cog-symbolic');

    constructor(name) {
        this.name = name;
    }

    get() {
        return Gio.icon_new_for_string(`${Me.path}/icons/${this.name}.svg`);
    }
}
