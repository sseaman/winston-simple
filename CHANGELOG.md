### v1.0.5 - (2016-10-21)

#### Bug Fixes
* Error when no log level specified  
	If winston-simple was invoked without any log level being set via ```setLevels``` there were multiple
	null exceptions within the code.  This has been fixed and ```winston-simple``` will now simply not log
	if no levels are set