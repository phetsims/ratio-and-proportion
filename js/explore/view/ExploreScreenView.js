// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import challenge1SelectionSound from '../../../sounds/compound-w-low-pass-filter-001_mp3.js';
import challenge2SelectionSound from '../../../sounds/compound-w-low-pass-filter-004_mp3.js';
import challenge3SelectionSound from '../../../sounds/compound-w-low-pass-filter-007_mp3.js';
import RatioAndProportionScreenView from '../../common/view/RatioAndProportionScreenView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import ChallengeComboBoxItem from './ChallengeComboBoxItem.js';
import ExploreScreenSummaryNode from './ExploreScreenSummaryNode.js';

// constants
const SELECTION_SOUND_OPTIONS = {
  initialOutputLevel: 0.5
};

class ExploreScreenView extends RatioAndProportionScreenView {

  /**
   * @param {ExploreModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem );

    const comboBoxListParent = new Node();

    // sound generators
    const soundGenerators = [];
    soundGenerators.push( new SoundClip( challenge1SelectionSound, SELECTION_SOUND_OPTIONS ) );
    soundGenerators.push( new SoundClip( challenge2SelectionSound, SELECTION_SOUND_OPTIONS ) );
    soundGenerators.push( new SoundClip( challenge3SelectionSound, SELECTION_SOUND_OPTIONS ) );
    soundGenerators.forEach( sg => { soundManager.addSoundGenerator( sg ); } );

    const comboBoxHeading = new Node( {
      innerContent: ratioAndProportionStrings.a11y.explore.ratioChallenges,
      tagName: 'h3'
    } );
    const comboBox = new ComboBox( [
      new ChallengeComboBoxItem( ratioAndProportionStrings.challenge1, 'green', 1 / 2, {
        soundPlayer: soundGenerators[ 0 ],
        a11yLabel: ratioAndProportionStrings.challenge1
      } ),
      new ChallengeComboBoxItem( ratioAndProportionStrings.challenge2, 'blue', 1 / 3, {
        soundPlayer: soundGenerators[ 1 ],
        a11yLabel: ratioAndProportionStrings.challenge2
      } ),
      new ChallengeComboBoxItem( ratioAndProportionStrings.challenge3, 'magenta', 3 / 4, {
        soundPlayer: soundGenerators[ 2 ],
        a11yLabel: ratioAndProportionStrings.challenge3
      } )
    ], model.ratioProperty, comboBoxListParent, {
      helpText: ratioAndProportionStrings.a11y.explore.challengesHelpText
    } );

    // children
    this.addChild( comboBoxHeading );
    this.addChild( comboBox );
    this.addChild( comboBoxListParent );

    this.pdomPlayAreaNode.accessibleOrder = this.pdomPlayAreaNode.accessibleOrder.concat( [ comboBoxHeading, comboBox, comboBoxListParent ] );

    // set this after the supertype has initialized the view code needed to create the screen summary
    this.setScreenSummaryContent( new ExploreScreenSummaryNode(
      model.ratioFitnessProperty,
      model.leftValueProperty,
      model.rightValueProperty,
      this.gridViewProperty,
      this.ratioDescriber
    ) );

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