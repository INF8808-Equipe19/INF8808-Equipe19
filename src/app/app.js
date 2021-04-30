/**
 * app.js
 * ======
 * Main file of the application. This file is used to initialize the scroller and imports the visualizations used.
 */

'use strict';

import '../assets/styles/style.scss';

import { scroller } from './scroller';
import stickyBits from 'stickybits'
import { initialize as v1 } from './viz_1';
import { initialize as v2 } from './viz_2-3_eclosions/viz';
//import { initialize as v4 } from './viz_4';
//import { initialize as v5 } from './viz_5';
import { initialize as v7 } from './viz_7_entreprises/viz';
import { initialize as v8 } from './viz_8';
import { initialize as v9 } from './viz_9';
//import { initialize as v10 } from './viz_10';
import { initialize as v11 } from './viz_11';

// Fallback for old browsers to support sticky positioning.
let elements = [];
['.viz'].forEach(selector => {
  elements = elements.concat(Array.from(document.querySelectorAll(selector)));
});
stickyBits(elements, { stickyBitStickyOffset: 0 });

// Initializes the scroller and the visualizations.
Promise.all([v1(),v2(),v7(),v8(),v9(),v11()]).then(([callbacksV1,callbacksV2,callbacksV7,callbacksV8,callbacksV9,callbacksV11]) => {
  scroller([callbacksV1,callbacksV2,callbacksV7,callbacksV8,callbacksV9,callbacksV11])
    .initialize();
});
