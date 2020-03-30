// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import ProportionConstants from '../../common/ProportionConstants.js';
import proportion from '../../proportion.js';

class ProportionScreenView extends ScreenView {

  /**
   * @param {ProportionModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( {
      tandem: tandem
    } );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - ProportionConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - ProportionConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );
  }

  /**
   * Resets the view.
   * @public
   */
  reset() {
    //TODO
  }

  /**
   * Steps the view.
   * @param {number} dt - time step, in seconds
   * @public
   */
  step( dt ) {
    //TODO
  }
}

proportion.register( 'ProportionScreenView', ProportionScreenView );
export default ProportionScreenView;