# gnome-nvidia-extension
A Gnome extension to show Nvidia GPU information

# Requirements
nvidia-settings and nvidia-smi

# Installation from git
    git clone https://github.com/ethanwharris/gnome-nvidia-extension.git
    cd gnome-nvidia-extension
    mkdir -p ~/.local/share/gnome-shell/extensions
    cp -r src/nvidiautil@ethanwharris ~/.local/share/gnome-shell/extensions/
Use `alt + f2` to restart the gnome shell. If this is not allowed then log out and log back in. Enable the extension in the gnome tweak tool.

# Icons
For icons we use font-awesome:
http://fontawesome.io/

We obtain SVGs from:
https://github.com/encharm/Font-Awesome-SVG-PNG
