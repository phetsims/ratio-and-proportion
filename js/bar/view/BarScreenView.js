// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import ProportionScreenView from '../../common/view/ProportionScreenView.js';
import proportion from '../../proportion.js';
import DraggableBar from './DraggableBar.js';

class BarScreenView extends ProportionScreenView {

  /**
   * @param {BarModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    const leftBar = new DraggableBar( model.leftValueProperty, model.colorProperty, model.firstInteractionProperty );
    const rightBar = new DraggableBar( model.rightValueProperty, model.colorProperty, model.firstInteractionProperty );

    super( model, leftBar, rightBar, {
      tandem: tandem
    } );

    // layout
    leftBar.right = this.layoutBounds.centerX + -20;
    leftBar.y = this.layoutBounds.bottom - 20;
    rightBar.left = this.layoutBounds.centerX + 20;
    rightBar.y = this.layoutBounds.bottom - 20;
  }
}


proportion.register( 'BarScreenView', BarScreenView );
export default BarScreenView;