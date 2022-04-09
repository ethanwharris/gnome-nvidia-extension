# SPDX-License-Identifier: GPL-3.0-or-later
# SPDX-FileCopyrightText: Contributors to the gnome-nvidia-extension project.

all:
	glib-compile-schemas src/nvidiautil@ethanwharris/schemas/
	cd src/nvidiautil@ethanwharris && zip -r nvidiautil@ethanwharris * && mv nvidiautil@ethanwharris.zip ../..

install:
	mkdir -p ~/.local/share/gnome-shell/extensions
	cp -r src/nvidiautil@ethanwharris ~/.local/share/gnome-shell/extensions/
