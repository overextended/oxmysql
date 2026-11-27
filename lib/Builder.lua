local promise = promise
local Await = Citizen.Await
local resourceName = GetCurrentResourceName()

local options = {
	return_callback_errors = false
}

for i = 1, GetNumResourceMetadata(resourceName, 'mysql_option') do
	local option = GetResourceMetadata(resourceName, 'mysql_option', i - 1)
	options[option] = true
end

local function await(fn, query, parameters)
	local p = promise.new()

	fn(nil, query, parameters, function(result, error)
		if error then
			return p:reject(error)
		end

		p:resolve(result)
	end, resourceName, true)

	return Await(p)
end

local type = type
local oxmysql = exports.oxmysql
local null = {}
local Builder = { NULL = null }

local function builderRecord(value, fields, label)
	assert(type(value) == 'table' and getmetatable(value) == nil, 'queryBuilder: ' .. label .. ' must be a plain table')
	for key in pairs(value) do
		assert(fields[key], 'queryBuilder: unsupported ' .. label .. ' field')
	end
	return value
end

local function builderArray(value, label, map, allowEmpty)
	assert(type(value) == 'table' and getmetatable(value) == nil, 'queryBuilder: ' .. label .. ' must be a dense array')
	local length = #value
	local count = 0
	for key in pairs(value) do
		assert(type(key) == 'number' and key >= 1 and key <= length and key % 1 == 0, 'queryBuilder: ' .. label .. ' must be a dense array')
		count = count + 1
	end
	assert(count == length and (allowEmpty or length > 0), 'queryBuilder: ' .. label .. ' must be a dense array with the required elements')
	local result = {}
	for index = 1, length do
		result[index] = map(value[index])
	end
	return result
end

local function builderValue(value)
	local valueType = type(value)
	assert(valueType == 'string' or valueType == 'boolean' or
		(valueType == 'number' and value == value and value ~= math.huge and value ~= -math.huge),
		'queryBuilder: values must be non-null strings, booleans, or finite numbers')
	return value
end

local function identifierPart(part)
	assert(type(part) == 'string' and part:find('%S') and not part:find('[.*?%c]'),
		'queryBuilder: invalid identifier segment')
	return part
end

local function builderValues(values)
	assert(type(values) == 'table' and getmetatable(values) == nil and next(values) ~= nil,
		'queryBuilder: values must be a non-empty plain table of column names and values')
	local result = {}
	for column, value in pairs(values) do
		local key = identifierPart(column)
		if rawequal(value, null) then
			result[key] = { kind = 'null' }
		else
			result[key] = builderValue(value)
		end
	end
	return result
end

