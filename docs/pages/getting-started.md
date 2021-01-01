# Getting Started

## What does abbot do?

Well to put it simple, it takes your MongoDB queries and tells you what you're doing wrong and how to do it better. 

Abbot does not make any connections to the database during analysis and does not use `$explain` to study execution stats and query plan as these methods, although possible, create too many variables for analysis and make the process very hard to maintain.

After scrutinizing the MongoDB documentation all day to figure out why our queries would perform slowly even with indexes built, we learnt that by following a certain set of practices, siginificant improvements can be made to queries and indexes. So far, we have been able to abstract the validation of these practices into, what we call "suggestion algorithms". These algorithms are atomic checks that are run against every index for each query you provide to Abbot. Reports for these suggestions can be configured to your liking.

## Installation

```
npm i --save @wheredevsdev/abbot
```

## Usage

### Prepare

To use abbot you must prepare a store of indexes of the collections for which you plan to get suggestions for. To do this we provide a [prepare()]() function that downloads the indexes you need.

```js
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

### Analyse

Now abbot will be able to use these downloaded indexes to run your queries against. The [analyse](/api#analyse) object provides two functions for analysis of queries; `analyse.query()` and `analyse.aggregation()`. 

```js
import abbot from "@wheredevsdev/abbot";

const { analyse } = abbot;

function main() {
	analyse.query({
		collection: "unicorns",
		query: {
			age: { $gte: 100 }
		},
		sort: {
			age: -1
		} // optional
	});
	
	analyse.aggregation({
		collection: "dragons",
		pipeline: [/* ... */]
	});
}

main();
```

### Report

As you continue to call various different operations, abbot will store it's suggestions on your local file system. Finally when you choose to generate reports you can run the method [report()](/api#report). 

```js
import abbot from "@wheredevsdev/abbot";

const { analyse, report } = abbot;

function main() {
	analyse.<operation>({ /* options */});

	// ... You can call more operations

	// and finally call
	report({
		reporter: "text"
	});
}

main();
```

## Further Reading

You can view the complete API reference over [here](/api) and you can read more about the concepts applied by abbot to provide its suggestions over [here](/concept).

---

<br />
