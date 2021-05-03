/**
 * app.js
 * ======
 * Main file of the application. This file is used to initialize the scroller and imports the visualizations used.
 */

'use strict';

import '../assets/styles/style.scss';

import { scroller } from './scroller';
import stickyBits from 'stickybits'
import { initialize as v1 } from './viz_1_sante';
import { initialize as v2 } from './viz_2-3_eclosions/viz';
//import { initialize as v4 } from './viz_4';
//import { initialize as v5 } from './viz_5';
import { initialize as v7 } from './viz_7_entreprises/viz';
import { initialize as v8 } from './viz_8_anxieteBar';
import { initialize as v9 } from './viz_9_detresse';
//import { initialize as v10 } from './viz_10';
import { initialize as v11 } from './viz_11_feminicides';

import { initialize as vizEmplois} from './viz_6_emplois.js';
import { initialize as vizMaison} from './viz_10_maison.js';

// Fallback for old browsers to support sticky positioning.
let elements = [];
['.viz'].forEach(selector => {
  elements = elements.concat(Array.from(document.querySelectorAll(selector)));
});
stickyBits(elements, { stickyBitStickyOffset: 0 });

// Initializes the scroller and the visualizations.
Promise.all([v1(), v2(), vizEmplois(), v7(), v8(), v9(), vizMaison(), v11()]).then(([callbacksV1,callbacksV2, callbacksUnemployment, callbacksV7,callbacksV8,callbacksV9, callbacksMaison, callbacksV11]) => {
  scroller([callbacksV1, callbacksV2, callbacksUnemployment, callbacksV7, callbacksV8, callbacksV9, callbacksMaison, callbacksV11])
    .initialize();
});
