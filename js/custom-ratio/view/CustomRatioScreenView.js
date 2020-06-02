// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ProportionConstants from '../../common/ProportionConstants.js';
import RatioRatioAndProportionScreenView from '../../common/view/RatioRatioAndProportionScreenView.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class CustomRatioScreenView extends RatioRatioAndProportionScreenView {

  /**
   * @param {RatioRatioAndProportionModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem );

    // static layout
    this.resetAllButton.right = this.layoutBounds.maxX - ProportionConstants.SCREEN_VIEW_X_MARGIN;
    this.resetAllButton.bottom = this.layoutBounds.maxY - ProportionConstants.SCREEN_VIEW_Y_MARGIN;
    this.gridViewAquaRadioButtonGroup.right = this.resetAllButton.right;
    this.gridViewAquaRadioButtonGroup.bottom = this.resetAllButton.top - 20;
  }
}

ratioAndProportion.register( 'CustomRatioScreenView', CustomRatioScreenView );
export default CustomRatioScreenView;