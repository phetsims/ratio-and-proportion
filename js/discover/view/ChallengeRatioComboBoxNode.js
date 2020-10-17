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
import Utterance from '../../../../utterance-queue/js/Utterance.js';
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
   * @param {Object} [options]
   */
  constructor( targetRatioProperty, ratioDescriber, colorProperty, options ) {

    assert && options && assert( !options.children, 'ChallengeRatioComboBoxNode sets its own children.' );

    super( options );

    const comboBoxListParent = new Node();

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
      innerContent: ratioAndProportionStrings.a11y.discover.challengeRatio,
      tagName: 'h3'
    } );
    const comboBox = new ComboBox( [
      new ChallengeComboBoxItem( this.ratioToChallengeNameMap.get( 1 / 2 ).capitalized, new Color( 233, 69, 69 ), 1 / 2, targetRatioProperty, colorProperty, {
        soundPlayer: soundGenerators[ 0 ],
        a11yLabel: ratioAndProportionStrings.challenge1
      } ),
      new ChallengeComboBoxItem( this.ratioToChallengeNameMap.get( 1 / 3 ).capitalized, new Color( 87, 182, 221 ), 1 / 3, targetRatioProperty, colorProperty, {
        soundPlayer: soundGenerators[ 1 ],
        a11yLabel: ratioAndProportionStrings.challenge2
      } ),
      new ChallengeComboBoxItem( this.ratioToChallengeNameMap.get( 3 / 4 ).capitalized, new Color( 255, 200, 0 ), 3 / 4, targetRatioProperty, colorProperty, {
        soundPlayer: soundGenerators[ 2 ],
        a11yLabel: ratioAndProportionStrings.challenge3
      } )
    ], targetRatioProperty, comboBoxListParent, {
      helpText: ratioAndProportionStrings.a11y.discover.challengesHelpText
    } );

    const proximityToRatioUtterance = new Utterance();
    targetRatioProperty.link( () => {
      proximityToRatioUtterance.alert = ratioDescriber.getProximityToChallengeRatioSentence( true );
      phet.joist.sim.utteranceQueue.addToBack( proximityToRatioUtterance );
    } );

    this.children = [
      comboBoxHeading,
      comboBox,
      comboBoxListParent
    ];

    this.accessibleOrder = [ comboBoxHeading, comboBox, comboBoxListParent ];
  }
}

ratioAndProportion.register( 'ChallengeRatioComboBoxNode', ChallengeRatioComboBoxNode );
export default ChallengeRatioComboBoxNode;