all:
	glib-compile-schemas src/nvidiautil@ethanwharris/schemas/
	cd src/nvidiautil@ethanwharris && zip -r nvidiautil@ethanwharris * && mv nvidiautil@ethanwharris.zip ../..
