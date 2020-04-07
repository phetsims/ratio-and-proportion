// Copyright 2020, University of Colorado Boulder

/**
 * This file is to prototype mechamarkers as an input controller to proportion
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import proportion from '../../proportion.js';
import MarkerInput from '../../../../tangible/js/MarkerInput.js';

// constants
const BASE_MARKER = 1;
const RATIO_MARKER_A = 2;
const RATIO_MARKER_B = 3;

// tweak this as needed depending on the input camera
const HEIGHT_OF_ONE = 600;

class ProportionMarkerInput extends MarkerInput {

  /**
   * @param {ProportionModel} model
   */
  static init( model ) {

    // initialize Mechamarkers with GFL specific update function.
    super.init( Mechamarkers => {

      // must have the base marker
      if ( Mechamarkers.getMarker( BASE_MARKER ).present ) {

        // handle first ratio marker
        if ( Mechamarkers.getMarker( RATIO_MARKER_A ).present ) {
          const heightOfA = Mechamarkers.getMarker( BASE_MARKER ).center.y - Mechamarkers.getMarker( RATIO_MARKER_A ).center.y;

          // TODO: why clamp at 0/1?
          model.leftValueProperty.value = Utils.clamp( heightOfA / HEIGHT_OF_ONE, 0, 1 );
        }

        // handle second ratio marker
        if ( Mechamarkers.getMarker( RATIO_MARKER_B ).present ) {
          const heightOfB = Mechamarkers.getMarker( BASE_MARKER ).center.y - Mechamarkers.getMarker( RATIO_MARKER_B ).center.y;
          model.rightValueProperty.value = Utils.clamp( heightOfB / HEIGHT_OF_ONE, 0, 1 );
        }
      }
    } );
  }
}

proportion.register( 'ProportionMarkerInput', ProportionMarkerInput );
export default ProportionMarkerInput;