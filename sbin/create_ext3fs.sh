#!/bin/sh

#pvscan (and search for free space on the PV)

if [freespace > requested space]
   lvcreate -L ${REQUESTED_SPACE} --name ext3fs store
else
   echo 'not enough space on device'
   exit 1
fi

echo 'creating ext3 filesystem'
mke2fs -j /dev/mapper/store-ext3fs
echo 'add mountpoint to fstab'
'/dev/mapper/store-ext2fs /media/ext3fs ext3  rw,noatime 0   0' > cat >> /etc/fstab 
echo 'create /media/ext3fs directory'
mkdir -p /media/ext3fs
echo 'mount ext3fs on /media/ext3fs'
mount -t ext3 /dev/mapper/store-ext3fs /media/ext3fs
echo 'all done'



