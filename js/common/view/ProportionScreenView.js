// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ProportionConstants from '../../common/ProportionConstants.js';
import ProportionFitnessSoundGenerator from '../../common/view/ProportionFitnessSoundGenerator.js';
import ProportionMarkerInput from '../../common/view/ProportionMarkerInput.js';
import proportion from '../../proportion.js';

class ProportionScreenView extends ScreenView {

  /**
   * @param {BarModel} model
   * @param {Node} leftNode
   * @param {Node} rightNode
   * @param {Object} [options]
   */
  constructor( model, leftNode, rightNode, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( options );

    this.markerInput = new ProportionMarkerInput( model );

    this.proportionFitnessSoundGenerator = new ProportionFitnessSoundGenerator(
      model.proportionFitnessProperty,
      model.fitnessRange,
      DerivedProperty.or( [
        leftNode.isBeingInteractedWithProperty,
        rightNode.isBeingInteractedWithProperty,
        this.markerInput.isBeingInteractedWithProperty
      ] ) );
    soundManager.addSoundGenerator( this.proportionFitnessSoundGenerator );

    // @protected - for layout
    this.ratioAquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.ratioProperty, [ {
      node: new RichText( 'Mystery 1' ),
      value: 1 / 2
    }, {
      node: new RichText( 'Mystery 2' ),
      value: 1 / 3
    }, {
      node: new RichText( 'Mystery 3' ),
      value: 1 / 8
    }, {
      node: new RichText( 'Mystery 4' ),
      value: 5 / 6
    } ] );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );

    // layout
    resetAllButton.right = this.layoutBounds.maxX - ProportionConstants.SCREEN_VIEW_X_MARGIN;
    resetAllButton.bottom = this.layoutBounds.maxY - ProportionConstants.SCREEN_VIEW_Y_MARGIN;
    this.ratioAquaRadioButtonGroup.bottom = resetAllButton.top - 30;
    this.ratioAquaRadioButtonGroup.right = resetAllButton.right + 5;

    // children
    this.children = [ this.ratioAquaRadioButtonGroup, resetAllButton, leftNode, rightNode ];

    // accessible order
    this.pdomPlayAreaNode.accessibleOrder = [ leftNode, rightNode, null ]; // markers first is nav order
  }

  /**
   * @param {number} dt
   */
  step( dt ) {
    this.markerInput.step( dt );
    this.proportionFitnessSoundGenerator.step( dt );
  }
}

proportion.register( 'ProportionScreenView', ProportionScreenView );
export default ProportionScreenView;