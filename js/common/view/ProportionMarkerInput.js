// Copyright 2020, University of Colorado Boulder

/**
 * This file adds mechamarkers as an input controller to Ratio and Proportion
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import RatioAndProportionQueryParameters from '../RatioAndProportionQueryParameters.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import MarkerInput from '../../../../tangible/js/MarkerInput.js';

// constants
const BASE_MARKER = 1;
const RATIO_MARKER_LEFT = 2;
const RATIO_MARKER_RIGHT = 3;

// "one" here refers to the max value of each ratio half. Their range is from 0 to 1
const HEIGHT_OF_ONE = RatioAndProportionQueryParameters.heightInPixels;

// for clement1 prototype
let angleA = 0;
let angleB = 0;
const adjLen = RatioAndProportionQueryParameters.clement1AdjLen;
const halfHeight = RatioAndProportionQueryParameters.clement1HalfHeight;
let heightA = 0;
let heightB = 0;
let valA = 0;
let valB = 0;

/**
 * This strategy is for a box prototype that was designed with levers and uses some rotation
 * @param {window.Mechamarkers.Marker} leftMarker
 * @param {window.Mechamarkers.Marker} rightMarker
 * @param {window.Mechamarkers.Marker} baseMarker
 * @returns {{left: number, right: number}}
 */
const clement1MarkerInputStrategy = ( leftMarker, rightMarker, baseMarker ) => {

  // LEFT HAND ROTATION TO TRANSLATION
  let corners = leftMarker.allCorners;
  let ydelta = corners[ 0 ].y - corners[ 1 ].y;
  let xdelta = corners[ 0 ].x - corners[ 1 ].x;
  angleA = Math.atan2( -ydelta, -xdelta );
  heightA = adjLen * Math.tan( angleA );
  let pvalA = ( -heightA + halfHeight ) / ( 2 * halfHeight );
  pvalA = pvalA < 0 ? 0 : pvalA > 1 ? 1 : pvalA;
  valA = valA * 0.8 + pvalA * 0.2;

  // RIGHT HAND ROTATION TO TRANSLATION
  corners = rightMarker.allCorners;
  ydelta = corners[ 0 ].y - corners[ 1 ].y;
  xdelta = corners[ 0 ].x - corners[ 1 ].x;
  angleB = Math.atan2( -ydelta, -xdelta );
  heightB = adjLen * Math.tan( angleB );
  let pvalB = ( heightB + halfHeight ) / ( 2 * halfHeight );
  pvalB = pvalB < 0 ? 0 : pvalB > 1 ? 1 : pvalB;
  valB = valB * 0.8 + pvalB * 0.2;
  return {
    left: valA,
    right: valB
  };
};

/**
 * @param {window.Mechamarkers.Marker} leftMarker
 * @param {window.Mechamarkers.Marker} rightMarker
 * @param {window.Mechamarkers.Marker} baseMarker
 * @returns {{left: number, right: number}}
 */
const defaultMarkerInputStrategy = ( leftMarker, rightMarker, baseMarker ) => {

  // TODO: why clamp at 0/1?
  return {
    left: Utils.clamp( Math.abs( baseMarker.center.y - leftMarker.center.y ) / HEIGHT_OF_ONE, 0, 1 ),
    right: Utils.clamp( Math.abs( baseMarker.center.y - rightMarker.center.y ) / HEIGHT_OF_ONE, 0, 1 )
  };
};

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
  }

  /**
   * @public
   */
  step() {

    // This controller needs all three markers
    this.isBeingInteractedWithProperty.value = this.Mechamarkers.getMarker( RATIO_MARKER_LEFT ).present &&
                                               this.Mechamarkers.getMarker( BASE_MARKER ).present &&
                                               this.Mechamarkers.getMarker( RATIO_MARKER_RIGHT ).present;

    if ( this.isBeingInteractedWithProperty.value ) {

      const baseMarker = this.Mechamarkers.getMarker( BASE_MARKER );
      const leftMarker = this.Mechamarkers.getMarker( RATIO_MARKER_LEFT );
      const rightMarker = this.Mechamarkers.getMarker( RATIO_MARKER_RIGHT );

      assert && assert( leftMarker.present && baseMarker.present && rightMarker.present, 'all markers must be present' );

      let values = null;
      if ( RatioAndProportionQueryParameters.useClementPrototype1 ) {
        values = clement1MarkerInputStrategy( leftMarker, rightMarker, baseMarker );
      }
      else {

        // default value calculation strategy from marker input
        values = defaultMarkerInputStrategy( leftMarker, rightMarker, baseMarker );
      }
      this.leftValueProperty.value = values.left;
      this.rightValueProperty.value = values.right;
    }
  }
}

ratioAndProportion.register( 'ProportionMarkerInput', ProportionMarkerInput );
export default ProportionMarkerInput;