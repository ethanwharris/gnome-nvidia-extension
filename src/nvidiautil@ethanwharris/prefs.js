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
const Gtk = imports.gi.Gtk;

const Gettext = imports.gettext.domain('gnome-shell-extensions-nvidiautil');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Util = Me.imports.util;

const SETTINGS = {
    gpuutilisation : {
        type : 'bool',
        key : 'gpuutilisation',
        label : _("GPU Utilisation"),
        tooltip : _("Displays the GPU utilisation in the toolbar")
    },
    gputemp : {
        type : 'bool',
        key : 'gputemp',
        label : _("GPU Temperature"),
        tooltip : _("Displays the GPU temperature in the toolbar")
    },
    gpumemoryutilisation : {
        type : 'bool',
        key : 'gpumemoryutilisation',
        label : _("GPU Memory Utilisation"),
        tooltip : _("Displays the GPU memory utilisation in the toolbar")
    },
    gpupowerusage : {
        type : 'bool',
        key : 'gpupowerusage',
        label : _("GPU Power Usage (Requires: nvidia-smi)"),
        tooltip : _("Displays the GPU power usage (W) in the toolbar")
    },
    gpufanspeed : {
        type : 'bool',
        key : 'gpufanspeed',
        label : _("GPU Fan Speed"),
        tooltip : _("Displays the GPU fan speed (%) in the toolbar")
    },
    refreshrate : {
        type : 'int',
        key : 'refreshrate',
        label : _("Refresh Rate (s)"),
        tooltip : _("The time between refreshes in seconds")
    }
};

let settings;

/*
 * Initialise this
 */
function init() {
    settings = Util.getSettings();
}

/*
 * Construct the individual widget for an individual setting
 */
function buildSettingWidget(setting) {
    let box = new Gtk.Box(({ orientation : Gtk.Orientation.HORIZONTAL }));

    if (SETTINGS[setting].type == 'bool') {
        let label = new Gtk.Label(({ label : _(SETTINGS[setting].label), xalign: 0}));
        let control = new Gtk.Switch({ active : settings.get_boolean(setting) });

        control.connect('notify::active', function(button) {
            settings.set_boolean(setting, button.get_active());
        });

        label.set_tooltip_text(_(SETTINGS[setting].tooltip));
        control.set_tooltip_text(_(SETTINGS[setting].tooltip));

        box.pack_start(label, true, true, 0);
        box.add(control);
    } else if (SETTINGS[setting].type == 'int') {
        let label = new Gtk.Label(({ label : _(SETTINGS[setting].label), xalign: 0}));
        let control = Gtk.SpinButton.new_with_range (1, 20, 1);
        control.set_value(settings.get_int(setting));
        // control.connect('notify::active', function(button) {
        //     settings.set_boolean(setting, button.get_active());
        // });

        control.connect ("value-changed", function() {
          settings.set_int(setting, control.get_value());
        });

        label.set_tooltip_text(_(SETTINGS[setting].tooltip));
        control.set_tooltip_text(_(SETTINGS[setting].tooltip));

        box.pack_start(label, true, true, 0);
        box.add(control);
    }

    return box;
}

/*
 * Construct the entire widget for the settings dialog
 */
function buildPrefsWidget() {

    let vbox = new Gtk.Box({ orientation : Gtk.Orientation.VERTICAL,
        border_width: 10 });

    for (var setting in SETTINGS) {
        let setting_box = buildSettingWidget(setting);
        vbox.add(setting_box);
    }

    vbox.show_all();

    return vbox;
}
