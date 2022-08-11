// Copyright 2022, University of Colorado Boulder

/**
 * Options to control how MediaPipe can be used in the sim.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class MediaPipeOptions {
  public xAxisFlippedProperty = new BooleanProperty( false );
  public yAxisFlippedProperty = new BooleanProperty( false );
}

const mediaPipeOptions = new MediaPipeOptions();
ratioAndProportion.register( 'mediaPipeOptions', mediaPipeOptions );
export default mediaPipeOptions;