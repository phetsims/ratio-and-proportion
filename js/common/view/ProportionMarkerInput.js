// Copyright 2020, University of Colorado Boulder

/**
 * This file adds mechamarkers as an input controller to Proportion
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import MarkerInput from '../../../../tangible/js/MarkerInput.js';

// constants
const BASE_MARKER = 1;
const RATIO_MARKER_LEFT = 2;
const RATIO_MARKER_RIGHT = 3;

// tweak this as needed depending on the input camera
const HEIGHT_OF_ONE = 600;

class ProportionMarkerInput extends MarkerInput {

  /**
   * @param {ProportionModel} model
   */
  constructor( model ) {
    super();

    // @public (read-only)
    this.isBeingInteractedWithProperty = new BooleanProperty( false );

    this.isBeingInteractedWithProperty.lazyLink( interactedWith => {
      interactedWith && model.firstInteractionProperty.set( false );
    } );

    // @private
    this.leftValueProperty = model.leftValueProperty;
    this.rightValueProperty = model.rightValueProperty;

    super.beginInput( Mechamarkers => {

      // This controller needs all three markers
      this.isBeingInteractedWithProperty.value = Mechamarkers.getMarker( RATIO_MARKER_LEFT ).present &&
                                                 Mechamarkers.getMarker( BASE_MARKER ).present &&
                                                 Mechamarkers.getMarker( RATIO_MARKER_RIGHT ).present;
    } );
  }

  /**
   * @public
   */
  step() {
    if ( this.isBeingInteractedWithProperty.value ) {
      const baseMarker = this.Mechamarkers.getMarker( BASE_MARKER );
      const leftMarker = this.Mechamarkers.getMarker( RATIO_MARKER_LEFT );
      const rightMarker = this.Mechamarkers.getMarker( RATIO_MARKER_RIGHT );

      assert && assert( leftMarker.present && baseMarker.present && rightMarker.present, 'all markers must be present' );

      // TODO: why clamp at 0/1?
      const heightOfA = baseMarker.center.y - leftMarker.center.y;
      this.leftValueProperty.value = Utils.clamp( heightOfA / HEIGHT_OF_ONE, 0, 1 );

      const heightOfB = baseMarker.center.y - rightMarker.center.y;
      this.rightValueProperty.value = Utils.clamp( heightOfB / HEIGHT_OF_ONE, 0, 1 );
    }
  }
}

ratioAndProportion.register( 'ProportionMarkerInput', ProportionMarkerInput );
export default ProportionMarkerInput;