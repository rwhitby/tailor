ext3fs size = 0 + Target Size > 0   ---- Create
ext3fs size > 0 + Target Size > 0   ---- Resize
ext3fs size > 0 + Target Size = 0   ---- Remove

existing {freespace + media + swap + ext3fs} = target {freespace + media + swap + ext3fs}
   pvscan (free) + lvscan  | grep media | clip + lvscan  | grep swap | clip + lvscan  | grep ext3fs | clip

app provides: desired target state for all LV’s that are being manipulated: LV size(for each) and fstype

1) determine free space
  Save Free Space var
2) determine state of any resize of MEDIA
  a) is LV @ target size?
        lvsize =  lvscan | grep media | clip
        if expressed in G :lvsize = lvsize*1024
        else lvsize = lvsize
        [lvsize = target_lvsize_media]
  b) is FS @ target size?
       compare  df -m | cut, target_fssize
       if greater then
3) determine state of any creation/resize/removal of EXT3FS
  a) is LV @ target size (or removed)?
        lvsize =  lvscan | grep media | clip
        if expressed in G :lvsize = lvsize*1024
        else lvsize = lvsize
        [lvsize = target_lvsize_media]
  b) is FS created?
  c) is FS @ target size?
  d) is fstab entry present(or removed)?
  e) is EXT3FS mounted(or unmounted)?
4) determine state of any resize of EXT3FS
  a) is LV @ target size?
        lvsize =  lvscan | grep media | clip
        if expressed in G :lvsize = lvsize*1024
        else lvsize = lvsize
        [lvsize = target_lvsize_media]
  b) is FS @ target size?
5) determine state of any resize of SWAP
  a) is LV @ target size?
        lvsize =  lvscan | grep media | clip
        if expressed in G :lvsize = lvsize*1024
        else lvsize = lvsize
        [lvsize = target_lvsize_media]
  b) is swap initialized?
          swapon /path
          stderr = -1 FAIL (most likely due to not being intialized)
