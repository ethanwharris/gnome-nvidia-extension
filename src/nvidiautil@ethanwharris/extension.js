const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();

let logoUtil = new St.Icon({icon_name: 'nvidia-card-symbolic', style_class: 'system-status-icon'});
let logoTemp = new St.Icon({icon_name: 'nvidia-temp-symbolic', style_class: 'system-status-icon'});
let logoRam = new St.Icon({icon_name: 'nvidia-ram-symbolic', style_class: 'system-status-icon'});

let utilLabel = new St.Label();
let tempLabel = new St.Label();
let memLabel = new St.Label();

let text, button, timeout_id;

function open_settings() {
  GLib.spawn_command_line_async("nvidia-settings");
}

function init() {
  Gtk.IconTheme.get_default().append_search_path(Me.dir.get_child('icons').get_path());
}

function get_info() {
  util = GLib.spawn_command_line_sync("nvidia-settings -q GPUUtilization -t")[1].toString();
  util = util.substring(9,11);
  util = util.replace(/\D/g,'');

  temp = GLib.spawn_command_line_sync("nvidia-settings -q GPUCoreTemp -t")[1].toString();
  temp = temp.split('\n')[0];

  usedMemory = GLib.spawn_command_line_sync("nvidia-settings -q UsedDedicatedGPUMemory -t")[1];
  totalMemory = GLib.spawn_command_line_sync("nvidia-settings -q TotalDedicatedGPUMemory -t")[1];

  memUsage = (usedMemory / totalMemory * 100).toString();
  memUsage = memUsage.substring(0,2);

  info = util + "," + temp + "," + memUsage;

  return info;
}

function buildButtonBox(infoString) {
  box = new St.BoxLayout({name: 'DataBox'});

  info = infoString.split(',');
  let utilText = info[0] + "%"; utilLabel.text = utilText;
  let tempText = info[1] + "\xB0" + "C"; tempLabel.text = tempText;
  let memText = info[2] + "%"; memLabel.text = memText;

  box.add_actor(logoUtil);
  box.add_actor(utilLabel);
  box.add_actor(logoTemp);
  box.add_actor(tempLabel);
  box.add_actor(logoRam);
  box.add_actor(memLabel);

  return box;
}

function updateButtonBox(infoString) {
  info = infoString.split(',');

  utilLabel.text = info[0] + "%";
  tempLabel.text = info[1] + "\xB0" + "C";
  memLabel.text = info[2] + "%";
}

function enable() {
  button = new St.Bin({
    style_class: 'panel-button',
    reactive: true,
    can_focus: true,
    x_fill: true,
    y_fill: false,
    track_hover: true
  });

  settings = GLib.find_program_in_path("nvidia-settings");

  if (settings) {
    info = get_info();
    box = buildButtonBox(info);

    button.set_child(box);
    button.connect('button-press-event', open_settings);

    timeout_id = GLib.timeout_add_seconds(0, 2, Lang.bind(this, function () {
        infoString = get_info();
        updateButtonBox(infoString);
        return true;
    }));
  } else {
    button.set_child(new St.Label({text: "Error - nvidia-settings not present!"}))
  }

	Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
	Main.panel._rightBox.remove_child(button);
  GLib.source_remove(timeout_id);
}
