class Middlework
{
	/**
	 * creates a new middlework object with specified options
	 * @param [conditionChecker] if specified, every condition is passed to it with arguments
	 * to determine if middleware should be called or not (conditionChecker(condition, ...args))
	 */
	constructor({conditionChecker = null} = {})
	{
		if (conditionChecker && typeof conditionChecker !== 'function')
		{
			throw new Error('conditionChecker should be a function');
		}

		this.conditionChecker = conditionChecker || function ()
			{
				return true;
			};
		this.middlewares = [];
	}

	/**
	 * adds a function to the end of middleware stacks
	 * @param condition - conditions in witch middleware will be allowed to function
	 * @param cb
	 */
	use(condition, cb)
	{
		if (typeof cb !== 'function')
		{
			throw new Error('callback should be a function');
		}

		this.middlewares.push({condition, cb});
	}

	/**
	 * <it is a private method, don't use it>
	 * this method starts calling middleware chain from specified index onward
	 * @param from
	 * @param error
	 * @param args
	 * @private
	 */
	__handleSyncFrom(from, error, ...args)
	{
		if (this.middlewares.length <= from)
		{
			return;
		}

		if (this.middlewares[from].condition)
		{
			if (!this.conditionChecker(this.middlewares[from].condition, ...args))
			{
				this.__handleSyncFrom(from + 1, error, ...args);
				return;
			}
		}

		if (this.middlewares[from].cb.length === args.length + 2)
		{
			// callback can handle errors
			this.middlewares[from].cb(error, ...args, (err) =>
			{
				this.__handleSyncFrom(from + 1, err, ...args);
			});
		}
		else
		{
			if (error)
			{
				this.__handleSyncFrom(from + 1, error, ...args);
			}
			else
			{
				this.middlewares[from].cb(...args, (err) =>
				{

					this.__handleSyncFrom(from + 1, err, ...args);
				});
			}
		}
	}

	/**
	 * starts calling middlewares synchronously, passing ...args to them
	 * @param args - arguments passed in middleware chain
	 */
	handleSync(...args)
	{
		this.__handleSyncFrom(0, null, ...args);
	}
}

module.exports = Middlework;
