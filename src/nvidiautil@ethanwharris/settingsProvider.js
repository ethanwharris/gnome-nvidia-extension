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

const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Shell = imports.gi.Shell;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;

const Main = imports.ui.main;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ShellMountOperation = imports.ui.shellMountOperation;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

// const Processor = Me.imports.processor;

const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;

const Spawn = Me.imports.spawn;
const Processor = Me.imports.processor;

const SettingsProperties = Me.imports.settingsProperties;

var SettingsProvider = new Lang.Class({
  Name : 'SettingsProvider',
  _init : function() {
  },
  getGpuNames() {
    var output = Spawn.spawnSync("nvidia-settings -q GpuUUID -t", function(command, err) {
      // Do Nothing
    });

    if (output == Spawn.ERROR) {
      return Spawn.ERROR;
    }

    output = output.split('\n');
    var result = [];

    for (var i = 0; i < output.length; i++) {
      result[i] = "GPU " + i;
    }

    return result;
  },
  getProperties(gpuCount) {
    return [
      new SettingsProperties.UtilisationProperty(gpuCount, Processor.NVIDIA_SETTINGS),
      new SettingsProperties.TemperatureProperty(gpuCount, Processor.NVIDIA_SETTINGS),
      new SettingsProperties.MemoryProperty(gpuCount, Processor.NVIDIA_SETTINGS),
      new SettingsProperties.FanProperty(gpuCount, Processor.NVIDIA_SETTINGS)
    ];
  },
  openSettings() {
    let defaultAppSystem = Shell.AppSystem.get_default();
    let nvidiaSettingsApp = defaultAppSystem.lookup_app('nvidia-settings.desktop');

    if (!nvidiaSettingsApp) {
      Main.notifyError("Couldn't find nvidia-settings on your device", "Check you have it installed correctly");
      return;
    }

    if (nvidiaSettingsApp.get_n_windows()) {
      nvidiaSettingsApp.activate();
    } else {
      Spawn.spawnAsync('nvidia-settings', Spawn.defaultErrorHandler);
    }
  }
});
