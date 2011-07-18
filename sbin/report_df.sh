#!/bin/sh

df -h | grep "/media/internal" 

if [-d "/media/ext3fs"]
   df -h | grep "/media/ext3fs"
else 
   echo "0"
fi


