# Lambda@edge function controller

Simply manager for Lambda@edge.

## Getting started

```
$ git clone YOUR_REPO_URI
$ cd YOUR_REPO_URI

// Put your GitHub Personal Access Token
$ mv .envrc.example .envrc
$ vim .envrc
export CONVENTIONAL_GITHUB_RELEASER_TOKEN=PUT_YOUR_GITHUB_ACCESS_TOKEN

// Install
$ yarn
or
$ npm install
```


## Commit message rule

The repository runs commitlint.
We have to follow "Conventional Commit" to make a commit message.

https://www.conventionalcommits.org/en/v1.0.0-beta.4/

```bash
$ git commit -m "<type>[optional scope]: <description>

[optional body]

[optional footer]"
```

## Contribution

```bash
// clone
$ git clone git@github.com:hideokamoto/lambda-edge-controller.git
$ cd lambda-edge-controller

// setup
$ yarn

// Unit test
$ yarn test
or
$ yarn run test:watch

// Lint
$ yarn run lint
or
$ yarn run lint --fix

// Build
$ yarn run build

// Rebuild docs
$ yarn run doc
```