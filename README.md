# `abbot`

MongoDB query and index analysis with suggestions to make your queries faster.

## How `abbot` works

`abbot` does not make any connections to the database during analysis and does not use `$explain` to study execution stats and query plan as these methods, although possible, create too many variables for analysis and make the process very hard to maintain. After making the MongoDB documentation our daily work bible, we learnt that by following a certain set of practices, siginificant improvements can be made to queries and indexes. So far, we have been able to abstract the validation of these practices into, what we call "suggestion algorithms". These algorithms are atomic checks that are run against every index for each query you provide to `abbot`. Reports for these suggestions can be configured to your liking.

## How to use

**Install**

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

	async function main() {
		await analyse.query({
			collection: "unicorns",
			query: {},
			sort: {},
			projection: {}
		});
		
		await analyse.count({
			collection: "dragons",
			query: {},
			sort: {}
		});
		
		await analyse.aggregation({
			collection: "dragons",
			pipeline: [/* ... */]
		});

	}

	main();
	```

3. Generating reports for your algorithms

	```ts
	import abbot from "@wheredevsdev/abbot";

	const { analyse } = abbot;

	async function main() {
		await analyse.<operation>({
			collection: "unicorns",
			query: {},
			sort: {}
		});

		// ... You can call more operations

		// and finally call
		await analyse.report({
			format: "txt",
			type: "file",
			path: "/absolute/path/to/report/destination"
		});
	}

	main();
	```
	
## API Reference

Complete reference available in [wiki](#). *(Currently WIP)*

