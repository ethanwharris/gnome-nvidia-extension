/* SPDX-License-Identifier: GPL-3.0-or-later */
/* SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project. */

/* exported Card Cog Fan Power RAM Temp Wrench */
'use strict';

const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

var Card = Gio.icon_new_for_string(`${Me.path}/icons/card-symbolic.svg`);
var Cog = Gio.icon_new_for_string(`${Me.path}/icons/cog-symbolic.svg`);
var Fan = Gio.icon_new_for_string(`${Me.path}/icons/fan-symbolic.svg`);
var Power = Gio.icon_new_for_string(`${Me.path}/icons/power-symbolic.svg`);
var RAM = Gio.icon_new_for_string(`${Me.path}/icons/ram-symbolic.svg`);
var Temp = Gio.icon_new_for_string(`${Me.path}/icons/temp-symbolic.svg`);
var Wrench = Gio.icon_new_for_string(`${Me.path}/icons/wrench-symbolic.svg`);
