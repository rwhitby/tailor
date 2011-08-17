#!bin/sh

# $1 is new requested size
TARGET_SIZE = "$1"
# $2 is existing size of partition 
EXISTING_SIZE = "$2"
# space so we dont' run into the wall
TARGET_FS_SIZE = `$TARGET_SIZE - 100`

if [ ${TARGET_SIZE} > ${EXISTING_SIZE} ]
then
#Target is Larger than Existing
    echo 'stop crpytofs'
    pkill -SIGUSR1 cryptofs
    echo 'unmount so we can fsck the partition before we resize'
    umount /media/internal
    echo 'check vfat fs before we attempt resize and fix'
    /usr/sbin/fsck.vfat /dev/mapper/store-media 
    lvresize -L ${TARGET_SIZE}M /dev/mapper/store-media
    echo 'check vfat fs after lvrsize'
    /usr/sbin/fsck.vfat /dev/mapper/store-media
    echo 'resize vfat fs to new target size'
    resizefat -p  /dev/mapper/store-media ${TARGET_FS_SIZE}M
    echo 'check vfat fs after resize'
    /usr/sbin/fsck.vfat /dev/mapper/store-media 
    echo 'remount /media/internal'
    mount -t vfat /dev/mapper/store-media /media/internal
    echo 'restart cryptofs'
    pkill -SIGUSR2 cryptofs
    echo 'all done!'
else
#Target is Smaller than Existing
    echo 'stop crpytofs'
    pkill -SIGUSR1 cryptofs
    echo 'unmount so we can fsck the partition before we resize'
    umount /media/internal
    echo 'check vfat fs before we attempt resize and fix'
    /usr/sbin/fsck.vfat /dev/mapper/store-media
    echo 'resize vfat fs to new target size'
    resizefat -p  /dev/mapper/store-media ${TARGET_FS_SIZE}G
    echo 'check vfat fs after resize'
    /usr/sbin/fsck.vfat /dev/mapper/store-media
     echo 'reduce the size of the LV'
    lvreduce -L ${TARGET_SIZE}M /dev/mapper/store-media
    echo 'check vfat fs after lvreduce'
    /usr/sbin/fsck.vfat /dev/mapper/store-media
    echo 'remount /media/internal'
    mount -t vfat /dev/mapper/store-media /media/internal
    echo 'restart cryptofs'
    pkill -SIGUSR2 cryptofs
    echo 'all done!'
fi

