/*This file is part of Nvidia Util Gnome Extension.

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

'use strict';

const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

var Card = Gio.icon_new_for_string(Me.path + '/icons/card-symbolic.svg');
var Cog = Gio.icon_new_for_string(Me.path + '/icons/cog-symbolic.svg');
var Fan = Gio.icon_new_for_string(Me.path + '/icons/fan-symbolic.svg');
var Power = Gio.icon_new_for_string(Me.path + '/icons/power-symbolic.svg');
var RAM = Gio.icon_new_for_string(Me.path + '/icons/ram-symbolic.svg');
var Temp = Gio.icon_new_for_string(Me.path + '/icons/temp-symbolic.svg');
var Wrench = Gio.icon_new_for_string(Me.path + '/icons/wrench-symbolic.svg');
