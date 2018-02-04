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

const MUtil = imports.misc.util;

const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Util = Me.imports.util;
const Property = Me.imports.property;
const Processor = Me.imports.processor;
const ProcessorHandler = Me.imports.processorHandler;
const SettingsProvider = Me.imports.settingsProvider;
const SmiProvider = Me.imports.smiProvider;
const SettingsAndSmiProvider = Me.imports.settingsAndSmiProvider;
const OptimusProvider = Me.imports.optimusProvider;
const Spawn = Me.imports.spawn;

var PROVIDERS = [
  SettingsAndSmiProvider.SettingsAndSmiProvider,
  SettingsProvider.SettingsProvider,
  SmiProvider.SmiProvider,
  OptimusProvider.OptimusProvider
];

var PROVIDER_SETTINGS = [
  "settingsandsmiconfig",
  "settingsconfig",
  "smiconfig",
  "optimusconfig"
]

/*
 * Open the preferences for the nvidiautil extension
 */
function openPreferences() {
  Spawn.spawnAsync("gnome-shell-extension-prefs " + Me.metadata['uuid'], Spawn.defaultErrorHandler);
}

const PropertyMenuItem = new Lang.Class({
  Name : 'PropertyMenuItem',
  Extends: PopupMenu.PopupBaseMenuItem,
  _init : function(property, box, labelManager, settings, setting, index) {
    this.parent();

    this._settings = settings;
    this._setting = setting;
    this._index = index;

    this._box = box;
    this.labelManager = labelManager;

    this.actor.add(new St.Icon({ icon_name: property.getIcon(),
                                      style_class: 'popup-menu-icon' }));

    this.label = new St.Label({ text: property.getName() });
    this.actor.add(this.label, { expand: true });
    this.actor.label_actor = this.label;

    this._icon = new St.Icon({ icon_name: property.getIcon(),
                                      style_class: 'system-status-icon' });

    this._statisticLabelHidden = new St.Label({ text: '0' });
    this._statisticLabelVisible = new St.Label({ text: '0', style_class: 'label' });

    this.actor.add(this._statisticLabelHidden);
    this._visible = false;
    this._box.visible = false;
  },
  destroy : function() {
    this.parent();
  },
  activate : function(event) {
    if (this._visible) {
      this.actor.remove_style_pseudo_class('active');
      this._box.remove_child(this._icon);
      this._box.remove_child(this._statisticLabelVisible);
      this._visible = false;
      this._box.visible = false;
      this.labelManager.decrement();

      let flags = this._settings.get_strv(this._setting);
      flags[this._index] = "inactive";
      this._settings.set_strv(this._setting, flags);
    } else {
      this.actor.add_style_pseudo_class('active');
      this._box.add_child(this._icon);
      this._box.add_child(this._statisticLabelVisible);
      this._visible = true;
      this._box.visible = true;
      this.labelManager.increment();

      let flags = this._settings.get_strv(this._setting);
      flags[this._index] = "active";
      this._settings.set_strv(this._setting, flags);
    }
  },
  setActive : function(active) {
    this.parent(active);
    if (this._visible) {
      this.actor.add_style_pseudo_class('active');
    }
  },
  handle : function(value) {
    this._statisticLabelHidden.text = value;
    this._statisticLabelVisible.text = value;
  }
});

const PersistentPopupMenu = new Lang.Class({
  Name : 'PersistentPopupMenu',
  Extends : PopupMenu.PopupMenu,
  _init : function(actor, menuAlignment) {
    this.parent(actor, menuAlignment, St.Side.TOP, 0);
  },
  _setOpenedSubMenu: function(submenu) {
    this._openedSubMenu = submenu;
  }
});

const GpuLabelDisplayManager = new Lang.Class({
  Name : 'gpuLabelDisplayManager',
  _init : function(gpuLabel) {
    this.gpuLabel = gpuLabel;
    this.count = 0;
    this.gpuLabel.visible = false;
  },
  increment : function() {
    this.count = this.count + 1;

    if (this.gpuLabel.visible == false) {
      this.gpuLabel.visible = true;
    }
  },
  decrement : function() {
    this.count = this.count - 1;

    if (this.count == 0 && this.gpuLabel.visible == true) {
      this.gpuLabel.visible = false;
    }
  }
});

