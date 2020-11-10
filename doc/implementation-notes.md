To talk about
* View dynamic layout to support vertical aspect ratios
  * scaling controls
  * extending ratioHalfs to a certain point
* Multi-modality stuff
* Tick marks are not mean to be a "zoom in/out" feature, but instead just another visualization of the same relationship.


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