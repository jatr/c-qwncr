/*global console:true, window:true */

/*******************************************************
c-qwncr JavaScript Sequencing Framework
 - Jeremy Kahn    jkahn@vsapartners.com

Dependencies: none
*******************************************************/

(function (window) {

	// Private vars
	var locks = {},
		_lock,
		cq = function () {},
		_public,
		prop;
	
	/* Private methods ********************************/
	function isFunc (fn) {
		return (typeof fn === 'function');
	}
	
	/**
	 * A locking mechanism that can be used to prevent asynchronous sequences from starting before the previous sequence has completed.
	 */
	_lock = {
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
	};
	
	
	/******************************** Private methods */
	
	/* Public methods *********************************/
	_public = {

		/**
		 * Wraps `cq.lock` (see above!) to start an asynchronous sequence.  If there is a lock for the sequence (usually meaning that the previous invocation has not completed), then this function blocks the sequence from beginning.  Blocked sequences are not queued - the method just returns.  This is beneficial because certain logical sequences (animations) must not be started again before being ended completely.
		 * @param {String} sequenceName The name of the sequence.  This usually should, but does not have to, have the same name as the action that it represents.
		 * @param {Function} sequence The sequence function to invoke.  It will NOT be invoked if the lock has not been lifted (either by calling `cq.lock.unlock()` or `cq.endSequence()`).  You should have a call to `cq.endSequence()` when the function is done.  `sequenceName` is passed as the first parameter to this function as a convenience.
		 * @param {Boolean} ignoreLock Set this to `true` to start the squence regardless of any locks.
		 * @returns {Boolean} Whether or not the sequence was started. (`true` if it was, `false` if it was not).
		 */
		sequenceStart: function sequenceStart (sequenceName, sequence, ignoreLock) {
			if (!sequenceName) {
				throw 'cq.startSequence: "sequenceName" not provided!';
			}
			
			if (!_lock.lockExists(sequenceName)) {
				_lock.createLock(sequenceName);
			}
			
			if (!_lock.isLocked(sequenceName) || ignoreLock === true) {
				_lock.lock(sequenceName);
				
				if (isFunc(sequence)) {
					sequence(sequenceName);
				}
				
				return true;
			} else {
				return false;
			}
		},
		
		/**
		 * Ends a sequence.  Calling this removes the corresponding lock and allows the sequence to be run again.
		 * @param {String} sequenceName The name of the sequence.  This must correspond to the sequenceName provided to `cq.startSequence()`.
		 */
		sequenceEnd: function sequenceEnd (sequenceName) {
			if (!_lock.lockExists(sequenceName)) {
				throw 'cq.endSequence: "' + sequenceName + '" does not exist!';
			}
			
			_lock.unlock(sequenceName);
		}
	};
	/********************************* Public methods */
	
	// Create the global instance of `cq`...
	
	window.cq = new cq();
	
	// ...and attach all the public methods.
	for (prop in _public) {
		if (_public.hasOwnProperty(prop)) {
			window.cq[prop] = _public[prop];
		}
	}
	
}(window));