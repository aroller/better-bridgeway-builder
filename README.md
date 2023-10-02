# better-bridgeway-builder

## Purpose
A Frogger-style game to advocate for Building a Better Bridgeway in Sausalito, California. 

Crossing the street can be difficult. Avoid getting squashed by oncoming cars and bicycles. 




## Development

Download Visual Studio Code and open the project in the [Docker Dev Container](https://code.visualstudio.com/docs/devcontainers/containers) when prompted. 


## How to change

First, you can serve a develop server as follows.

```bash
npm install
npm run serve
```

Then, you can access to <http://localhost:8080/>, which will be loaded automatically if file changes detected.

You can modify [src/index.ts](src/index.ts) as you want.

## Build

```bash
npm install
npm run build
```

Then, you get `./dist` directory. The file structure should be the following.

```
dist/
├── bundle.js
├── index.html
└── src
    └── index.d.ts
```

`bundle.js` includes an inline source map.

## Application Development 

The Frogger-style game consists of three main components:

- `player.ts`: This file defines the player object, which is the being trying to cross the street.
- `street.ts`: This file manages the street, lanes, and obstacles that the player must avoid.
- `index.ts`: This file orchestrates the game and provides access to the `index.html` canvas component.