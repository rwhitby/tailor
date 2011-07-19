#!bin/sh

# $1 is new requested size
# $2 is requested size + 100MB

echo 'stop crpytofs'
pkill -SIGUSR1 cryptofs
echo 'unmount so we can fsck the partition before we resize'
umount /media/internal
echo 'check vfat fs before we attempt resize and fix'
/usr/sbin/fsck.vfat /dev/mapper/store-media 
echo 'resize vfat fs to new target size'
resizefat -p  /dev/mapper/store-media $1G
echo 'check vfat fs after resize'
/usr/sbin/fsck.vfat /dev/mapper/store-media 
echo 'reduce the size of the LV'
lvreduce -L $2G /dev/mapper/store-media
echo 'check vfat fs after lvreduce'
/usr/sbin/fsck.vfat /dev/mapper/store-media 
echo 'remount /media/internal'
mount -t vfat /dev/mapper/store-media /media/internal
echo 'restart cryptofs'
pkill -SIGUSR2 cryptofs
echo 'all done!'
