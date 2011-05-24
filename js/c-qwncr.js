/*******************************************************
c-qwncr JavaScript Sequencing Framework
v. 0.2
MIT License.

 - Jeremy Kahn    jkahn@vsapartners.com

Dependencies: none
*******************************************************/

(function (global) {

	// Private vars
	var cq = function () {},
		locks = {},
		savedSequences = {},
		_lock,
		_public,
		prop;
	
	/* Private methods & properties *******************/
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
			locks[lockName] = lockedToStart ? true : false;

			return this.isLocked(lockName);
		},
		
		/**
		 * Deletes a lock from the internal `locks` collection.
		 * @param {String} lockName Name of the lock.
		 * @returns {Boolean} Whether or not the lock was deleted (only returns `false` if the lock didn't exist in the first place).
		 */
		'destroyLock': function destroyLock (lockName) {
			return delete locks[lockName];
		},

		/**
		 * Activates a lock.
		 * @param {String} lockName Name of the lock.
		 */
		'lock': function lock (lockName) {
			if (locks[lockName] !== undefined) {
				locks[lockName] = true;
			}
		},

		/**
		 * Deactivates a lock.
		 * @param {String} lockName Name of the lock.
		 */
		'unlock': function unlock (lockName) {
			if (locks[lockName] !== undefined) {
				locks[lockName] = false;
			}
		},

		/**
		 * Returns whether or not a lock is locked.
		 * @param {String} lockName Name of the lock.
		 * @returns {Boolean|undefined} If the lock does not exist, `undefined` is returned.
		 */
		'isLocked': function isLocked (lockName) {
			if (typeof locks[lockName] === 'boolean') {
				return locks[lockName];
			}
		},

		/**
		 * Returns whether or not a lock has been created with `cq.lock.createLock()`.
		 * @param {String} lockName Name of the lock.
		 */
		'lockExists': function lockExists (lockName) {
			return (locks[lockName] !== undefined);
		}
	};
	
	
	/******************* Private methods & properties */
	
	/* Public methods *********************************/
	_public = {

		/**
		 * Creates an asynchronous sequence and activates a corresponding "lock."  If there is already a lock for a sequence with the same name (usually meaning that the previous invocation has not completed), then this function blocks the sequence from beginning.  Blocked sequences are not queued - this method just returns.  This is beneficial because certain logical sequences (such as complex animations) must not be started again before being ended completely.
		 * @param {String} sequenceName The name of the sequence.  This is the identifier for the sequence, and will be needed to end the sequence.
		 * @param {Function} sequence The sequence function to invoke.  It will NOT be invoked if the lock has not been lifted (by calling `cq.end()`).  You should have a call to `cq.end()` when the function is done.  The `sequenceName` value is passed as the first parameter to the callback function as a convenience.
		 * @param {Boolean} ignoreLock Set this to `true` to start the sequence regardless of any locks.
		 * @returns {Boolean} Whether or not the sequence was started. (`true` if it was, `false` if it was not).
		 */
		start: function start (sequenceName, sequence, ignoreLock) {
			if (!sequenceName) {
				throw 'cq.start: "sequenceName" not provided!';
			}
			
			if (savedSequences.hasOwnProperty(sequenceName)) {
				// `ignoreLock` might still be used, so move that to the third param
				ignoreLock = !!sequence;
				sequence = savedSequences[sequenceName];
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
		 * Ends a sequence.  Calling this removes the lock and allows the sequence to be run again.
		 * @param {String} sequenceName The name of the sequence.  This must correspond to the `sequenceName` provided to `cq.start()`.
		 */
		end: function end (sequenceName) {
			if (!_lock.lockExists(sequenceName)) {
				throw 'Error:  Calling cq.end() on ' + sequenceName + ', which does not exist.';
			}
			
			_lock.unlock(sequenceName);
			_lock.destroyLock(sequenceName);
		},
		
		save: function save (sequenceName, sequence) {
			return (savedSequences[sequenceName] = sequence);
		},
		
		destroy: function destroy (sequenceName) {
			_lock.destroyLock(sequenceName);
			delete savedSequences[sequenceName];
		}
	};
	/********************************* Public methods */
	
	// Create the global instance of `cq`...
	
	global.cq = new cq();
	
	// ...and attach all the public methods.
	for (prop in _public) {
		if (_public.hasOwnProperty(prop)) {
			global.cq[prop] = _public[prop];
		}
	}
	
}(this));