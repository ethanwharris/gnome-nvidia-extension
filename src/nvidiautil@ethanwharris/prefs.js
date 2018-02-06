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
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Util = Me.imports.util;
const GObject = imports.gi.GObject;
const Lang = imports.lang;

const SETTINGS = {
    refreshrate : {
      type : 'int',
      key : 'refreshrate',
      label : "Refresh Interval (s)",
      tooltip : "The time between refreshes in seconds",
      min : 1,
      max : 20
    },
    tempformat : {
      type : 'combo',
      key : 'tempformat',
      label : 'Temperature Units',
      tooltip : 'Set the temperature format to either Centigrade (C) or Fahrenheit (F)',
      options : ['\u00b0C','\u00b0F']
    },
    position : {
      type : 'combo',
      key : 'position',
      label : 'Extension Position',
      tooltip : 'Set the position for the extension',
      options : ['Left', 'Center', 'Right']
    },
    provider : {
      type : 'combo',
      key : 'provider',
      label : 'Properties Provider',
      tooltip : 'Select the properties provider to use',
      options : ['Nvidia Settings and SMI', 'Nvidia Settings', 'Nvidia SMI', 'Optimus with Bumblebee (beta)']
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
  if (SETTINGS[setting].type == 'noshow') {
    return false;
  }
  let box = new Gtk.Box(({ orientation : Gtk.Orientation.HORIZONTAL }));

  if (SETTINGS[setting].type == 'bool') {
    let label = new Gtk.Label(({ label : SETTINGS[setting].label, xalign: 0}));
    let control = new Gtk.Switch({ active : settings.get_boolean(setting) });

    control.connect('notify::active', function(button) {
      settings.set_boolean(setting, button.get_active());
    });

    label.set_tooltip_text(SETTINGS[setting].tooltip);
    control.set_tooltip_text(SETTINGS[setting].tooltip);

    box.pack_start(label, true, true, 0);
    box.add(control);
  } else if (SETTINGS[setting].type == 'int') {
    let label = new Gtk.Label(({ label : SETTINGS[setting].label, xalign: 0}));
    let control = Gtk.SpinButton.new_with_range (SETTINGS[setting].min, SETTINGS[setting].max, 1);
    control.set_value(settings.get_int(setting));

    control.connect ("value-changed", function() {
      settings.set_int(setting, control.get_value());
    });

    label.set_tooltip_text(SETTINGS[setting].tooltip);
    control.set_tooltip_text(SETTINGS[setting].tooltip);

    box.pack_start(label, true, true, 0);
    box.add(control);
  } else if (SETTINGS[setting].type == 'combo') {
    let model = new Gtk.ListStore();
    model.set_column_types([GObject.TYPE_INT, GObject.TYPE_STRING]);
    let combobox = new Gtk.ComboBox({model: model});
    let opts = '';

    let renderer = new Gtk.CellRendererText();
    combobox.pack_start(renderer, true);
    combobox.add_attribute(renderer, 'text', 1);

    opts = SETTINGS[setting].options;

    for (let i = 0; i < opts.length; i++) {
      model.set(model.append(), [0, 1], [i, opts[i]]);
    }

    combobox.set_active(settings.get_int(setting));

    combobox.connect('changed', Lang.bind(this, function(entry) {
      let [success, iter] = combobox.get_active_iter();
      if (!success)
        return;
      settings.set_int(setting, model.get_value(iter, 0))
    }));

    let label = new Gtk.Label({ label: SETTINGS[setting].label, xalign : 0})

    label.set_tooltip_text(SETTINGS[setting].tooltip);
    combobox.set_tooltip_text(SETTINGS[setting].tooltip);

    box.pack_start(label, true, true, 0);
    box.add(combobox);
  }
  return box;
}

/*
 * Construct the entire widget for the settings dialog
 */
function buildPrefsWidget() {
  let vbox = new Gtk.Box({ orientation : Gtk.Orientation.VERTICAL,
    border_width: 10, spacing: 10 });

  for (let setting in SETTINGS) {
    let setting_box = buildSettingWidget(setting);
    if (setting_box) {
      vbox.add(setting_box);
    }
  }

  vbox.show_all();

  return vbox;
}
