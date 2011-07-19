#!/bin/sh

if [REQUESTED_SIZE > EXISTING_SIZE]
   umount /media/ext3fs
   echo 'resizing the Logical Volume'
   lvresize -L REQUESTED_SIZE /dev/mapper/store-ext3fs
   echo 'checking the ext3fs before resizing FS'
   fsck.ext3fs  /dev/mapper/store-ext3fs
   echo 'resizing ext3 FS'
   resize2fs 
   echo 'checking FS after resize
   fsck.ext3fs /dev/mapper/store-ext3fs
   echo 'remounting /media/ext3fs'
   mount -t ext3 /dev/mapper/store-ext3fs /media/ext3fs
   echo 'done!'
else
   echo 'unmounting ext3fs'
   umount /media/ext3fs
   echo 'running fsck before resizing'
   fsck.ext3 /dev/mapper/store-ext3fs
   echo 'resizing ext3fs FS'
   resize2fs
   echo 'running fsck after resizing FS'
   fsck.ext3 /dev/mapper/store-ext3fs
   echo 'reducing LV size'
   lvreduce REQUESTED_SIZE /dev/mapper/store-ext3fs
   echo 'running final fsck of Filesystem'
   fsck.ext3 /dev/mapper/store-ext3fs
   echo 'remounting ext3fs'
   mount -t ext3 /dev/mapper/store-ext3fs /media/ext3fs
fi