const MainMenu = new Lang.Class({
  Name : 'MainMenu',
  Extends : PanelMenu.Button,
  _init : function() {
    this.parent(0.0, _("GPU Statistics"));
    this.timeoutId = -1;
    this._settings = Util.getSettings();
    this._error = false;
    // this._settingsPointer = this._settings.connect('changed', Lang.bind(this, this.loadSettings));

    this.processor = new ProcessorHandler.ProcessorHandler();

    this.setMenu(new PersistentPopupMenu(this.actor, 0.0));

    let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });

    this.properties = new St.BoxLayout({style_class: 'panel-status-menu-box'});

    hbox.add_actor(this.properties);
    hbox.add_actor(PopupMenu.arrowIcon(St.Side.BOTTOM));
    this.actor.add_child(hbox);

    this._propertiesMenu = new PopupMenu.PopupMenuSection();
    this.menu.addMenuItem(this._propertiesMenu);

    this._reload();
    this._updatePollTime();

    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

    var item = new PopupMenu.PopupBaseMenuItem({ reactive: false,
                                         can_focus: false });

    let wrench = new St.Button({
      reactive: true,
      can_focus: true,
      track_hover: true,
      accessible_name: 'Open Preferences',
      style_class: 'system-menu-action'
    });
    wrench.child = new St.Icon({ icon_name: 'wrench-symbolic' });
    wrench.connect('clicked', () => { openPreferences(); });
    item.actor.add(wrench, { expand: true, x_fill: false });

    let cog = new St.Button({
      reactive: true,
      can_focus: true,
      track_hover: true,
      accessible_name: 'Open Nvidia Settings',
      style_class: 'system-menu-action'
    });
    cog.child = new St.Icon({ icon_name: 'cog-symbolic' });
    cog.connect('clicked', Lang.bind(this, this.provider.openSettings));
    item.actor.add(cog, { expand: true, x_fill: false });

    this.menu.addMenuItem(item);

    this._settingChangedSignals = [];
    this._addSettingChangedSignal(Util.SETTINGS_PROVIDER, Lang.bind(this, this._reload));
    this._addSettingChangedSignal(Util.SETTINGS_REFRESH, Lang.bind(this, this._updatePollTime));
    this._addSettingChangedSignal(Util.SETTINGS_TEMP_UNIT, Lang.bind(this, this._reload));

  },
  _reload : function() {

    this.properties.destroy_all_children();
    this._propertiesMenu.removeAll();

    this.processor.reset();

    let p = this._settings.get_int(Util.SETTINGS_PROVIDER);
    this.provider = new PROVIDERS[p]();
    let flags = this._settings.get_strv(PROVIDER_SETTINGS[p]);

    var names = this.provider.getGpuNames();

    if (names != Spawn.ERROR) {

      var listeners = [];

      var properties = this.provider.getProperties(names.length - 1);

      for (var i = 0; i < properties.length; i++) {
        listeners[i] = [];
      }

      for (var n = 0; n < names.length - 1; n++) {
        let submenu = new PopupMenu.PopupSubMenuMenuItem(names[n]);
        let label = new St.Label({ text : n + ':', style_class : 'gpulabel'});
        let manager = new GpuLabelDisplayManager(label);
        this._propertiesMenu.addMenuItem(submenu);

        this.properties.add_child(label);

        for (var i = 0; i < properties.length; i++) {
          var box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });

          let index = (n * properties.length) + i;
          var item = new PropertyMenuItem(properties[i], box, manager, this._settings, PROVIDER_SETTINGS[p], index);

          if (properties[i].getName() == "Temperature") {
            unit = this._settings.get_int(Util.SETTINGS_TEMP_UNIT)
            properties[i].setUnit(unit)
          }

          listeners[i][n] = item;
          submenu.menu.addMenuItem(item);
          this.properties.add_child(box);
        }
      }

      for (var i = 0; i < properties.length; i++) {
        this.processor.addProperty(properties[i], listeners[i]);
      }

      this.processor.process();

      for (var n = 0; n < names.length - 1; n++) {
        for (var i = 0; i < properties.length; i++) {
          let index = (n * properties.length) + i;

          if (!flags[index]) {
            flags[index] = "inactive";
          }

          if (flags[index] == "active") {
            listeners[i][n].activate();
          }
        }
      }

      this._settings.set_strv(PROVIDER_SETTINGS[p], flags);
    } else {
      this._error = true;
    }
  },
  _updatePollTime : function() {
    if (!this._error) {
      this._addTimeout(this._settings.get_int(Util.SETTINGS_REFRESH));
    }
  },
  // _updateTempUnits : function() {
  //   // Main.notifyError('', 'IN');
  //   // let p = this._settings.get_int(Util.SETTINGS_PROVIDER);
  //   // let provider = new PROVIDERS[p]();
  //   var names = this.provider.getGpuNames();
  //   var properties = this.provider.getProperties(names.length - 1);
  //   var unit = 0;
  //
  //   for (var i = 0; i < properties.length; i++) {
  //     if (properties[i].getName() == "Temperature") {
  //
  //       unit = this._settings.get_int(Util.SETTINGS_TEMP_UNIT)
  //       // Main.notifyError('',''+unit)
  //       properties[i].setUnit(unit)
  //     }
  //   }
  // },
  /*
   * Create and add the timeout which updates values every t seconds
   */
  _addTimeout : function(t) {
    this._removeTimeout();

    this.timeoutId = GLib.timeout_add_seconds(0, t, Lang.bind(this, function() {
      this.processor.process();
      return true;
    }));
  },
  /*
   * Remove current timeout
   */
  _removeTimeout : function() {
    if (this.timeoutId != -1) {
      GLib.source_remove(this.timeoutId);
      this.timeoutId = -1;
    }
  },
  _addSettingChangedSignal : function(key, callback) {
    this._settingChangedSignals.push(this._settings.connect('changed::' + key, callback));
  },
  destroy : function() {
    this._removeTimeout();
    // this._settings.disconnect(this._settingsPointer);

    for (let signal of this._settingChangedSignals) {
      this._settings.disconnect(signal);
    };

    this.parent();
  }
});

let _menu;

/*
 * Init function, nothing major here, do not edit view
 */
function init() {
  Gtk.IconTheme.get_default().append_search_path(Me.dir.get_child('icons').get_path());
  // extension_settings = Util.getSettings();
}

function enable() {
    _menu = new MainMenu();
    Main.panel.addToStatusArea('main-menu', _menu);
}

function disable() {
    _menu.destroy();
}
