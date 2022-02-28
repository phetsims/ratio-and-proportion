// Copyright 2021-2022, University of Colorado Boulder

/**
 * Class responsible for changing the background color based on fitness. It also contains the associated description
 * logic for describing the color.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import Property from '../../../../axon/js/Property.js';
import rapConstants from '../rapConstants.js';
import RAPColors from './RAPColors.js';
import { Color } from '../../../../scenery/js/imports.js';
import Utils from '../../../../dot/js/Utils.js';
import RAPModel from '../model/RAPModel.js';

// constants
const BACKGROUND_COLOR_STRINGS = [
  ratioAndProportionStrings.a11y.backgroundColor.notGreen,
  ratioAndProportionStrings.a11y.backgroundColor.lightestGreen,
  ratioAndProportionStrings.a11y.backgroundColor.veryLightGreen,
  ratioAndProportionStrings.a11y.backgroundColor.lightGreen,
  ratioAndProportionStrings.a11y.backgroundColor.darkestGreen
];

class BackgroundColorHandler {

  constructor( model: RAPModel, backgroundColorProperty: Property<ColorDef> ) {

    // adjust the background color based on the current ratio fitness
    Property.multilink( [
      model.ratioFitnessProperty,
      model.inProportionProperty
    ], ( fitness: number, inProportion: boolean ) => {
      let color = null;
      if ( inProportion ) {
        color = RAPColors.backgroundInFitnessProperty.value;
      }
      else {
        const interpolatedDistance = ( fitness - rapConstants.RATIO_FITNESS_RANGE.min ) / ( 1 - model.getInProportionThreshold() );
        color = Color.interpolateRGBA(
          RAPColors.backgroundOutOfFitnessProperty.value,
          RAPColors.backgroundInterpolationToFitnessProperty.value,
          Utils.clamp( interpolatedDistance, 0, 1 )
        );
      }

      backgroundColorProperty.value = color;
    } );

  }

  static getCurrentColorRegion( fitness: number, inProportion: boolean ) {
    if ( fitness === rapConstants.RATIO_FITNESS_RANGE.min ) {
      return BACKGROUND_COLOR_STRINGS[ 0 ];
    }
    if ( inProportion ) {
      return BACKGROUND_COLOR_STRINGS[ 4 ];
    }
    const numberOfRegionsLeft = ( BACKGROUND_COLOR_STRINGS.length - 2 );
    const interpolatedIndex = ( rapConstants.RATIO_FITNESS_RANGE.getLength() / numberOfRegionsLeft + fitness ) * numberOfRegionsLeft;
    const region = BACKGROUND_COLOR_STRINGS[ Math.floor( interpolatedIndex ) ];
    assert && assert( region, 'region expected' );
    return region;
  }
}

ratioAndProportion.register( 'BackgroundColorHandler', BackgroundColorHandler );
export default BackgroundColorHandler;