<h1 align='center'><a href='https://overextended.github.io/oxmysql/'>Documentation</a></h2>


### Introduction
Oxmysql is an alternative to the unmaintained mysql-async/ghmattimysql resources, utilising [node-mysql2](https://github.com/sidorares/node-mysql2) rather than [mysqljs](https://github.com/mysqljs/mysql).  

There are several incompatibilities in the provided API, meaning we cannot guarantee 100% success when using a "drag-and-drop" mentality. For convenience we have included `@oxmysql/lib/MySQL.lua` to replace mysql-async in your resource manifests.

For more information regarding the use of queries, refer to the documentation linked above.

### Features
- Support for URI connection strings and semicolon separated values
- Asynchronous queries utilising mysql2/promises connection pool
- Lua promises in the `wrapper.lua` and `lib/MySQL.lua` files for improved performance when using sync functions
- Javascript async_retval exports when using recent FX Server builds (requires wrapper.lua to be removed)
- Support for placeholder values (named and unnamed) to improve query speed and increase security against SQL injection
- Improved error checking when placeholders and parameters do not match

### Placeholders
This allows queries to be properly prepared and escaped, as well as improve query times for frequently accessed queries.  
The following lines are equivalent.

```
"SELECT group FROM users WHERE identifier = ?", {identifier}  
"SELECT group FROM users WHERE identifier = :identifier", {identifier = identifier}  
"SELECT group FROM users WHERE identifier = @identifier", {['@identifier'] = identifier}
```  

You can also use the following syntax when you are uncertain about the column to select.

```
"SELECT ?? FROM users WHERE identifier = ?", {column, identifier}  
instead of using  
"SELECT "..column.." FROM users WHERE identifier = ?", {identifier}
```  


<br><br><br><br><br>
<hr>
<p align='center'><a href='https://discord.io/overextended'>Discord</a></p>
<hr>