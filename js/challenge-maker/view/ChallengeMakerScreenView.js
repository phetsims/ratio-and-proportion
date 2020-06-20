// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import NumberPicker from '../../../../scenery-phet/js/NumberPicker.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import GridView from '../../common/view/GridView.js';
import RatioAndProportionScreenView from '../../common/view/RatioAndProportionScreenView.js';
import RatioHandNode from '../../common/view/RatioHandNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class ChallengeMakerScreenView extends RatioAndProportionScreenView {

  /**
   * @param {RatioAndProportionModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    const gridBaseUnitProperty = new NumberProperty( 10 );

    super( model, tandem, {
      gridBaseUnitProperty: gridBaseUnitProperty
    } );

    // Allow us to get the reduced fraction as the initial value of the custom "My Challenge"
    const initialRatioFration = new Fraction( model.leftValueProperty.value * 100, model.rightValueProperty.value * 100 );
    initialRatioFration.reduce();

    const numberatorProperty = new NumberProperty( initialRatioFration.numerator );
    const leftRatioSelector = new VBox( {
      align: 'center',
      spacing: 10,
      children: [
        RatioHandNode.createIcon( false, this.gridViewProperty, { scale: .8 } ),
        new NumberPicker( numberatorProperty, new Property( new Range( 1, 10 ) ), { scale: 1.2 } ) ]
    } );

    const denominatorProperty = new NumberProperty( initialRatioFration.denominator );
    const rightRatioSelector = new VBox( {
      align: 'center',
      spacing: 10,
      children: [
        RatioHandNode.createIcon( true, this.gridViewProperty, { scale: .8 } ),
        new NumberPicker( denominatorProperty, new Property( new Range( 1, 10 ) ), { scale: 1.2 } ) ]
    } );

    Property.multilink( [ numberatorProperty, denominatorProperty ], ( leftValue, rightValue ) => {
      model.ratioProperty.value = leftValue / rightValue;
    } );

    const myChallengeContent = new HBox( {
      spacing: 80,
      children: [ leftRatioSelector, rightRatioSelector ]
    } );
    const myChallengeAccordionBox = new AccordionBox( myChallengeContent, {
      titleNode: new RichText( ratioAndProportionStrings.myChallenge ),
      titleAlignX: 'left',
      contentXMargin: 60,
      contentYMargin: 15,
      contentYSpacing: 15
    } );
    this.addChild( myChallengeAccordionBox );


    const gridBaseUnitComboBoxParent = new Node();

    const gridBaseUnitComboBox = new ComboBox( [
      new ComboBoxItem( new RichText( '0 to 10' ), 10, { a11yLabel: '0 to 10' } ),
      new ComboBoxItem( new RichText( '0 to 20' ), 20, { a11yLabel: '0 to 20' } ),
      new ComboBoxItem( new RichText( '0 to 30' ), 30, { a11yLabel: '0 to 30' } )
    ], gridBaseUnitProperty, gridBaseUnitComboBoxParent, {
      labelNode: new RichText( 'Grid Range:', { font: new PhetFont( 22 ) } ),
      accessibleName: 'Grid Range' // TODO: i18n
    } );

    // Hide the base unit selection unless you can see units in the grid.
    this.gridViewProperty.link( gridView => {
      gridBaseUnitComboBox.visible = GridView.displayUnits( gridView );
    } );

    // children
    this.addChild( gridBaseUnitComboBox );
    this.addChild( gridBaseUnitComboBoxParent );

    // static layout
    gridBaseUnitComboBox.bottom = this.resetAllButton.top - 140;
    gridBaseUnitComboBox.right = this.resetAllButton.right + 5;

    // static layout
    myChallengeAccordionBox.right = this.resetAllButton.right;
    this.gridViewRadioButtonGroup.left = gridBaseUnitComboBox.left = myChallengeAccordionBox.left;

    myChallengeAccordionBox.bottom = this.resetAllButton.top - 20;
    gridBaseUnitComboBox.bottom = myChallengeAccordionBox.top - 20;
    this.gridViewRadioButtonGroup.bottom = gridBaseUnitComboBox.top - 20;

    // @private
    this.resetChallengeMakerScreenView = () => {
      numberatorProperty.reset();
      denominatorProperty.reset();
    };
  }

  /**
   * @public
   * @override
   */
  reset() {
    this.resetChallengeMakerScreenView();
    super.reset();
  }
}

ratioAndProportion.register( 'ChallengeMakerScreenView', ChallengeMakerScreenView );
export default ChallengeMakerScreenView;