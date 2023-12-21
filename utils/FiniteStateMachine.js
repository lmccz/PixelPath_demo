export class FiniteStateMachine
{
    constructor(initialState, possibleStates, stateArgs)
    {
        // this.initialState = initialState;
        this.possibleStates = possibleStates;
        this.stateArgs = stateArgs;
        this.state = initialState;

        Object.keys(this.possibleStates).forEach((key) =>
        {
            this.possibleStates[key].stateMachine = this;
        });

        this.possibleStates[this.state].enter(...this.stateArgs);
    }

    getState()
    {
        return this.state
    }

    step(time, delta)
    {
        // if (!this.state)
        // {
        //     this.state = this.initialState;
        //     this.possibleStates[this.state].enter(...this.stateArgs);
        // };

        this.possibleStates[this.state].execute(time, delta, ...this.stateArgs);
    }

    transition(newState, ...enterArgs)
    {
        if (!this.possibleStates[newState])
        {
            return;
        }

        if (this.possibleStates[this.state].exit)
        {
            this.possibleStates[this.state].exit(...this.stateArgs);
        }

        this.state = newState;
        this.possibleStates[this.state].enter(...this.stateArgs, ...enterArgs);
    }
};


export class State
{
    enter() { }
    execute() { }
    exit() { }
};