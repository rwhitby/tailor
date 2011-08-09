#!bin/sh

# $1 is new requested size
requested_size = "$1"
# $2 is requested size + 100MBa
existing_size = "$2"
# space so we dont' run into the wall
requested_fs_size = requested_size - 100

if [ ${REQUESTED_SIZE} > ${EXISTING_SIZE} ]
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
    resizefat -p  /dev/mapper/store-media ${REQUESTED_FS_SIZE}M
    echo 'check vfat fs after resize'
    /usr/sbin/fsck.vfat /dev/mapper/store-media 
    echo 'remount /media/internal'
    mount -t vfat /dev/mapper/store-media /media/internal
    echo 'restart cryptofs'
    pkill -SIGUSR2 cryptofs
    echo 'all done!'
else
    echo 'stop crpytofs'
    pkill -SIGUSR1 cryptofs
    echo 'unmount so we can fsck the partition before we resize'
    umount /media/internal
    echo 'check vfat fs before we attempt resize and fix'
    /usr/sbin/fsck.vfat /dev/mapper/store-media
    echo 'resize vfat fs to new target size'
    resizefat -p  /dev/mapper/store-media ${REQUESTED_FS_SIZE}G
    echo 'check vfat fs after resize'
    /usr/sbin/fsck.vfat /dev/mapper/store-media
     echo 'reduce the size of the LV'
    lvreduce -L ${REQUESTED_SIZE}M /dev/mapper/store-media
    echo 'check vfat fs after lvreduce'
    /usr/sbin/fsck.vfat /dev/mapper/store-media
    echo 'remount /media/internal'
    mount -t vfat /dev/mapper/store-media /media/internal
    echo 'restart cryptofs'
    pkill -SIGUSR2 cryptofs
    echo 'all done!'
fi

