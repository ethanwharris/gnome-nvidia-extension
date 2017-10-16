const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;

let text, button;

function open_settings() {
  GLib.spawn_command_line_async("nvidia-settings");
}

function init() {
	button = new St.Bin({
		style_class: 'panel-button',
		reactive: true,
		can_focus: true,
		x_fill: true,
		y_fill: false,
		track_hover: true
	});

  button.set_child(get_util());
  button.connect('button-press-event', open_settings);

  event = GLib.timeout_add_seconds(0, 5, Lang.bind(this, function () {
      button.set_child(get_util());
      return true;
  }));
}

function get_util() {
  res = GLib.spawn_command_line_sync("nvidia-settings -q GPUUtilization -t")[1].toString();
  res = res.substring(9,11);
  res = res.replace(/\D/g,'');
  res = "GPU: " + res + "%";

  return new St.Label({text: res});
}

function enable() {
	Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
	Main.panel._rightBox.remove_child(button);
}
