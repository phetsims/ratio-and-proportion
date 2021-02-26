// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import challenge1SelectionSound from '../../../../tambo/sounds/selection-arpeggio-001_mp3.js';
import challenge2SelectionSound from '../../../../tambo/sounds/selection-arpeggio-004_mp3.js';
import challenge3SelectionSound from '../../../../tambo/sounds/selection-arpeggio-006_mp3.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import RAPColorProfile from '../../common/view/RAPColorProfile.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import ChallengeComboBoxItem from './ChallengeComboBoxItem.js';

// constants
const SELECTION_SOUND_OPTIONS = {
  initialOutputLevel: 0.4
};

class ChallengeRatioComboBoxNode extends Node {

  /**
   * @param {NumberProperty} targetRatioProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {Property.<Color>} colorProperty
   * @param {Node} comboBoxListParent
   * @param {Tandem} comboBoxTandem - to pass directly to the comboBox
   * @param {Object} [options]
   */
  constructor( targetRatioProperty, ratioDescriber, colorProperty, comboBoxListParent, comboBoxTandem, options ) {

    assert && options && assert( !options.children, 'ChallengeRatioComboBoxNode sets its own children.' );

    super( options );


    // sound generators
    const soundGenerators = [];
    soundGenerators.push( new SoundClip( challenge1SelectionSound, SELECTION_SOUND_OPTIONS ) );
    soundGenerators.push( new SoundClip( challenge2SelectionSound, SELECTION_SOUND_OPTIONS ) );
    soundGenerators.push( new SoundClip( challenge3SelectionSound, SELECTION_SOUND_OPTIONS ) );
    soundGenerators.forEach( sg => { soundManager.addSoundGenerator( sg ); } );

    // @public (read-only) Used to get the names of challenges based on the target ratio, NOTE: lowercase strings are only available in the PDOM (not yet i18n)
    this.ratioToChallengeNameMap = new Map();
    this.ratioToChallengeNameMap.set( 1 / 2, { capitalized: ratioAndProportionStrings.challenge1, lowercase: ratioAndProportionStrings.a11y.discover.challenge1Lowercase } );
    this.ratioToChallengeNameMap.set( 1 / 3, { capitalized: ratioAndProportionStrings.challenge2, lowercase: ratioAndProportionStrings.a11y.discover.challenge2Lowercase } );
    this.ratioToChallengeNameMap.set( 3 / 4, { capitalized: ratioAndProportionStrings.challenge3, lowercase: ratioAndProportionStrings.a11y.discover.challenge3Lowercase } );

    const comboBoxHeading = new Node( {
      innerContent: ratioAndProportionStrings.challengeRatio,
      tagName: 'h3'
    } );
    this.comboBox = new ComboBox( [
      new ChallengeComboBoxItem( this.ratioToChallengeNameMap.get( 1 / 2 ).capitalized, RAPColorProfile.discoverChallenge1Property.value, 1 / 2, targetRatioProperty, colorProperty, {
        soundPlayer: soundGenerators[ 0 ],
        a11yLabel: ratioAndProportionStrings.challenge1
      } ),
      new ChallengeComboBoxItem( this.ratioToChallengeNameMap.get( 1 / 3 ).capitalized, RAPColorProfile.discoverChallenge2Property.value, 1 / 3, targetRatioProperty, colorProperty, {
        soundPlayer: soundGenerators[ 1 ],
        a11yLabel: ratioAndProportionStrings.challenge2
      } ),
      new ChallengeComboBoxItem( this.ratioToChallengeNameMap.get( 3 / 4 ).capitalized, RAPColorProfile.discoverChallenge3Property.value, 3 / 4, targetRatioProperty, colorProperty, {
        soundPlayer: soundGenerators[ 2 ],
        a11yLabel: ratioAndProportionStrings.challenge3
      } )
    ], targetRatioProperty, comboBoxListParent, {
      helpText: ratioAndProportionStrings.a11y.discover.challengesHelpText,
      maxWidth: 300, // empirically determined

      // phet-io
      tandem: comboBoxTandem
    } );

    const proximityToRatioUtterance = new Utterance();
    targetRatioProperty.lazyLink( () => {
      proximityToRatioUtterance.alert = ratioDescriber.getProximityToNewChallengeRatioSentence();
      phet.joist.sim.utteranceQueue.addToBack( proximityToRatioUtterance );
    } );

    this.children = [
      comboBoxHeading,
      this.comboBox
    ];

    this.pdomOrder = [ comboBoxHeading, this.comboBox ];
  }

  /**
   * @public
   */
  hideListBox() {
    this.comboBox.hideListBox();
  }
}

ratioAndProportion.register( 'ChallengeRatioComboBoxNode', ChallengeRatioComboBoxNode );
export default ChallengeRatioComboBoxNode;