#!/bin/sh

# $1 is requested size of ext3fs partition
# $2 is freespace

REQUESTED_SIZE="$1"
FREESPACE="$2"
FSTAB_ENTRY="/dev/mapper/store-ext2fs /media/ext3fs ext3  rw,noatime 0   0"


if [ ${FREESPACE} > ${REQUESTED_SPACE} ]
   lvcreate -L ${REQUESTED_SPACE}M --name ext3fs store
else
   echo 'not enough space on device'
   exit 1
fi

echo 'creating ext3 filesystem'
mke2fs -j /dev/mapper/store-ext3fs

echo 'add mountpoint to fstab'

if grep -q ${FSTAB_ENTRY} /ext/fstab ; then
  echo "mountpoint already created"
else
   ${FSTAB_ENTRY} > cat /etc/fstab
  echo "new mountpoint added to fstab"
fi

echo 'create /media/ext3fs directory'
mkdir -p /media/ext3fs

echo 'mount ext3fs on /media/ext3fs'
mount -t ext3 /dev/mapper/store-ext3fs /media/ext3fs
echo 'all done'



