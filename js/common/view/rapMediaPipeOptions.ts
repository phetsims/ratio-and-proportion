// Copyright 2022, University of Colorado Boulder

/**
 * Options to control how MediaPipe can be used in the sim.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import MediaPipeOptions from '../../../../tangible/js/mediaPipe/MediaPipeOptions.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class RAPMediaPipeOptions extends MediaPipeOptions {
  public xAxisFlippedProperty = new BooleanProperty( false );
  public yAxisFlippedProperty = new BooleanProperty( false );
}

const rapMediaPipeOptions = new RAPMediaPipeOptions();
ratioAndProportion.register( 'rapMediaPipeOptions', rapMediaPipeOptions );
export default rapMediaPipeOptions;