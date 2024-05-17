/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

'use strict';

import Gio from 'gi://Gio';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export const Icon = {
    Card: 'card-symbolic',
    Temp: 'temp-symbolic',
    RAM: 'ram-symbolic',
    Fan: 'fan-symbolic',
    Power: 'power-symbolic',
    Wrench: 'wrench-symbolic',
    Cog: 'cog-symbolic',
};

/**
 * get an icon from the extension directory
 * @param {string} name file name of the icon
 * @returns {Gio.Icon} new gicon
 */
export function get(name) {
    let extensionObject = Extension.lookupByURL(import.meta.url);
    return Gio.icon_new_for_string(`${extensionObject.path}/icons/${name}.svg`);
}
