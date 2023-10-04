# Better Bridgeway Builder

## Purpose

A [Frogger-style game](https://froggerclassic.appspot.com/) to advocate for Building a [Better Bridgeway Blvd.](https://www.betterbridgeway.org/) in Sausalito, California. 


Crossing the Bridgeway Blvd between Richardson and Princess in Sausalito can be difficult. Avoid getting squashed by oncoming cars and bicycles by spending money to improve safety. 

[Play the latest](https://aroller.github.io/better-bridgeway-builder/). 


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

### Deployment

Static content is hosted at [Github Pages](https://aroller.github.io/better-bridgeway-builder/) for convenience and cost. 

Deployment is handled by Github Actions pages.yml: `.github/workflows/pages.yml`.  
The action builds the project static pages and deploys the content, currently when committed to the main branch.


## Application Development 

The Frogger-style game consists of three main components:

- `player.ts`: This file defines the player object, which is the being trying to cross the street.
- `street.ts`: This file manages the street, lanes, and obstacles that the player must avoid.
- `index.ts`: This file orchestrates the game and provides access to the `index.html` canvas component.

# Contributions

* Issues currently are disabled since the project is in early development.
* Fork the project and make pull requests.
* It is encouraged to use AI to develop the code, but not a strict requirement.

# Credits

Credit is given at the commit level. The main contributions will be identified on the second line with 

* [ChatGPT 4](https://chat.openai.com/) for product and architecture discussions including code generation for bootstrapping and big refactors. I'm unable to share the link to the discussion.
* [Github Co-Pilot](https://github.com/features/copilot) for actively developing and improving all code. All discussions are happening locally. 
* [Google Bard](https://g.co/bard/share/625bfc03158c) for some product collaboration and code discussions.




