// Copyright 2020-2022, University of Colorado Boulder

/**
 * This composes a ComboBox to provide a separate PDOM Node as a heading
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ComboBox from '../../../../sun/js/ComboBox.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import selectionArpeggio001_mp3 from '../../../../tambo/sounds/selectionArpeggio001_mp3.js';
import selectionArpeggio004_mp3 from '../../../../tambo/sounds/selectionArpeggio004_mp3.js';
import selectionArpeggio006_mp3 from '../../../../tambo/sounds/selectionArpeggio006_mp3.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import RAPColors from '../../common/view/RAPColors.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import RatioDescriber from '../../common/view/describers/RatioDescriber.js';
import Property from '../../../../axon/js/Property.js';
import { Color, HBox, Node, NodeOptions, Rectangle, RichText } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';

const SOUND_CLIP_OPTIONS = {
  initialOutputLevel: 0.4
};

// Challenge info needed by ChallengeRatioComboBoxNode
type ChallengeInfo = {
  capitalized: string;
  lowercase: string;
  color: Color;
  soundClip: SoundClip;
  a11yLabel: string;
  tandemName: string;
};

export type RatioToChallengeInfoMap = Map<number, ChallengeInfo>;

class ChallengeRatioComboBoxNode extends Node {

  // Used to get the names of challenges based on the target ratio, NOTE: lowercase strings are only available in the PDOM (not yet i18n)
  public readonly ratioToChallengeInfoMap: RatioToChallengeInfoMap;
  private readonly comboBox: ComboBox<number>;

  /**
   * @param targetRatioProperty
   * @param ratioDescriber
   * @param colorProperty
   * @param comboBoxListParent
   * @param comboBoxTandem - Passed directly to comboBox; keep out of options to prevent instrumenting this intermediate Node.
   * @param [options]
   */
  public constructor( targetRatioProperty: NumberProperty,
                      ratioDescriber: RatioDescriber,
                      colorProperty: Property<Color>,
                      comboBoxListParent: Node,
                      comboBoxTandem: Tandem,
                      options?: StrictOmit<NodeOptions, 'children'> ) {

    super( options );

    this.ratioToChallengeInfoMap = new Map<number, ChallengeInfo>();
    this.ratioToChallengeInfoMap.set( 1 / 2, {
      capitalized: ratioAndProportionStrings.challenge1,
      lowercase: ratioAndProportionStrings.a11y.discover.challenge1Lowercase,
      color: RAPColors.discoverChallenge1Property.value,
      soundClip: new SoundClip( selectionArpeggio001_mp3, SOUND_CLIP_OPTIONS ),
      a11yLabel: ratioAndProportionStrings.challenge1,
      tandemName: 'challenge1Item'
    } );
    this.ratioToChallengeInfoMap.set( 1 / 3, {
      capitalized: ratioAndProportionStrings.challenge2,
      lowercase: ratioAndProportionStrings.a11y.discover.challenge2Lowercase,
      color: RAPColors.discoverChallenge2Property.value,
      soundClip: new SoundClip( selectionArpeggio004_mp3, SOUND_CLIP_OPTIONS ),
      a11yLabel: ratioAndProportionStrings.challenge2,
      tandemName: 'challenge2Item'
    } );
    this.ratioToChallengeInfoMap.set( 3 / 4, {
      capitalized: ratioAndProportionStrings.challenge3,
      lowercase: ratioAndProportionStrings.a11y.discover.challenge3Lowercase,
      color: RAPColors.discoverChallenge3Property.value,
      soundClip: new SoundClip( selectionArpeggio006_mp3, SOUND_CLIP_OPTIONS ),
      a11yLabel: ratioAndProportionStrings.challenge3,
      tandemName: 'challenge3Item'
    } );

    // Add each soundClip to the soundManager.
    for ( const value of this.ratioToChallengeInfoMap.values() ) {
      soundManager.addSoundGenerator( value.soundClip );
    }

    // Set colorProperty to match targetRatioProperty.
    targetRatioProperty.link( targetRatio => {
      const entry = this.ratioToChallengeInfoMap.get( targetRatio );
      assert && assert( entry, `no map entry for targetRatio=${targetRatio}` );
      colorProperty.value = entry!.color;
    } );

    const comboBoxHeading = new Node( {
      innerContent: ratioAndProportionStrings.challengeRatio,
      tagName: 'h3'
    } );

    const comboBoxItems: ComboBoxItem<number>[] = [];
    for ( const [ key, value ] of this.ratioToChallengeInfoMap.entries() ) {
      comboBoxItems.push( createComboBoxItem( key, value ) );
    }

    this.comboBox = new ComboBox( targetRatioProperty, comboBoxItems, comboBoxListParent, {
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

  public hideListBox(): void {
    this.comboBox.hideListBox();
  }
}

function createComboBoxItem( targetRatio: number, challengeInfo: ChallengeInfo ): ComboBoxItem<number> {

  const node = new HBox( {
    spacing: 8,
    children: [
      new Rectangle( 0, 0, 15, 15, { fill: challengeInfo.color } ),
      new RichText( challengeInfo.capitalized ) ]
  } );

  return new ComboBoxItem( node, targetRatio, {
    soundPlayer: challengeInfo.soundClip,
    a11yLabel: challengeInfo.a11yLabel,
    tandemName: challengeInfo.tandemName
  } );
}

ratioAndProportion.register( 'ChallengeRatioComboBoxNode', ChallengeRatioComboBoxNode );
export default ChallengeRatioComboBoxNode;