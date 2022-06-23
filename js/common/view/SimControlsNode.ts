// Copyright 2022, University of Colorado Boulder

/**
 * PDOM view for interacting with both hands at the same time. This adds a custom interaction, as well as PDOM
 * formatting like adding the "application" role to support alternative input.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { Node, VBox } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPQueryParameters from '../RAPQueryParameters.js';
import RAPMediaPipe from './RAPMediaPipe.js';
import ClapperboardButton from '../../../../scenery-phet/js/ClapperboardButton.js';

class SimControlsNode extends VBox {

  disposeSimControlsNode: () => void;

  public constructor( tandem: Tandem ) {

    const clapperboardButton = new ClapperboardButton( { tandem: tandem.createTandem( 'clapperboardButton' ) } );

    const mediaPipeNode = RAPQueryParameters.mediaPipe ? RAPMediaPipe.getMediaPipeOptionsNode() : new Node();
    super( {
        children: [
          clapperboardButton, mediaPipeNode
        ]
      }
    );
    this.disposeSimControlsNode = () => {
      clapperboardButton.dispose();
    };
  }

  public override dispose(): void {
    this.disposeSimControlsNode();
    super.dispose();
  }
}

ratioAndProportion.register( 'SimControlsNode', SimControlsNode );
export default SimControlsNode;