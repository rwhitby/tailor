APPID = org.webosinternals.tailor

package: clean
	palm-package . package node
	ar q ${APPID}_*.ipk pmPostInstall.script
	ar q ${APPID}_*.ipk pmPreRemove.script

test: package
	- palm-install -r ${APPID}
	novacom run file://usr/bin/luna-send -- -n 1 palm://com.palm.systemmanager/clearCache '{}' 
	palm-install ${APPID}_*.ipk
	palm-launch ${APPID}

clean:
	find . -name '*~' -delete
	rm -f ipkgtmp*.tar.gz ${APPID}_*.ipk

clobber: clean
