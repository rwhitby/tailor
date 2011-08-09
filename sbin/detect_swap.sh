#!/bin/sh

swap_mounted = df -h | grep swap

if [ ${SWAP_MOUNTED}$ = '' ]
   echo "swap not mounted"
   exit 1
else
   swapon
	if [ &2 -ne 0 ]
  	   echo "swap not initiallized"
	else
	   mkswap /dev/store/swap
	      if [&2 -ne 0]
                 echo "swap did not initialize"
                 exit 1
              else
                 echo "swap intialized"
              fi
            swapon
              if [ &2 -ne 0 ]
                 echo "swap failed to mount"
                 exit 1
              else
                echo "swap mounted"
              fi
fi
