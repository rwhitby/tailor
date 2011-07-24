VERSION=unknown

ifdef DEVICE
# Device build
STAGING_DIR=/srv/preware/build/staging/armv7
ifeq ($(shell uname -s),Darwin)
CC=/opt/PalmPDK/arm-gcc/bin/arm-none-linux-gnueabi-gcc
else
CC=/srv/preware/build/toolchain/cs07q3armel/build/arm-2007q3/bin/arm-none-linux-gnueabi-gcc
endif
else
# Emulator build
STAGING_DIR=/srv/preware/build/staging/i686
ifeq ($(shell uname -s),Darwin)
CC=/opt/PalmPDK/i686-gcc/bin/i686-nptl-linux-gnu-gcc --sysroot=/opt/PalmPDK/i686-gcc/sys-root
else
CC=/srv/preware/build/toolchain/i686-unknown-linux-gnu/build/i686-unknown-linux-gnu/bin/i686-unknown-linux-gnu-gcc
endif
endif

CPPFLAGS := -g -DVERSION=\"${VERSION}\" -I${STAGING_DIR}/usr/include/glib-2.0 -I${STAGING_DIR}/usr/lib/glib-2.0/include -I${STAGING_DIR}/usr/include
LDFLAGS  := -g -L${STAGING_DIR}/usr/lib -llunaservice -lmjson -lglib-2.0 -lpthread

tailor: tailor.o luna_service.o luna_methods.o

install: tailor
#	- ssh root@webos killall org.webosinternals.tailor
#	scp tailor root@webos:/var/usr/sbin/org.webosinternals.tailor.new
#	ssh root@webos mv /var/usr/sbin/org.webosinternals.tailor.new /var/usr/sbin/org.webosinternals.tailor
	novacom put file://home/root/tailor < tailor

clobber:
	rm -rf *.o tailor
