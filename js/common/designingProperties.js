// Copyright 2020, University of Colorado Boulder

/**
 * Global Properties meant to be temporary for adjusting different design options before implementing a single one.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import ratioAndProportion from '../ratioAndProportion.js';
import CursorDisplay from './CursorDisplay.js';

class DesigningProperties {

  constructor() {

    // global Property for selecting proportion "fitness" sounds, this is temporary, see https://github.com/phetsims/ratio-and-proportion/issues/9
    this.proportionFitnessSoundSelectorProperty = new NumberProperty( 5 );

    // global Property for selecting sound when velocities indicate successful ratio movement, this is temporary, see https://github.com/phetsims/ratio-and-proportion/issues/9
    this.velocitySoundSelectorProperty = new NumberProperty( 1 );

    // global Property for selecting sound when staccato-type sound is at the "perfect" ratio, this is temporary, see https://github.com/phetsims/ratio-and-proportion/issues/9
    this.staccatoSuccessSoundSelectorProperty = new NumberProperty( 4 );

    // border and click sounds for the vertical ratio pointer movement, this is temporary, see https://github.com/phetsims/ratio-and-proportion/issues/45
    this.ratioUISoundsEnabledProperty = new BooleanProperty( true );

    // @public {Property.<CursorDisplay>} - this is temporary, see https://github.com/phetsims/ratio-and-proportion/issues/17
    this.markerDisplayProperty = new EnumerationProperty( CursorDisplay, CursorDisplay.HAND );
  }
}

const designingProperties = new DesigningProperties();
ratioAndProportion.register( 'designingProperties', designingProperties );
export default designingProperties;
