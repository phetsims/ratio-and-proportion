# Ratio and Proportion - Implementation Notes

## Multiple modalities listen to the model
Multiple modalities react to the model in different ways depending on the different states the model is in (see model.md)

### Out of proportion
* Visual: green gradient (RAPScreenView.js)
* Sound: StaccatoFrequencySoundGenerator.js

### Far from proportion
* Description: some distances still provide feedback in this state, but there is not sound or visual feedback.

### In Proportion
* Visual: dark green (RAPScreenView.js)
* Sound: "success ding" (`InProportionSoundGenerator.js`)

#### In Proportion when one or more values are below "small" threshold (aka half a default tick mark)
In this mode, the model says we aren't in Proportion, instead we are just a hair outside of it
* Visual: a hair lighter than the dark green for normal in proportion
* No in-proportion sound ever plays
* No Moving in Proportion Sound (choir)

### Moving in Proportion (in proportion + moving in direction)
* Moving in Proportion Sound: choir (>.8 fitness + velocity threshold passed for both hands) (`MovingInProportionSoundGenerator.js`)
* Visual: dark green
* Success Sound: "success ringing ding/chord"

## Dynamic Layout

This sim is more vertically oriented than most, and as a result, a lot of visual layout changes based on the aspect 
ratio. This is chiefly centered around the ratio hands having the maximum vertical space possible. That said the hands 
and controls also scale to give a better experience on iPad and phone-like devices in "vertical mode."  

## Tick mark implementation

It is important to the pedagogy of this sim that altering the number of tick marks displayed in the sim doesn't feel like
zooming in or out. As a result, the implementation of these are just a skin on top of the model. None of the model values
change from altering the tick mark views.

