// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import NumberPicker from '../../../../scenery-phet/js/NumberPicker.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import RatioAndProportionScreenView from '../../common/view/RatioAndProportionScreenView.js';
import RatioHandNode from '../../common/view/RatioHandNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import CreateScreenSummaryNode from './CreateScreenSummaryNode.js';
import GridRangeComboBox from './GridRangeComboBox.js';

const PICKER_SCALE = 1.5;
const ICON_SCALE = .9;

class CreateScreenView extends RatioAndProportionScreenView {

  /**
   * @param {RatioAndProportionModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    const gridRangeProperty = new NumberProperty( 10 );

    super( model, tandem, {
      gridRangeProperty: gridRangeProperty
    } );

    // Allow us to get the reduced fraction as the initial value of the custom "My Challenge"
    const initialRatioFration = new Fraction( model.leftValueProperty.value * 100, model.rightValueProperty.value * 100 );
    initialRatioFration.reduce();

    const numeratorProperty = new NumberProperty( initialRatioFration.numerator );
    const numeratorNumberPicker = new NumberPicker( numeratorProperty, new Property( new Range( 1, 10 ) ), {
      scale: PICKER_SCALE,
      center: Vector2.ZERO,
      accessibleName: ratioAndProportionStrings.a11y.leftHand
    } );
    const leftRatioSelector = new VBox( {
      align: 'origin',
      spacing: 10,
      children: [
        RatioHandNode.createIcon( false, this.gridViewProperty, { scale: ICON_SCALE } ),
        new Node( { children: [ numeratorNumberPicker ] } ) ]
    } );

    const denominatorProperty = new NumberProperty( initialRatioFration.denominator );
    const denominatorNumberPicker = new NumberPicker( denominatorProperty, new Property( new Range( 1, 10 ) ), {
      scale: PICKER_SCALE,
      center: Vector2.ZERO,
      accessibleName: ratioAndProportionStrings.a11y.rightHand
    } );
    const rightRatioSelector = new VBox( {
      align: 'origin',
      spacing: 10,
      children: [
        RatioHandNode.createIcon( true, this.gridViewProperty, { scale: ICON_SCALE } ),
        new Node( { children: [ denominatorNumberPicker ] } ) ]
    } );

    Property.multilink( [ numeratorProperty, denominatorProperty ], ( leftValue, rightValue ) => {
      model.ratioProperty.value = leftValue / rightValue;
    } );

    const myChallengeContent = new HBox( {
      spacing: 40,
      children: [ leftRatioSelector, rightRatioSelector ]
    } );
    const myChallengeAccordionBox = new AccordionBox( myChallengeContent, {
      titleNode: new RichText( ratioAndProportionStrings.myChallenge, { font: new PhetFont( 20 ) } ),
      accessibleName: ratioAndProportionStrings.myChallenge,
      helpText: ratioAndProportionStrings.a11y.create.myChallengeHelpText,
      titleAlignX: 'left',
      contentXMargin: 26,
      contentYMargin: 15,
      contentYSpacing: 15,

      // Copied from NLCConstants.js, see https://github.com/phetsims/ratio-and-proportion/issues/58#issuecomment-646377333
      cornerRadius: 5,
      buttonXMargin: 8,
      buttonYMargin: 6,
      expandCollapseButtonOptions: {
        touchAreaXDilation: 15,
        touchAreaYDilation: 15,
        mouseAreaXDilation: 5,
        mouseAreaYDilation: 5
      }
    } );
    myChallengeAccordionBox.expandedProperty.value = false;

    const gridRangeComboBoxParent = new Node();

    const gridRangeComboBox = new GridRangeComboBox( gridRangeProperty, gridRangeComboBoxParent, this.gridViewProperty );

    // set this after the supertype has initialized the view code needed to create the screen summary
    this.setScreenSummaryContent( new CreateScreenSummaryNode(
      model.ratioFitnessProperty,
      model.leftValueProperty,
      model.rightValueProperty,
      this.gridViewProperty,
      myChallengeAccordionBox.expandedProperty,
      this.ratioDescriber,
      gridRangeProperty,
      gridRangeComboBox.gridRangeToRangeLabelMap,
      numeratorProperty, denominatorProperty
    ) );

    const lockRatioCheckbox = new Checkbox( new RichText( ratioAndProportionStrings.lockRatio ), model.lockRatioProperty, {
      accessibleName: ratioAndProportionStrings.lockRatio,
      helpText: ratioAndProportionStrings.a11y.lockRatioHelpText
    } );

    // children - remember to not blow away children set by parent
    this.addChild( myChallengeAccordionBox );
    this.addChild( lockRatioCheckbox );
    this.addChild( gridRangeComboBox );
    this.addChild( gridRangeComboBoxParent ); // Should be on top

    // pdom
    this.pdomPlayAreaNode.accessibleOrder = this.pdomPlayAreaNode.accessibleOrder.concat( [
      gridRangeComboBox,
      gridRangeComboBoxParent,
      myChallengeAccordionBox,
      lockRatioCheckbox
    ] );

    // static layout
    lockRatioCheckbox.right = gridRangeComboBox.right = myChallengeAccordionBox.right = this.gridViewRadioButtonGroup.right;
    lockRatioCheckbox.bottom = this.resetAllButton.top - 20;
    gridRangeComboBox.top = this.gridViewRadioButtonGroup.bottom + 10;
    myChallengeAccordionBox.top = gridRangeComboBox.bottom + 30;

    // @private
    this.resetCreateScreenView = () => {
      numeratorProperty.reset();
      denominatorProperty.reset();
    };
  }

  /**
   * @public
   * @override
   */
  reset() {
    this.resetCreateScreenView();
    super.reset();
  }
}

ratioAndProportion.register( 'CreateScreenView', CreateScreenView );
export default CreateScreenView;