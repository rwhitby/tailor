#!bin/sh

#stop crpytofs
  
pkill -SIGUSR1 cryptofs

#unmount so we can fsck the partition before we resize

umount /media/internal

/usr/sbin/fsck.vfat /dev/mapper/store-media &2>&1

resizefat -i -v  /dev/mapper/store-media/ $1

/usr/sbin/fsck.vfat /dev/mapper/store-media &2>&1

lvreduce -L $2 /dev/mapper/store-media/

/usr/sbin/fsck.vfat /dev/mapper/store-media &2>&1

mount -t vfat /dev/mapper/store-media /media/internal

# start cryptofs

pkill -SIGUSR2 cryptofs

