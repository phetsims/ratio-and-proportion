// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import challenge1SelectionSound from '../../../../tambo/sounds/selection-arpeggio-001_mp3.js';
import challenge2SelectionSound from '../../../../tambo/sounds/selection-arpeggio-004_mp3.js';
import challenge3SelectionSound from '../../../../tambo/sounds/selection-arpeggio-006_mp3.js';
import RatioAndProportionScreenView from '../../common/view/RatioAndProportionScreenView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import ChallengeComboBoxItem from './ChallengeComboBoxItem.js';
import ExploreScreenSummaryNode from './ExploreScreenSummaryNode.js';

// constants
const SELECTION_SOUND_OPTIONS = {
  initialOutputLevel: 0.4
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

    // Used to get the names of challenges based on the target ratio, NOTE: lowercase strings are only available in the PDOM (not yet i18n)
    const ratioToChallengeNameMap = new Map();
    ratioToChallengeNameMap.set( 1 / 2, { capitalized: ratioAndProportionStrings.challenge1, lowercase: ratioAndProportionStrings.a11y.explore.challenge1Lowercase } );
    ratioToChallengeNameMap.set( 1 / 3, { capitalized: ratioAndProportionStrings.challenge2, lowercase: ratioAndProportionStrings.a11y.explore.challenge2Lowercase } );
    ratioToChallengeNameMap.set( 3 / 4, { capitalized: ratioAndProportionStrings.challenge3, lowercase: ratioAndProportionStrings.a11y.explore.challenge3Lowercase } );

    const comboBoxHeading = new Node( {
      innerContent: ratioAndProportionStrings.a11y.explore.ratioChallenges,
      tagName: 'h3'
    } );
    const comboBox = new ComboBox( [
      new ChallengeComboBoxItem( ratioToChallengeNameMap.get( 1 / 2 ).capitalized, new Color( 233, 69, 69 ), 1 / 2, {
        soundPlayer: soundGenerators[ 0 ],
        a11yLabel: ratioAndProportionStrings.challenge1
      } ),
      new ChallengeComboBoxItem( ratioToChallengeNameMap.get( 1 / 3 ).capitalized, new Color( 87, 182, 221 ), 1 / 3, {
        soundPlayer: soundGenerators[ 1 ],
        a11yLabel: ratioAndProportionStrings.challenge2
      } ),
      new ChallengeComboBoxItem( ratioToChallengeNameMap.get( 3 / 4 ).capitalized, new Color( 255, 200, 0 ), 3 / 4, {
        soundPlayer: soundGenerators[ 2 ],
        a11yLabel: ratioAndProportionStrings.challenge3
      } )
    ], model.targetRatioProperty, comboBoxListParent, {
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
      model.targetRatioProperty,
      this.tickMarkViewProperty,
      this.ratioDescriber,
      this.handPositionsDescriber,
      ratioToChallengeNameMap
    ) );

    // layout
    comboBox.left = this.tickMarkViewRadioButtonGroup.left;
    comboBox.top = this.tickMarkViewRadioButtonGroup.bottom + 20;
  }
}

ratioAndProportion.register( 'ExploreScreenView', ExploreScreenView );
export default ExploreScreenView;