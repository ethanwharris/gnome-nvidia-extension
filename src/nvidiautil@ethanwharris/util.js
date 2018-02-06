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
const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;

var SETTINGS_REFRESH = "refreshrate";
var SETTINGS_PROVIDER = "provider";
var SETTINGS_POSITION = "position";
var SETTINGS_TEMP_UNIT = "tempformat";

/**
 * getSettings:
 * @schema: (optional): the GSettings schema id
 *
 * Builds and return a GSettings schema for @schema, using schema files
 * in extensionsdir/schemas. If @schema is not provided, it is taken from
 * metadata['settings-schema'].
 */
 function getSettings(schema) {
     let extension = ExtensionUtils.getCurrentExtension();

     schema = schema || extension.metadata['settings-schema'];

     const GioSSS = Gio.SettingsSchemaSource;

     // check if this extension was built with "make zip-file", and thus
     // has the schema files in a subfolder
     // otherwise assume that extension has been installed in the
     // same prefix as gnome-shell (and therefore schemas are available
     // in the standard folders)
     let schemaDir = extension.dir.get_child('schemas');
     let schemaSource;
     if (schemaDir.query_exists(null))
         schemaSource = GioSSS.new_from_directory(schemaDir.get_path(),
                                                  GioSSS.get_default(),
                                                  false);
     else
         schemaSource = GioSSS.get_default();

     let schemaObj = schemaSource.lookup(schema, true);
     if (!schemaObj)
         throw new Error('Schema ' + schema + ' could not be found for extension '
                         + extension.metadata.uuid + '. Please check your installation.');

     return new Gio.Settings({ settings_schema: schemaObj });
 }
