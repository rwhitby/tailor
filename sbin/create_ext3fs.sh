#!/bin/sh

pvscan (and search for free space on the PV)

if [freespace > requested space]
   lvcreate -L ${REQUESTED_SPACE} --name ext3fs store
else
   echo 'not enough space on device'
   exit 1
fi

mke2fs -j /dev/mapper/store-ext3fs

"/dev/mapper/store-ext2fs /media/ext3fs ext3  rw,noatime 0   0" > cat >> /etc/fstab 

mkdir -p /media/ext3fs

mount -t ext3 /dev/mapper/store-ext3fs /media/ext3fs

echo 'all done'



