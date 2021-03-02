// Copyright 2020, University of Colorado Boulder

/**
 * This file adds mechamarkers as an input controller to Ratio and Proportion
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import MarkerInput from '../../../../tangible/js/MarkerInput.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import RAPQueryParameters from '../RAPQueryParameters.js';

// constants
// Note marker 2 of original aruco doesn't work well when camera is flipped.
const BASE_MARKER = 4;
const RATIO_MARKER_LEFT = 2;
const RATIO_MARKER_RIGHT = 0;

// "one" here refers to the max value of each ratio half. Their range is from 0 to 1
const HEIGHT_OF_ONE = RAPQueryParameters.heightInPixels;

class RAPMarkerInput extends MarkerInput {

  /**
   * @param {Property.<RAPRatioTuple>} ratioTupleProperty
   */
  constructor( ratioTupleProperty ) {
    super();

    // @public (read-only)
    this.isBeingInteractedWithProperty = new BooleanProperty( false );

    // @private
    this.ratioTupleProperty = ratioTupleProperty;
  }

  /**
   * @public
   */
  reset() {
    this.isBeingInteractedWithProperty.reset();
  }

  /**
   * @public
   */
  step() {


    phet.log && phet.log( [
      RATIO_MARKER_LEFT, this.Beholder.getMarker( RATIO_MARKER_LEFT ).present, '\n',
      BASE_MARKER, this.Beholder.getMarker( BASE_MARKER ).present, '\n',
      RATIO_MARKER_RIGHT, this.Beholder.getMarker( RATIO_MARKER_RIGHT ).present, '\n'
    ] );

    // This controller needs all three markers
    this.isBeingInteractedWithProperty.value = this.Beholder.getMarker( RATIO_MARKER_LEFT ).present &&
                                               this.Beholder.getMarker( BASE_MARKER ).present &&
                                               this.Beholder.getMarker( RATIO_MARKER_RIGHT ).present;

    if ( this.isBeingInteractedWithProperty.value ) {
      const baseMarker = this.Beholder.getMarker( BASE_MARKER );
      const leftMarker = this.Beholder.getMarker( RATIO_MARKER_LEFT );
      const rightMarker = this.Beholder.getMarker( RATIO_MARKER_RIGHT );

      assert && assert( leftMarker.present && baseMarker.present && rightMarker.present, 'all markers must be present' );

      const newAntecedent = Utils.clamp( Math.abs( baseMarker.center.y - leftMarker.center.y ) / HEIGHT_OF_ONE, 0, 1 );
      const newConsequent = Utils.clamp( Math.abs( baseMarker.center.y - rightMarker.center.y ) / HEIGHT_OF_ONE, 0, 1 );
      this.ratioTupleProperty.value = new RAPRatioTuple( newAntecedent, newConsequent );
    }
  }
}

ratioAndProportion.register( 'RAPMarkerInput', RAPMarkerInput );
export default RAPMarkerInput;