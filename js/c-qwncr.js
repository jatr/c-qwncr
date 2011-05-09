/*global console:true, window:true */

/*******************************************************
c-qwncr JavaScript Sequencing Framework
 - Jeremy Kahn    jkahn@vsapartners.com

Dependencies: jQuery, Modernizr
*******************************************************/

(function (window) {

	// Private vars
	var locks = {},
		cq = function () {},
		_public,
		prop;
	
	/* Private methods ********************************/
	function isFunc (fn) {
		return (typeof fn === 'function');
	}
	
	function logError (msg) {
		if (console && console.error) {
			console.error(msg);
		}
	}
	
	
	/******************************** Private methods */
	
	/* Public methods *********************************/
	_public = {

		/**
		 * Wraps `cq.lock` (see below!) to start an asynchronous sequence.  If there is a lock for the sequence (usually meaning that the previous invocation has not completed), then this function blocks the sequence from beginning.  Blocked sequences are not queued - the method just returns.  This is beneficial because certain logical sequences (animations) must not be started again before being ended completely.
		 * @param {String} sequenceName The name of the sequence.  This usually should, but does not have to, have the same name as the action that it represents.
		 * @param {Function} sequence The sequence function to invoke.  It will NOT be invoked if the lock has not been lifted (either by calling `cq.lock.unlock()` or `cq.endSequence()`).  You should have a call to `cq.endSequence()` when the function is done.  `sequenceName` is passed as the first parameter to this function as a convenience.
		 * @param {Boolean} ignoreLock Set this to `true` to start the squence regardless of any locks.
		 * @returns {Boolean} Whether or not the sequence was started. (`true` if it was, `false` if it was not).
		 */
		sequenceStart: function sequenceStart (sequenceName, sequence, ignoreLock) {
			if (!sequenceName) {
				throw 'cq.startSequence: "sequenceName" not provided!';
			}
			
			if (!window.cq.lock.lockExists(sequenceName)) {
				//logError('cq.startSequence: Lock "' + sequenceName + '" does not exist, making it for you...');
				window.cq.lock.createLock(sequenceName);
			}
			
			if (!window.cq.lock.isLocked(sequenceName) || ignoreLock === true) {
				window.cq.lock.lock(sequenceName);
				
				if (isFunc(sequence)) {
					sequence(sequenceName);
				}
				
				return true;
			} else {
				//console.log("There is a lock!  And it's not being overridden!");
				return false;
			}
		},
		
		/**
		 * Ends a sequence.  Calling this removes the corresponding lock and allows the sequence to be run again.
		 * @param {String} sequenceName The name of the sequence.  This must correspond to the sequenceName provided to `cq.startSequence()`.
		 */
		sequenceEnd: function sequenceEnd (sequenceName) {
			if (!window.cq.lock.lockExists(sequenceName)) {
				throw 'cq.endSequence: "' + sequenceName + '" does not exist!';
			}
			
			window.cq.lock.unlock(sequenceName);
		},

		/**
		 * A locking mechanism that can be used to prevent asynchronous actions from starting before the previous sequence has completed.  This is handy for complex animations.  First, create a lock with `cq.lock.createLock()`.  Then lock and unlock it with `cq.lock.lock()` and `cq.lock.unlock()`.  'cq.lock.isLocked()' will tell you if something is locked or not.  You can check if a lock has been made with `cq.lock.lockExists()`.  The use case is to `return` out of the beginning of a function if you want the sequence to be NOT be executed asynchronously.
		 */
		lock: {
			/** 
			 * Adds a lock to the internal `locks` collection.
			 * @param {String} lockName Name of the lock.
			 * @param {Boolean} lockedToStart Whether the lock should be locked to begin with.  Defaults to `false`.
			 * @returns {Boolean} Whether or not the newly created lock is locked.
			 */
			'createLock': function createLock (lockName, lockedToStart) {
				if (!lockName) {
					throw 'You need to name this lock!';
				} else if (locks[lockName]) {
					throw 'Lock "' + lockName + '" already exists!';
				} else {
					locks[lockName] = lockedToStart ? true : false;
				}

				return this.isLocked(lockName);
			},
			
			/**
			 * Deletes a lock from the internal `locks` collection.
			 * @param {String} lockName Name of the lock.
			 */
			'destroyLock': function destroyLock (lockName) {
				return delete locks[lockName];
			},

			/**
			 * Activates a lock.
			 * @param {String} lockName Name of the lock.
			 */
			'lock': function lock (lockName) {
				if (typeof locks[lockName] !== 'boolean') {
					throw 'lock ' + lockName + ' does not exist';
				}

				return (locks[lockName] = true);
			},

			/**
			 * Deactivates a lock.
			 * @param {String} lockName Name of the lock.
			 */
			'unlock': function unlock (lockName) {
				if (typeof locks[lockName] !== 'boolean') {
					throw 'lock ' + lockName + ' does not exist';
				}

				return (locks[lockName] = false);
			},

			/**
			 * Returns whether or not a lock is locked.
			 * @param {String} lockName Name of the lock.
			 */
			'isLocked': function isLocked (lockName) {
				if (typeof locks[lockName] !== 'boolean') {
					throw 'lock ' + lockName + ' does not exist';
				}

				return locks[lockName];
			},

			/**
			 * Returns whether or not a lock has been created with `cq.lock.createLock()`.
			 * @param {String} lockName Name of the lock.
			 */
			'lockExists': function lockExists (lockName) {
				return (typeof locks[lockName] !== 'undefined');
			},
			
			'_debug': function () {
				return locks;
			}
		},
	};
	/********************************* Public methods */
	
	// Create the global instance of `cq`...
	
	// Inherit from jQuery!  No, let's not do that...
	//cq.prototype = $;
	window.cq = new cq();
	
	// ...and attach all the public methods.
	for (prop in _public) {
		if (_public.hasOwnProperty(prop)) {
			window.cq[prop] = _public[prop];
		}
	}
	
}(window));