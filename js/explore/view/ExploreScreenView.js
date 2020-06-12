// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import RatioAndProportionScreenView from '../../common/view/RatioAndProportionScreenView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import ChallengeComboBoxItem from './ChallengeComboBoxItem.js';

class ExploreScreenView extends RatioAndProportionScreenView {

  /**
   * @param {ExploreModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem );

    const comboBoxParent = new Node();

    const comboBox = new ComboBox( [
      new ChallengeComboBoxItem( 'Challenge 1', 'green', 1 / 2, { a11yLabel: 'Challenge 1' } ),
      new ChallengeComboBoxItem( 'Challenge 2', 'blue', 1 / 3, { a11yLabel: 'Challenge 2' } ),
      new ChallengeComboBoxItem( 'Challenge 3', 'magenta', 3 / 4, { a11yLabel: 'Challenge 3' } )
    ], model.ratioProperty, comboBoxParent, {
      accessibleName: ratioAndProportionStrings.a11y.ratioChallenges
    } );

    // children
    this.addChild( comboBox );
    this.addChild( comboBoxParent );

    // static layout
    comboBox.bottom = this.resetAllButton.top - 140;
    comboBox.right = this.resetAllButton.right + 5;
    this.gridViewRadioButtonGroup.left = comboBox.left;
    this.gridViewRadioButtonGroup.bottom = comboBox.top - 20;
  }
}

ratioAndProportion.register( 'ExploreScreenView', ExploreScreenView );
export default ExploreScreenView;