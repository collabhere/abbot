# Introduction

Abbot is a tool for developers who use MongoDB and want to write more performant queries. 

It offers a programmatic API to analyse whether your queries have index support and if they do then it can provide suggestions to better that support. It also has features to check your aggregation pipeline stage ordering and also provides suggestions to re-order your pipeline.

Abbot is built to work without any connections to a database and was originally built to be introduced into static code analysis stages of CI pipelines. It can also work as a personal tool to check whether you are taking into account all considerations when writing your queries. 

---

We're always opened to squash bugs and add features that would help the community. Feel free to raise an issue or pull request over on [github](https://github.com/wheredevsdev/abbot)
