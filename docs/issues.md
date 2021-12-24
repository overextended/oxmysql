---
title: Common issues
---
### Unable to establish a connection
This is usually the result of incorrect database settings or your password containing reserved characters (typically `; , / ? : @ & = + $ #`).
!!! check "Solution"
	Ensure you have entered the correct database settings in the mysql_connection_string convar. You can try using the semicolon-separated format if your password contains reserved characters.

### No such export ... in resource oxmysql
Typically the result of failing to follow instructions.
!!! check "Solution"
	Download the latest release _build_ (not source) of oxmysql, and ensure it is starting before any resources that require it.
