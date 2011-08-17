#!/bin/sh

FSTAB_ENTRY="/dev/mapper/store-ext3fs /media/ext3fs ext3  rw,noatime 0   0"

# $1 is requested size(in Megabytes)
TARGET_SIZE = "$1"
# $2 is existing size(in Megabytes)
EXISTING_SIZE = "$2"
# $3 is existing freespace(in Megabytes)
FREESPACE = "$3"

TARGET_FS_SIZE = `TARGET_SIZE - 100`

#Remove the ext3fs
if [ $TARGET_SIZE = 0 ]
    if `lvscan | grep ext3fs`
    then
        lvremove -f store/ext3fs
        echo "removed ext3fs"
        exit 0
    else
        echo "ext3fs does not exist"
        exit 1
    fi
else
fi

#Create the ext3fs
if [ $EXISTING_SIZE = 0  && $TARGET_SIZE > 0 ]
    if [ $FREESPACE > $TARGET_SIZE ]
         lvcreate -L ${TARGET_SIZE}M --name ext3fs store
    else
         echo 'not enough space on device'
         exit 1
    fi
    echo 'creating ext3 filesystem'
    mke2fs -j /dev/mapper/store-ext3fs

    echo 'checking the ext3fs after creating FS'
    if `fsck.ext3fs  /dev/mapper/store-ext3fs > /dev/null` 
    then
    else
         echo 'failed fsck.ext3 after creating ext3 FS'
         exit 1
    fi
    echo 'add mountpoint to fstab'
    if `grep -q $FSTAB_ENTRY /ext/fstab` 
    then
         echo "mountpoint already exists"
    else
        "$FSTAB_ENTRY" < cat > /etc/fstab
         echo "new mountpoint added to fstab"
    fi

    echo 'create /media/ext3fs directory'
    mkdir -p /media/ext3fs

    echo 'mount ext3fs on /media/ext3fs'
else
    echo 'not enough space on device'
    exit 1
fi   

#Resize ext3fs       
if [ $TARGET_SIZE > $EXISTING_SIZE ]
    echo 'unmounting ext3fs'
    umount /media/ext3fs

    echo 'checking the ext3fs before resizing LV'
    if `fsck.ext3fs  /dev/mapper/store-ext3fs > /dev/null` 
    then 
         echo 'failed fsck.ext3 before resizing ext3 LV'
         exit 1
    else
    fi

    echo 'resizing the Logical Volume'
    lvresize -L ${TARGET_SIZE}M /dev/mapper/store-ext3fs

    echo 'checking the ext3fs after resizing LV and before resizing FS'
    if `fsck.ext3fs  /dev/mapper/store-ext3fs > /dev/null`  
    then 
         echo 'failed fsck.ext3 after resizing LV and before resizing ext3 FS'
         exit 1
    else
    fi

    echo 'resizing ext3 FS'
    resize2fs /dev/mapper/store-ext3fs ${TARGET_FS_SIZE}M
      
    echo 'checking FS after resize'
    if `fsck.ext3fs  /dev/mapper/store-ext3fs > /dev/null` 
    then
         echo 'failed fsck.ext3 after resizing ext3 FS'
         exit 1
    else
    fi

    echo 'remounting /media/ext3fs'
    mount -t ext3 /dev/mapper/store-ext3fs /media/ext3fs

    echo 'done!'
    exit 0
else
    echo 'unmounting ext3fs'
    umount /media/ext3fs

    echo 'running fsck before resizing'
    if `fsck.ext3fs  /dev/mapper/store-ext3fs > /dev/null` 
    then
         echo 'failed fsck.ext3 before resizing ext3 FS'
         exit 1
    else
    fi

    echo 'resizing ext3fs FS'
    resize2fs /dev/mapper/store-ext3fs ${TARGET_FS_SIZE}M

    echo 'running fsck after resizing FS'
    if `fsck.ext3fs  /dev/mapper/store-ext3fs > /dev/null` 
    then
         echo 'failed fsck.ext3 before resizing ext3 LV'
         exit 1
    else
    fi

    echo 'reducing LV size'
    lvreduce ${TARGET_SIZE}M /dev/mapper/store-ext3fs

    echo 'running final fsck of Filesystem'
    if `fsck.ext3fs  /dev/mapper/store-ext3fs > /dev/null` 
    then
         echo 'failed fsck.ext3 after resizing ext3 FS'
         exit 1
    else
    fi

    echo 'remounting ext3fs'
    mount -t ext3 /dev/mapper/store-ext3fs /media/ext3fs

    echo 'ext3fs mounted'
fi
