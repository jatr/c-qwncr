C-qwncr - A JavaScript animation sequencing utility
===

The problem:
---

You are making a complex browser animation with JavaScript that involves several stages, possibly with multiple DOM elements.  You want to ensure that if this animation has been started, it cannot start again until it has completed.  You don't want the animation to abruptly stop in the middle of the sequence, you want the sequence to run to completion.

The janky solution:
---

You can mitigate the scenario by setting a boolean (or "flag," if you will).  Let's call it `canStartAgain`.  When the animation sequence starts, it sets `canStartAgain` to `false`.  If `canStartAgain` is already false, just `return` from the function that starts the sequence.  When the sequence completes, set `canStartAgain` to `true`.

And then do something like this for every animation on your page.

The awesome solution:
---

A better way to handle this is to use a tool that does all this ugly and annoying logic for you.  C-qwncr is that tool.

The four functions you need to be aware of are:

  * `cq.start()`
  * `cq.end()`
  * `cq.save()`
  * `cq.destroy()`

cq.start( sequenceName, sequence, ignoreLock )
---

Starts a sequence and creates a "lock."  Name the sequence with `sequenceName`, this is the string ID that C-qwncr references the animation by.  `sequence` is the function that starts the animation sequence.  Passing `true` for `ignoreLock` will force the animation to start, regardless of any existing locks.

If you previously saved a sequence (see below), you can `start()` it by just passing the `sequenceName` as the first parameter.  If you would like to ignore the lock on the invocation, just pass `ignoreLock` as the second parameter.  Basically:

````javascript
cq.start( sequenceName, ignoreLock )
````

Protip:  The function that you pass as `sequeunce` will receive the string that you passed to `cq.start()` as `sequenceName` as its first parameter.  This is a convenience for you, so that you do not have to maintain two identical strings in your code.  Like so:

````javascript
cq.start('flashyStuff', function (sequenceName) {
  console.log(sequenceName); // logs "flashyStuff"
});
````

cq.end( sequenceName )
---

Ends a sequence.  `sequenceName` should be the same as the `sequenceName` string you passed to the corresponding call to `cq.start()`.  You need to call this at the end of your animation in order to allow a call to `cq.start()` to be called successfully.

Basic example
---

Uses jQuery for brevity.

````javascript
cq.start('moveMyElement', function (sequenceName) {
	$('#myElement')
		.animate({
			'left': '+=200'
		}, {
			'duration': 500
		})
		.animate({
			'left': 0
		}, {
			'duration': 750,
			'complete': function () {
				cq.end(sequenceName);
			}
		});
});
````

save ( sequenceName, sequence )
---

Saves a sequence function that can be used at a later time.  You can use it as many times as you'd like.  Calling this again for a previously used `sequenceName` will just overwrite the old one.

Example:

````javascript
cq.save('myAwesomeSequence', function (sequenceName) {
  console.log('Hello!');
  cq.end(sequenceName);
});

// Start the sequence whenevs
cq.start('myAwesomeSequence');
````

destroy ( sequenceName )
---

Destroys a saved sequence.

````javascript
cq.save('myAwesomeSequence', function (sequenceName) {
  console.log('Hello!');
  cq.end(sequenceName);
});

cq.destroy('myAwesomeSequence');
````

Full example, with saving
---

````javascript
cq.save('moveMyElement', function (sequenceName) {
	$('#myElement')
		.animate({
			'left': '+=200'
		}, {
			'duration': 500
		})
		.animate({
			'left': 0
		}, {
			'duration': 750,
			'complete': function () {
				cq.end(sequenceName);
			}
		});
});

cq.start('moveMyElement');
````