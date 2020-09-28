// Copyright 2020, University of Colorado Boulder

/**
 * Path for the tick mark icon hand
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class TickMarksIconPath extends Path {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      fill: 'black',
      scale: .45
    }, options );

    const shape = 'm5.25 25.166v5h89v-5zm0 22.334v5h89v-5zm0.5 22.332v5h89v-5z';

    super( shape, options );
  }
}

ratioAndProportion.register( 'TickMarksIconPath', TickMarksIconPath );
export default TickMarksIconPath;