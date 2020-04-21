// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Util from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import Color from '../../../../scenery/js/util/Color.js';
import ratioAndProportion from '../../ratioAndProportion.js';

/**
 * @constructor
 */
class ProportionModel {

  /**
   * @param {NumberProperty} leftValueProperty
   * @param {NumberProperty} rightValueProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( leftValueProperty, rightValueProperty, tandem, options ) {

    options = merge( {

      // {Color}
      correctColor: new Color( '#639a67' ),
      incorrectColor: new Color( '#FE70D4' )
    }, options );

    // The desired ratio of the left value as compared to the right value. As in 1:2 (initial value).
    this.ratioProperty = new NumberProperty( .5 );
    this.toleranceProperty = new NumberProperty( .05 );

    this.leftValueProperty = leftValueProperty;
    this.rightValueProperty = rightValueProperty;

    const fitnessRange = new Range( 0, 1 );

    // @public {DerivedProperty.<number>}
    // How "correct" the proportion currently is. Can be between 0 and 1, if 1, the proportion of the two values is
    // exactly the value of the ratioProperty. If zero, it is outside the tolerance allowed for the proportion.
    this.proportionFitnessProperty = new DerivedProperty( [
      this.leftValueProperty,
      this.rightValueProperty,
      this.ratioProperty,
      this.toleranceProperty
    ], ( leftValue, rightValue, ratio, tolerance ) => {
      const currentRatio = leftValue / rightValue;
      if ( isNaN( currentRatio ) ) {
        return 0;
      }
      const ratioError = currentRatio - ratio;
      return 1 - Util.clamp( Math.abs( ratioError ) / tolerance, 0, 1 );
    }, {
      isValidValue: value => fitnessRange.contains( value )
    } );

    // @public (read-only) - the Range that the proportionFitnessProperty can be.
    this.fitnessRange = new Range( 0, 1 );

    // @public - based on the proportion fitness
    this.colorProperty = new DerivedProperty( [ this.proportionFitnessProperty ], fitness => {
      return Color.interpolateRGBA( options.incorrectColor, options.correctColor, fitness );
    }, { valueType: Color } );

    this.firstInteractionProperty = new BooleanProperty( true );
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.ratioProperty.reset();
    this.toleranceProperty.reset();
    this.leftValueProperty.reset();
    this.rightValueProperty.reset();
    this.firstInteractionProperty.reset();
  }

}

ratioAndProportion.register( 'ProportionModel', ProportionModel );
export default ProportionModel;