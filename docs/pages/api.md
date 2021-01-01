# API

## Prepare

### `prepare(options)`

* Options `<Object>`
	* mongoUri `<string>`
		* MongoDB URI to download indexes from.
	* collections `<string[]>`
		* Collections to download indexes for.

## `Analyse`

### `analyse.query(options)`

* Options `<Object>`
	* collection `<string>`
		* Name of the collection being queried.
	* query `<Object>`
		* The MongoDB query object.
	* sort `<Object>`
		* Optional. The MongoDB sort object.
	* projection `<Object>`
		* Optional. The MongoDB projection object.

### `analyse.aggregation(options)`
* Options `<Object>`
	* collection `<string>`
		* Name of the collection being queried.
	* pipeline `<Object[]>`
		* An array containing MongoDB pipeline stages.

## Report

### `report(options)`
* Options `<Object>`
	* reporter `'text'`
		* The format of the output returned after the analysis. 

---
<br/>