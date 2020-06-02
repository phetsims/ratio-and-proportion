// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import NumberPicker from '../../../../scenery-phet/js/NumberPicker.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import RatioPointer from '../../common/view/RatioPointer.js';
import RatioRatioAndProportionScreenView from '../../common/view/RatioRatioAndProportionScreenView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class CustomRatioScreenView extends RatioRatioAndProportionScreenView {

  /**
   * @param {RatioRatioAndProportionModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem );

    // Allow us to get the reduced fraction as the initial value of the custom "My Challenge"
    const initialRatioFration = new Fraction( model.leftValueProperty.value * 100, model.rightValueProperty.value * 100 );
    initialRatioFration.reduce();

    const numberatorProperty = new NumberProperty( initialRatioFration.numerator );
    const leftRatioSelector = new VBox( {
      align: 'center',
      spacing: 10,
      children: [
        RatioPointer.createIcon( false, { scale: .8 } ),
        new NumberPicker( numberatorProperty, new Property( new Range( 1, 10 ) ) ) ]
    } );

    const denominatorProperty = new NumberProperty( initialRatioFration.denominator );
    const rightRatioSelector = new VBox( {
      align: 'center',
      spacing: 10,
      children: [
        RatioPointer.createIcon( true, { scale: .8 } ),
        new NumberPicker( denominatorProperty, new Property( new Range( 1, 10 ) ) ) ]
    } );

    Property.multilink( [ numberatorProperty, denominatorProperty ], ( leftValue, rightValue ) => {
      model.ratioProperty.value = leftValue / rightValue;
    } );

    const myChallengeContent = new HBox( {
      spacing: 50,
      children: [ leftRatioSelector, rightRatioSelector ]
    } );
    const myChallengeAccordionBox = new AccordionBox( myChallengeContent, {
      titleNode: new RichText( ratioAndProportionStrings.myChallenge ),
      titleAlignX: 'left',
      contentXMargin: 50,
      contentYMargin: 20

    } );
    this.addChild( myChallengeAccordionBox );

    // static layout
    myChallengeAccordionBox.right = this.gridViewAquaRadioButtonGroup.right = this.resetAllButton.right;
    this.gridViewAquaRadioButtonGroup.bottom = this.resetAllButton.top - 20;
    myChallengeAccordionBox.bottom = this.gridViewAquaRadioButtonGroup.top - 20;
  }
}

ratioAndProportion.register( 'CustomRatioScreenView', CustomRatioScreenView );
export default CustomRatioScreenView;