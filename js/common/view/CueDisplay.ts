// Copyright 2020, University of Colorado Boulder

/**
 * Data type that holds the possible cue visuals that can be displayed for each ratio hand.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import ratioAndProportion from '../../ratioAndProportion.js';

const CueDisplay = Enumeration.byKeys( [ 'NONE', 'W_S', 'UP_DOWN', 'ARROWS' ] );

ratioAndProportion.register( 'CueDisplay', CueDisplay );
export default CueDisplay;
