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
const Spawn = Me.imports.spawn;

/*
 * Open the preferences for the nvidiautil extension
 */
function openPreferences() {
  Spawn.spawnAsync("gnome-shell-extension-prefs " + Me.metadata['uuid'], Spawn.defaultErrorHandler);
}

/*
 * Open the Nvidia Settings tool
 * Note: This will not check if nvidia-settings exists first
 */
// function openSettings() {
//   const Shell = imports.gi.Shell;
//   let defaultAppSystem = Shell.AppSystem.get_default();
//   let nvidiaSettingsApp = defaultAppSystem.lookup_app('nvidia-settings.desktop');
//
//   if (!nvidiaSettingsApp) {
//     Main.notifyError("Couldn't find nvidia-settings on your device", "Check you have it installed correctly");
//     return;
//   }
//
//   if (nvidiaSettingsApp.get_n_windows()) {
//     nvidiaSettingsApp.activate();
//   } else {
//     Spawn.spawnAsync('nvidia-settings', Spawn.defaultErrorHandler);
//   }
// }
//
// function getGpuNames() {
//   var output = Spawn.spawnSync("nvidia-smi --query-gpu=gpu_name --format=csv,noheader", function(command, err) {
//     // Do Nothing
//   });
//   return output.split('\n');
// }

const PropertyMenuItem = new Lang.Class({
  Name : 'PropertyMenuItem',
  Extends: PopupMenu.PopupBaseMenuItem,
  _init : function(property, box, labelManager) {
    this.parent();

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
    } else {
      this.actor.add_style_pseudo_class('active');
      this._box.add_child(this._icon);
      this._box.add_child(this._statisticLabelVisible);
      this._visible = true;
      this._box.visible = true;
      this.labelManager.increment();
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

// const PropertyHandler = new Lang.Class({
//   Name : 'PropertyHandler',
//   _init : function(processor, listeners, property) {
//     processor.addProperty(function(lines) {
//       let values = property.parse(lines);
//       for(var i = 0; i < values.length; i++) {
//         listeners[i].handle(values[i]);
//       }
//     }, property.getCallExtension());
//   }
// });

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
    this._settingsPointer = this._settings.connect('changed', Lang.bind(this, this.loadSettings));

    this.setMenu(new PersistentPopupMenu(this.actor, 0.0));

    let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });

    let properties = new St.BoxLayout({style_class: 'panel-status-menu-box'});

    hbox.add_actor(properties);
    hbox.add_actor(PopupMenu.arrowIcon(St.Side.BOTTOM));
    this.actor.add_child(hbox);

    // this.settingsProcessor = new Processor.NvidiaSettingsProcessor();
    // this.smiProcessor = new Processor.NvidiaSmiProcessor();

    this.processor = new ProcessorHandler.ProcessorHandler();

    this.provider = new SettingsProvider.SettingsProvider();

    global.log('[myAppId]', 'Test');

    var names = this.provider.getGpuNames();

    if (names != Spawn.ERROR) {

      var menus = [];
      var managers = [];

      for (var n = 0; n < names.length - 1; n++) {
        menus[n] = new PopupMenu.PopupSubMenuMenuItem(names[n]);
        var label = new St.Label({ text : n + ':', style_class : 'gpulabel'});
        managers[n] = new GpuLabelDisplayManager(label);
        this.menu.addMenuItem(menus[n]);
      }

      global.log('[myAppId]', 'Test3');

      var props = this.provider.getProperties();

      for (var i = 0; i < props.length; i++) {
        var property = new props[i](names.length - 1);
        var listeners = [];

        global.log('[myAppId]', 'Test5');

        for (var n = 0; n < names.length - 1; n++) {
          var box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });

          global.log('[myAppId]', 'Test7');

          var item = new PropertyMenuItem(property, box, managers[n]);

          global.log('[myAppId]', 'Test6');

          listeners[n] = item;
          menus[n].menu.addMenuItem(item);
          properties.add_child(box);
        }

        global.log('[myAppId]', 'Test4');

        this.processor.addProperty(property, listeners);
      }

      global.log('[myAppId]', 'Test2');
      // var utilisationProperty = new Property.UtilisationProperty(names.length - 1);
      // var utilisationListeners = [];
      //
      // var temperatureProperty = new Property.TemperatureProperty(names.length - 1);
      // var temperatureListeners = [];
      //
      // var memoryProperty = new Property.MemoryProperty(names.length - 1);
      // var memoryListeners = [];
      //
      // var fanProperty = new Property.FanProperty(names.length - 1);
      // var fanListeners = [];
      //
      // var powerProperty = new Property.PowerProperty(names.length - 1);
      // var powerListeners = [];
      //
      // for(var n = 0; n < names.length - 1; n++) {
      //   var name = names[n];
      //
      //   let submenu = new PopupMenu.PopupSubMenuMenuItem(names[n]);
      //
      //   var gpuLabel = new St.Label({ text : n + ':', style_class : 'gpulabel'});
      //   var labelManager = new GpuLabelDisplayManager(gpuLabel);
      //   this.menu.addMenuItem(submenu);
      //
      //   var utilisationBox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
      //   var tmp = new PropertyMenuItem(utilisationProperty, utilisationBox, labelManager);
      //   utilisationListeners[n] = tmp;
      //   submenu.menu.addMenuItem(tmp);
      //
      //   var temperatureBox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
      //   tmp = new PropertyMenuItem(temperatureProperty, temperatureBox, labelManager);
      //   temperatureListeners[n] = tmp;
      //   submenu.menu.addMenuItem(tmp);
      //
      //   var memoryBox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
      //   tmp = new PropertyMenuItem(memoryProperty, memoryBox, labelManager);
      //   memoryListeners[n] = tmp;
      //   submenu.menu.addMenuItem(tmp);
      //
      //   var fanBox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
      //   tmp = new PropertyMenuItem(fanProperty, fanBox, labelManager);
      //   fanListeners[n] = tmp;
      //   submenu.menu.addMenuItem(tmp);
      //
      //   var powerBox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
      //   tmp = new PropertyMenuItem(powerProperty, powerBox, labelManager);
      //   powerListeners[n] = tmp;
      //   submenu.menu.addMenuItem(tmp);
      //
      //   properties.add_child(gpuLabel);
      //   properties.add_child(utilisationBox);
      //   properties.add_child(temperatureBox);
      //   properties.add_child(memoryBox);
      //   properties.add_child(fanBox);
      //   properties.add_child(powerBox);
      // }

      // var utilisationHandler = new PropertyHandler(this.settingsProcessor, utilisationListeners, utilisationProperty);
      // var temperatureHandler = new PropertyHandler(this.settingsProcessor, temperatureListeners, temperatureProperty);
      // var memoryHandler = new PropertyHandler(this.settingsProcessor, memoryListeners, memoryProperty);
      // var fanHandler = new PropertyHandler(this.settingsProcessor, fanListeners, fanProperty);
      // var powerHandler = new PropertyHandler(this.smiProcessor, powerListeners, powerProperty);

      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      this.loadSettings();
    }

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
  },
  loadSettings : function() {
    this._addTimeout(this._settings.get_int(Util.SETTINGS_REFRESH));
  },
  /*
   * Create and add the timeout which updates values every t seconds
   */
  _addTimeout : function(t) {
    this._removeTimeout();

    this.processor.process();

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
  destroy : function() {
    this._removeTimeout();
    this._settings.disconnect(this._settingsPointer);
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
