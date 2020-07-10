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

    const comboBoxListParent = new Node();

    const comboBoxHeading = new Node( {
      innerContent: ratioAndProportionStrings.a11y.explore.ratioChallenges,
      tagName: 'h3'
    } );
    const comboBox = new ComboBox( [
      new ChallengeComboBoxItem( ratioAndProportionStrings.a11y.explore.challenge1, 'green', 1 / 2, {
        a11yLabel: ratioAndProportionStrings.a11y.explore.challenge1
      } ),
      new ChallengeComboBoxItem( ratioAndProportionStrings.a11y.explore.challenge2, 'blue', 1 / 3, {
        a11yLabel: ratioAndProportionStrings.a11y.explore.challenge2
      } ),
      new ChallengeComboBoxItem( ratioAndProportionStrings.a11y.explore.challenge3, 'magenta', 3 / 4, {
        a11yLabel: ratioAndProportionStrings.a11y.explore.challenge3
      } )
    ], model.ratioProperty, comboBoxListParent, {
      helpText: ratioAndProportionStrings.a11y.explore.challengesHelpText
    } );

    // children
    this.addChild( comboBoxHeading );
    this.addChild( comboBox );
    this.addChild( comboBoxListParent );

    this.pdomPlayAreaNode.accessibleOrder = this.pdomPlayAreaNode.accessibleOrder.concat( [ comboBoxHeading, comboBox, comboBoxListParent ] );

    // @private
    this.layoutExploreScreenView = () => {
      comboBox.left = this.gridViewRadioButtonGroup.left;
      comboBox.top = this.gridViewRadioButtonGroup.bottom + 20;
    };
  }

  /**
   * @param {number} width
   * @param {number} height
   * @override
   * @public
   */
  layout( width, height ) {
    super.layout( width, height );
    this.layoutExploreScreenView();
  }
}

ratioAndProportion.register( 'ExploreScreenView', ExploreScreenView );
export default ExploreScreenView;