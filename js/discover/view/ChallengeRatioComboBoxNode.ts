// Copyright 2020-2022, University of Colorado Boulder

/**
 * This composes a ComboBox to provide a separate PDOM Node as a heading
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ComboBox from '../../../../sun/js/ComboBox.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import selectionArpeggio001_mp3 from '../../../../tambo/sounds/selectionArpeggio001_mp3.js';
import selectionArpeggio004_mp3 from '../../../../tambo/sounds/selectionArpeggio004_mp3.js';
import selectionArpeggio006_mp3 from '../../../../tambo/sounds/selectionArpeggio006_mp3.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import RAPColors from '../../common/view/RAPColors.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import ChallengeComboBoxItem from './ChallengeComboBoxItem.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import RatioDescriber from '../../common/view/describers/RatioDescriber.js';
import Property from '../../../../axon/js/Property.js';
import { Color, Node, NodeOptions } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';

// constants
const SELECTION_SOUND_OPTIONS = {
  initialOutputLevel: 0.4
};

class ChallengeRatioComboBoxNode extends Node {

  // Used to get the names of challenges based on the target ratio, NOTE: lowercase strings are only available in the PDOM (not yet i18n)
  readonly ratioToChallengeNameMap: Map<number, { capitalized: string, lowercase: string }>;
  private comboBox: ComboBox<number>;

  /**
   * @param targetRatioProperty
   * @param ratioDescriber
   * @param colorProperty
   * @param comboBoxListParent
   * @param comboBoxTandem - Passed directly to comboBox; keep out of options to prevent instrumenting this intermediate Node.
   * @param [options]
   */
  constructor( targetRatioProperty: NumberProperty, ratioDescriber: RatioDescriber, colorProperty: Property<Color | string>,
               comboBoxListParent: Node, comboBoxTandem: Tandem, options?: Omit<NodeOptions, 'children'> ) {

    super( options );

    // sound generators
    const soundGenerators = [];
    soundGenerators.push( new SoundClip( selectionArpeggio001_mp3, SELECTION_SOUND_OPTIONS ) );
    soundGenerators.push( new SoundClip( selectionArpeggio004_mp3, SELECTION_SOUND_OPTIONS ) );
    soundGenerators.push( new SoundClip( selectionArpeggio006_mp3, SELECTION_SOUND_OPTIONS ) );
    soundGenerators.forEach( sg => { soundManager.addSoundGenerator( sg ); } );

    this.ratioToChallengeNameMap = new Map();
    this.ratioToChallengeNameMap.set( 1 / 2, { capitalized: ratioAndProportionStrings.challenge1, lowercase: ratioAndProportionStrings.a11y.discover.challenge1Lowercase } );
    this.ratioToChallengeNameMap.set( 1 / 3, { capitalized: ratioAndProportionStrings.challenge2, lowercase: ratioAndProportionStrings.a11y.discover.challenge2Lowercase } );
    this.ratioToChallengeNameMap.set( 3 / 4, { capitalized: ratioAndProportionStrings.challenge3, lowercase: ratioAndProportionStrings.a11y.discover.challenge3Lowercase } );

    const comboBoxHeading = new Node( {
      innerContent: ratioAndProportionStrings.challengeRatio,
      tagName: 'h3'
    } );
    this.comboBox = new ComboBox( [
      new ChallengeComboBoxItem( this.ratioToChallengeNameMap.get( 1 / 2 )!.capitalized, RAPColors.discoverChallenge1Property.value, 1 / 2, targetRatioProperty, colorProperty, {
        soundPlayer: soundGenerators[ 0 ],
        a11yLabel: ratioAndProportionStrings.challenge1,
        tandemName: 'challenge1Item'
      } ),
      new ChallengeComboBoxItem( this.ratioToChallengeNameMap.get( 1 / 3 )!.capitalized, RAPColors.discoverChallenge2Property.value, 1 / 3, targetRatioProperty, colorProperty, {
        soundPlayer: soundGenerators[ 1 ],
        a11yLabel: ratioAndProportionStrings.challenge2,
        tandemName: 'challenge2Item'
      } ),
      new ChallengeComboBoxItem( this.ratioToChallengeNameMap.get( 3 / 4 )!.capitalized, RAPColors.discoverChallenge3Property.value, 3 / 4, targetRatioProperty, colorProperty, {
        soundPlayer: soundGenerators[ 2 ],
        a11yLabel: ratioAndProportionStrings.challenge3,
        tandemName: 'challenge3Item'
      } )
    ], targetRatioProperty, comboBoxListParent, {
      helpText: ratioAndProportionStrings.a11y.discover.challengesHelpText,
      comboBoxVoicingHintResponse: ratioAndProportionStrings.a11y.discover.challengesHelpText,
      comboBoxVoicingContextResponse: () => ratioDescriber.getProximityToNewChallengeRatioSentence(),
      maxWidth: 300, // empirically determined

      // phet-io
      tandem: comboBoxTandem
    } );

    const proximityToRatioUtterance = new Utterance();
    targetRatioProperty.lazyLink( () => {
      proximityToRatioUtterance.alert = ratioDescriber.getProximityToNewChallengeRatioSentence();
      this.alertDescriptionUtterance( proximityToRatioUtterance );
    } );

    this.children = [
      comboBoxHeading,
      this.comboBox
    ];

    this.pdomOrder = [ comboBoxHeading, this.comboBox ];
  }

  hideListBox(): void {
    this.comboBox.hideListBox();
  }
}

ratioAndProportion.register( 'ChallengeRatioComboBoxNode', ChallengeRatioComboBoxNode );
export default ChallengeRatioComboBoxNode;