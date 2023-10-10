# Better Bridgeway Builder

## Purpose

A [Frogger-style game](https://froggerclassic.appspot.com/) to advocate for Building a [Better Bridgeway Blvd.](https://www.betterbridgeway.org/) in Sausalito, California. 


Crossing the Bridgeway Blvd between Richardson and Princess in Sausalito can be difficult. Avoid getting squashed by oncoming cars and bicycles by spending money to improve safety. 

[Play the latest](https://aroller.github.io/better-bridgeway-builder/). 

## Game Levels

The game intends to ramp up the scenarios to increase the challenge with 
intentions to educate the advantages and disadvantages of infrastructure. 

### Existing Infrstructure Levels

Demonstrates the problems with the current configuration (from east/top to west/bottom):
* Northbound Vehicle Travel Lane
* Center turn lane 
* Southbound Vehicle Travel Lane
* Southbound Parking Lane

1. Light traffic with cars only makes it easy to cross the road and learn the controls.
2. Heavy traffic with cars only shows the advantage of the center lane as a refuge island. 
3. Heavy traffic with a slower moving frog is almost impossible to cross the street.  
4. Vehicles now stop for the player when they can be seen to create a more realistic scenario which has its challenges in the next levels.  
5. Parking adds to the challenges. Parked cars block line of sight so cars appear out of thin air once in the lane. 
6. Adding bicycle traffic shows how heavy traffic loses the center lane refuge island since cars pass the bicycles. 
7. Delivery vehicles block the center lane. Crossing close to it makes a vehicles appear and squash the player to explain the importance of sight lines.  
8. Traffic is now heavy and stopped in both directions. The center turn lane allows first responders to travel, but a delivery vehicle blocks the way.  When the first responder is blocked, the player is squashed symbolically linking death to a blocked first responder. 

### Improved Infrastructure Levels

The previous levels showed the challenges with the existing infrastructure.  Now improvements can be made to make it easier to cross the road. 

1. Crosswalk is added, but limited parking removed. A southbound vehicle appears instantly to squash the player in the crosswalk since the parked car blocks the view. 
2. Parking near the crosswalk is removed to match DOT daylighting requirements.
3. Delivery vehicle parks in the center turn lane and the line of sight problem returns to instantly produce a vehicle out of nowhere and squashed players.
4. Rapid flashing beacon is added to warn drivers to stop, but now a delivery driver is squashed delivering goods. 
5. Center turn lane is turned into a refuse island blocking deliveries from happening near the crosswalk.  Traffic clogs up due to slow bicycles and nobody passing in turn lane.
6. Bicycle lanes added to both directions separating bicycle and vehicle traffic.  Deliveries take place in designated parking spots. 
7. Emergency vehicle comes through and vehicles pull into the bicycle lane to allow passing.
8. Southbound bicyclists in the bike lane get doored by a parked car or squashed by cars exiting parking lane.
9.  Bi-directional bicycle lane moved to the east/top side of the street demonstrates the advantages of separating. 
10. Emergency vehicle passes through with northbound vehicles pulling into the bicycle lanes.
11. Emergency vehicle uses the bicycle lanes to pass stopped vehicles blocking the road. 

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
* [Dillon Roller](https://github.com/Dillon-Roller) for rotating the frog in the direction of travel




