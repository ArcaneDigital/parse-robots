# Parse Robots

Promise based parser for robots.txt files. Allows webcrawlers and other scraping tools to easily check whether they have been blocked via the robots.txt file

## Installation

`npm install parse-robots --save`

## Getting Started

### Fetch from URL

```js
import * as Robots from "parse-robots";

const robot = await Robots("https://facebook.com/robots.txt");
```

### Parse robots.txt as String

```js
import * as Robots from "parse-robots";

const robots_txt = "User-agent: Some-UA\nAllow: /";
const robot = await Robots(robots_txt, true);
```

## Methods

- `isAllowed(path, agent)` - Boolean
- `getSitemaps()` - Array
- `getAgents()` - Array
- `getCrawlDelay(max)` - Integer
- `getHost()` - String

## Examples

```js
const robot = await Robots("https://facebook.com/robots.txt");

robot.isAllowed("/safetycheck/", `Mozilla/5.0 (compatible; SiteBot/1.0)`);      //false
robot.isAllowed("/safetycheck/", `Mozilla/5.0 (compatible; Twitterbot/1.0)`);   //true
robot.isAllowed("/live/", `Mozilla/5.0 (compatible; Twitterbot/1.0)`);          //false
```

## Errors

If the robots file is unreachable (anything besides a 200) Robots will return `null`

```js
const robot = await Robots("https://example.com/robots.txt");

if(!robot) return

robot.isAllowed("/safetycheck/", `Mozilla/5.0 (compatible; SiteBot/1.0)`);      //false
```

## Specs

- [Google Search Robots.txt Specifications](https://developers.google.com/search/reference/robots_txt)
- [Original Web Robots Specification](http://www.robotstxt.org/norobots-rfc.txt)

## Maintainers

- [Jay Goodfellow](https://github.com/jaygoodfellow)
- [Arcane Digital Inc](https://github.com/arcanedigital)

## License

Copyright (c) 2017, Arcane & Jay Goodfellow.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
