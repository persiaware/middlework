class Middlework
{
	constructor({conditionChecker})
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

	use(condition, cb)
	{
		if (typeof cb !== 'function')
		{
			throw new Error('callback should be a function');
		}

		this.middlewares.push({condition, cb});
	}

	use(cb)
	{
		this.use(null, cb);
	}

	handleOnward(curpos, error, ...args)
	{
		if (this.middlewares.length <= curpos)
		{
			return;
		}

		if (this.middlewares[curpos].condition)
		{
			if (!this.conditionChecker(this.middlewares[curpos].condition, ...args))
			{
				this.handleOnward(curpos + 1, error, ...args);
				return;
			}
		}

		if (this.middlewares[curpos].cb.length === args.length + 2)
		{
			// callback can handle errors
			this.middlewares[curpos].cb(error, ...args, (err) =>
			{
				this.handleOnward(curpos + 1, err, ...args);
			});
		}
		else
		{
			if (error)
			{
				this.handleOnward(curpos + 1, error, ...args);
			}
			else
			{
				this.middlewares[curpos].cb(...args, (err) =>
				{

					this.handleOnward(curpos + 1, err, ...args);
				});
			}
		}
	}

	handle(...args)
	{
		this.handleOnward(0, null, ...args);
	}
}

module.exports = Middlework;