local function builderIdentifier(name)
	assert(type(name) == 'string' and #name > 0 and not name:find('^%.') and not name:find('%.$') and not name:find('%.%.'),
		'queryBuilder: expected a non-empty dot-separated identifier')
	local parts = {}
	for part in name:gmatch('[^.]+') do
		parts[#parts + 1] = identifierPart(part)
	end
	return { kind = 'identifier', parts = parts }
end

local function copyIdentifier(value)
	builderRecord(value, { kind = true, parts = true }, 'identifier')
	assert(value.kind == 'identifier', 'queryBuilder: expected identifier kind')
	return { kind = 'identifier', parts = builderArray(value.parts, 'identifier parts', identifierPart) }
end

function Builder.raw(sql, bindings)
	assert(type(sql) == 'string' and sql:find('%S'), 'queryBuilder: raw SQL must be a non-empty string')
	if bindings ~= nil then
		bindings = builderArray(bindings, 'raw bindings', builderValue, true)
		if #bindings == 0 then bindings = nil end
	end
	return { kind = 'raw', sql = sql, bindings = bindings }
end

local function copyRaw(value)
	builderRecord(value, { kind = true, sql = true, bindings = true }, 'raw expression')
	return Builder.raw(value.sql, value.bindings)
end

local function columnExpression(value)
	if type(value) == 'string' then return builderIdentifier(value) end
	if type(value) == 'table' and rawget(value, 'kind') == 'raw' then return copyRaw(value) end
	return copyIdentifier(value)
end

local function aggregateColumn(sql, column)
	builderIdentifier(column)
	return Builder.raw(sql, { column })
end

Builder.fn = {
	unixTimestamp = function(column)
		return { kind = 'function', name = 'unixTimestamp', column = builderIdentifier(column) }
	end,
	count = function(column)
		if column == nil then return Builder.raw('count(*)') end
		return aggregateColumn('count(??)', column)
	end,
	sum = function(column)
		return aggregateColumn('sum(??)', column)
	end,
	max = function(column)
		return aggregateColumn('max(??)', column)
	end,
}

function Builder.as(expression, alias)
	if type(expression) == 'table' and rawget(expression, 'kind') == 'function' then
		builderRecord(expression, { kind = true, name = true, column = true }, 'selection function')
		assert(expression.name == 'unixTimestamp', 'queryBuilder: unsupported selection function')
		expression = { kind = 'function', name = 'unixTimestamp', column = copyIdentifier(expression.column) }
	else
		expression = columnExpression(expression)
	end
	return { kind = 'alias', expression = expression, alias = identifierPart(alias) }
end

local function copySelection(value)
	if type(value) == 'table' and rawget(value, 'kind') == 'alias' then
		builderRecord(value, { kind = true, expression = true, alias = true }, 'aliased selection')
		return Builder.as(value.expression, value.alias)
	end
	return columnExpression(value)
end

local comparisonOperators = { eq = true, ne = true, gt = true, gte = true, lt = true, lte = true, like = true }

local function comparisonPredicate(operator, column, value)
	assert(operator ~= 'like' or type(value) == 'string', 'queryBuilder: like pattern must be a string')
	return { kind = 'comparison', operator = operator, column = columnExpression(column), value = builderValue(value) }
end

local function copyPredicate(value, depth)
	depth = depth or 0
	assert(depth < 64, 'queryBuilder: predicate nesting exceeds 64 levels')
	if type(value) == 'table' and rawget(value, 'kind') == 'raw' then return copyRaw(value) end
	builderRecord(value, { kind = true, operator = true, column = true, value = true, values = true, predicates = true }, 'predicate')
	if value.kind == 'comparison' then
		builderRecord(value, { kind = true, operator = true, column = true, value = true }, 'comparison')
		assert(comparisonOperators[value.operator], 'queryBuilder: unsupported comparison operator')
		return comparisonPredicate(value.operator, value.column, value.value)
	elseif value.kind == 'collection' then
		builderRecord(value, { kind = true, operator = true, column = true, values = true }, 'collection')
		assert(value.operator == 'inArray', 'queryBuilder: unsupported collection operator')
		return { kind = 'collection', operator = 'inArray', column = columnExpression(value.column), values = builderArray(value.values, 'inArray values', builderValue, true) }
	elseif value.kind == 'null' then
		builderRecord(value, { kind = true, operator = true, column = true }, 'null predicate')
		assert(value.operator == 'isNull' or value.operator == 'isNotNull', 'queryBuilder: unsupported null operator')
		return { kind = 'null', operator = value.operator, column = columnExpression(value.column) }
	elseif value.kind == 'group' then
		builderRecord(value, { kind = true, operator = true, predicates = true }, 'group')
		assert(value.operator == 'allOf' or value.operator == 'anyOf', 'queryBuilder: unsupported group operator')
		local predicates = builderArray(value.predicates, value.operator .. ' predicates', function(child)
			return copyPredicate(child, depth + 1)
		end)
		return { kind = 'group', operator = value.operator, predicates = predicates }
	end

	error('queryBuilder: unsupported predicate kind')
end

local function groupPredicate(operator, ...)
	local predicates = { ... }
	assert(select('#', ...) == #predicates, 'queryBuilder: ' .. operator .. ' requires non-nil predicates')
	return { kind = 'group', operator = operator, predicates = builderArray(predicates, operator .. ' predicates', copyPredicate) }
end

Builder.op = {
	inArray = function(column, values)
		return { kind = 'collection', operator = 'inArray', column = columnExpression(column), values = builderArray(values, 'inArray values', builderValue, true) }
	end,
	isNull = function(column)
		return { kind = 'null', operator = 'isNull', column = columnExpression(column) }
	end,
	isNotNull = function(column)
		return { kind = 'null', operator = 'isNotNull', column = columnExpression(column) }
	end,
	allOf = function(...)
		return groupPredicate('allOf', ...)
	end,
	anyOf = function(...)
		return groupPredicate('anyOf', ...)
	end,
}

for operator in pairs(comparisonOperators) do
	Builder.op[operator] = function(column, value)
		return comparisonPredicate(operator, column, value)
	end
end

local builderStates = setmetatable({}, { __mode = 'k' })
local builderMethods = {}
local builderMt = {
	__index = function(_, key)
		assert(builderMethods[key], 'queryBuilder: unsupported builder method ' .. tostring(key))
		return builderMethods[key]
	end,
	__newindex = function() error('queryBuilder: builder state is immutable') end,
	__metatable = false,
}

local function newBuilder(spec)
	local builder = setmetatable({}, builderMt)
	builderStates[builder] = spec
	return builder
end

local function copyState(builder)
	local state = assert(builderStates[builder], 'queryBuilder: expected builder; use colon syntax for chain methods')
	local spec = {}
	for key, value in pairs(state) do spec[key] = value end
	return spec
end

function Builder.table(name)
	return newBuilder({ kind = 'select', from = builderIdentifier(name), columns = '*' })
end

function builderMethods:select(columns)
	local spec = copyState(self)
	spec.columns = builderArray(columns, 'select columns', copySelection)
	return newBuilder(spec)
end

function builderMethods:where(predicate)
	local spec = copyState(self)
	predicate = copyPredicate(predicate)
	if spec.where then
		local predicates = {}
		if spec.where.kind == 'group' and spec.where.operator == 'allOf' then
			for index, child in ipairs(spec.where.predicates) do predicates[index] = child end
		else
			predicates[1] = spec.where
		end
		predicates[#predicates + 1] = predicate
		spec.where = { kind = 'group', operator = 'allOf', predicates = predicates }
	else
		spec.where = predicate
	end
	return newBuilder(spec)
end

function builderMethods:groupBy(...)
	local count = select('#', ...)
	assert(count > 0, 'queryBuilder: groupBy requires at least one column')

	local spec = copyState(self)
	local columns = {}
	for index, column in ipairs(spec.groupBy or {}) do columns[index] = column end
	for index = 1, count do
		columns[#columns + 1] = builderIdentifier(select(index, ...))
	end
	spec.groupBy = columns
	return newBuilder(spec)
end

function builderMethods:orderBy(column, direction)
	if direction == nil then direction = 'asc' end
	assert(direction == 'asc' or direction == 'desc', 'queryBuilder: order direction must be asc or desc')

	local spec = copyState(self)
	local order = {}
	for index, entry in ipairs(spec.orderBy or {}) do order[index] = entry end
	order[#order + 1] = { column = builderIdentifier(column), direction = direction }
	spec.orderBy = order
	return newBuilder(spec)
end

function builderMethods:limit(limit)
	assert(type(limit) == 'number' and limit >= 0 and limit <= 9007199254740991 and limit % 1 == 0,
		'queryBuilder: limit must be a non-negative safe integer')
	local spec = copyState(self)
	spec.limit = limit
	return newBuilder(spec)
end

function builderMethods:allowAll()
	local spec = copyState(self)
	spec.allowAll = true
	return newBuilder(spec)
end

local function executeBuilder(spec, mode, cb)
	if cb ~= nil then
		assert(type(cb) == 'function' or (type(cb) == 'table' and cb.__cfx_functionReference), 'queryBuilder: callback must be a function')
		return oxmysql.queryBuilder(nil, spec, mode, cb, resourceName, options.return_callback_errors)
	end
	return await(oxmysql.queryBuilder, spec, mode)
end

local function selectSpec(builder, first)
	local spec = copyState(builder)
	assert(spec.allowAll == nil, 'queryBuilder: allowAll() is only supported for update and delete')
	spec.from = copyIdentifier(spec.from)
	if spec.columns ~= '*' then
		spec.columns = builderArray(spec.columns, 'select columns', copySelection)
	end
	if spec.where then spec.where = copyPredicate(spec.where) end
	if spec.groupBy then spec.groupBy = builderArray(spec.groupBy, 'groupBy columns', copyIdentifier) end
	if spec.orderBy then
		spec.orderBy = builderArray(spec.orderBy, 'orderBy', function(entry)
			return { column = copyIdentifier(entry.column), direction = entry.direction }
		end)
	end
	if first then spec.limit = math.min(spec.limit or 1, 1) end
	return spec
end

function builderMethods:get(cb)
	return executeBuilder(selectSpec(self), 'query', cb)
end

function builderMethods:first(cb)
	return executeBuilder(selectSpec(self, true), 'single', cb)
end

local function mutationState(builder)
	local spec = copyState(builder)
	assert(spec.columns == '*' and spec.limit == nil, 'queryBuilder: mutations do not support select() or limit()')
	assert(spec.groupBy == nil, 'queryBuilder: mutations do not support groupBy()')
	assert(spec.orderBy == nil, 'queryBuilder: mutations do not support orderBy()')
	return spec
end

function builderMethods:insert(values, cb)
	local state = mutationState(self)
	assert(state.where == nil and state.allowAll == nil, 'queryBuilder: insert does not support where() or allowAll()')
	assert(type(values) == 'table' and getmetatable(values) == nil, 'queryBuilder: insert requires a row or a dense array of rows')
	local rows
	if type(next(values)) == 'number' or rawget(values, 1) ~= nil then
		rows = builderArray(values, 'insert rows', builderValues)
	else
		rows = { builderValues(values) }
	end
	for index = 2, #rows do
		for column in pairs(rows[1]) do
			assert(rows[index][column] ~= nil, 'queryBuilder: insert rows must have the same column names')
		end
		for column in pairs(rows[index]) do
			assert(rows[1][column] ~= nil, 'queryBuilder: insert rows must have the same column names')
		end
	end
	return executeBuilder({ kind = 'insert', into = copyIdentifier(state.from), rows = rows }, 'insert', cb)
end

function builderMethods:upsert(row, updateColumns, cb)
	local state = mutationState(self)
	assert(state.where == nil and state.allowAll == nil, 'queryBuilder: upsert does not support where() or allowAll()')

	local values = builderValues(row)
	local seen = {}
	local columns = builderArray(updateColumns, 'upsert update columns', function(column)
		column = identifierPart(column)
		assert(values[column] ~= nil, 'queryBuilder: upsert update columns must be present in the row')
		assert(not seen[column], 'queryBuilder: upsert update columns must be unique')
		seen[column] = true
		return column
	end)

	local spec = { kind = 'upsert', into = copyIdentifier(state.from), row = values, updateColumns = columns }
	return executeBuilder(spec, 'upsert', cb)
end

local function filteredMutationSpec(builder, kind)
	local state = mutationState(builder)
	assert(state.where ~= nil or state.allowAll == true, 'queryBuilder: ' .. kind .. ' requires a predicate or allowAll()')
	local spec = { kind = kind, table = copyIdentifier(state.from), allowAll = state.allowAll }
	if state.where then spec.where = copyPredicate(state.where) end
	return spec
end

function builderMethods:update(values, cb)
	local spec = filteredMutationSpec(self, 'update')
	spec.values = builderValues(values)
	return executeBuilder(spec, 'update', cb)
end

function builderMethods:delete(cb)
	return executeBuilder(filteredMutationSpec(self, 'delete'), 'delete', cb)
end

_ENV.Builder = Builder
