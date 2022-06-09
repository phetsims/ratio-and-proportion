// Copyright 2022, University of Colorado Boulder

/**
 * To test connecting to a bluetooth device using web bluetooth. Note this uses Promises (as the
 * bluetooth API works with promises) which is very unusual for simulation code.
 *
 * Prototype code for upcoming student studies, see https://github.com/phetsims/ratio-and-proportion/issues/473
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import Utils from '../../../../dot/js/Utils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Property from '../../../../axon/js/Property.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';

const FONT = new PhetFont( { size: 16, weight: 'bold' } );

export type HandSide = 'left' | 'right';

class RatioAndProportionBluetoothButton extends TextPushButton {

  /**
   * @param tupleProperty
   * @param handSide -
   * @param tandem
   */
  public constructor( tupleProperty: Property<RAPRatioTuple>, handSide: HandSide, tandem: Tandem ) {

    // TODO: Handle when device does not support bluetooth with bluetooth.getAvailability.
    // TODO: Handle when browser does not support bluetooth, presumablue !navigator.bluetooth

    const deviceName = handSide === 'left' ? 'nrf52L' : 'nrf52R';

    super( 'Search for device', {
      textNodeOptions: { font: FONT },
      listener: async () => {
        await this.requestDevice( { filters: [ { name: deviceName } ], optionalServices: [ 0xae6f ] }, tupleProperty, 'withAntecedent' );
      }
    } );
  }

  private async requestDevice( bluetoothConfig: any, tupleProperty: Property<RAPRatioTuple>, term: string ): Promise<void> {
    let device: null | any; // should be type BluetoothDevice, but it is too experimental for native types

    // @ts-ignore - navigator.bluetooth is experimental and does not exist in the typing
    if ( navigator.bluetooth ) {

      // @ts-ignore - navigator.bluetooth is experimental and does not exist in the typing
      device = await navigator.bluetooth.requestDevice( bluetoothConfig ).catch( err => {
        device = null;
      } );

      if ( device ) {
        console.log( device.name );
        console.log( device.id );

        // attempt to connect to the GATT Server.
        const gattServer = await device.gatt.connect().catch( ( err: DOMException ) => { console.error( err ); } );
        const primaryService = await gattServer.getPrimaryService( 0xae6f ).catch( ( err: DOMException ) => { console.error( err ); } );
        const characteristic = await primaryService.getCharacteristic( 0x2947 ).catch( ( err: DOMException ) => { console.error( err ); } );
        const notifySuccess = await characteristic.startNotifications().catch( ( err: DOMException ) => { console.error( err ); } );
        notifySuccess.addEventListener( 'characteristicvaluechanged', ( event: any ) => {

          // @ts-ignore
          tupleProperty.value = tupleProperty.value[ term ]( RatioAndProportionBluetoothButton.handleCharacteristicValueChanged( event ) );
        } );

        // At this time we can assume that connections are successful
        console.log( 'connection successful' );
      }
    }
  }

  /**
   * Respond to a characteristicvaluechanged event.
   * TODO: Implement this function. This is the main event we get when we receive new data from the device.
   */
  private static handleCharacteristicValueChanged( event: Event ): number {
    if ( event.target ) {

      // @ts-ignore
      // console.log( event.target.value.getUint8( 0 ) );
      console.log( event.target.value.getFloat32( 0, true ) );

      // @ts-ignore
      let floatValue = event.target.value.getFloat32( 0, true );
      floatValue = Utils.toFixed( floatValue, 4 ); //rounding to 4 decimal places.

      return Utils.clamp( floatValue / 100, 0, 1 );
    }

    return 0;
  }
}

ratioAndProportion.register( 'RatioAndProportionBluetoothButton', RatioAndProportionBluetoothButton );
export default RatioAndProportionBluetoothButton;
