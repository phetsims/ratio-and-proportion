// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import ratioAndProportion from '../ratioAndProportion.js';

const CursorDisplay = Enumeration.byKeys( [ 'CIRCLE', 'CROSS', 'HAND' ] );
ratioAndProportion.register( 'CursorDisplay', CursorDisplay );
export default CursorDisplay;