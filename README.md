# `abbot`

MongoDB query and index analysis with suggestions to make your queries faster.

## How `abbot` works

Abbot does not make any connections to the database during analysis and does not use `$explain` to study execution stats and query plan as these methods, although possible, create too many variables for analysis and make the process very hard to maintain. After making the MongoDB documentation our daily work bible, we learnt that by following a certain set of practices, siginificant improvements can be made to queries and indexes. So far, we have been able to abstract the validation of these practices into, what we call "suggestion algorithms". These algorithms are atomic checks that are run against every index for each query you provide to Abbot. Reports for these suggestions can be configured to your liking.

## How to use

**Install**

**Note: Not yet published. Clone and use npm-link.**

```bash
npm install @wheredevsdev/abbot
```

**Usage**

1. Preparing a store of indexes for abbot to use for analysis.
	```ts
	import abbot from "@wheredevsdev/abbot";

	const { prepare } = abbot;

	async function main() {
		await prepare({
			uri: "mongodb://localhost:27017/db",
			collections: ["unicorns", "dragons"]
		});
	}

	main();
	```

2. Running your queries and aggregations through our suggestion algorithms

	```ts
	import abbot from "@wheredevsdev/abbot";

	const { analyse } = abbot;

	function main() {
		analyse.query({
			collection: "unicorns",
			query: {},
			sort: {},
			projection: {}
		});
		
		analyse.aggregation({
			collection: "dragons",
			pipeline: [/* ... */]
		});

	}

	main();
	```

3. Generating reports for your queries

	```ts
	import abbot from "@wheredevsdev/abbot";

	const { analyse } = abbot;

	function main() {
		analyse.<operation>({ /* options */});

		// ... You can call more operations

		// and finally call
		analyse.report({
			reporter: "text"
		});
	}

	main();
	```
	
## API Reference & Documentation

Complete reference available in [wiki](#). *(Currently WIP)*

