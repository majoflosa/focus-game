var focusApp = {
    state: {
        gameState: 'to start', // 'playing', 'ended'
        duration: null,
        beepCount: null,
        beepTimes: [],
        clickTimes: [],
        currentBeepCount: 0,
        countInterval: null,
        beepTimeouts: [],
        endTimeout: null,
        reactionInterval: null,
        reactionMs: 0,
        history: [] // {duration: 3, beepTimes: [], clickTimes: []}
    },

    cacheDom: function() {
        this.$wrap = document.querySelector( '.wrap' );
        this.$demoBtns = [...this.$wrap.querySelectorAll( '.play-demo' )];
        this.$durationInput = this.$wrap.querySelector( '#duration' );
        this.$action = this.$wrap.querySelector( '#action-btn' );
        this.$minutes = this.$wrap.querySelector( '#min-count' );
        this.$seconds = this.$wrap.querySelector( '#sec-count' );
        this.$stats = this.$wrap.querySelector( '#stats-list' );
    },
    
    bindEvents: function() {
        this.$demoBtns.forEach( button => button.addEventListener( 'click', this.handleDemoClick ) );
        this.$action.addEventListener( 'click', this.handleActionClick );
    },

    init: function() {
        this.bindEvents = this.bindEvents.bind( this );
        this.render = this.render.bind( this );
        this.handleDemoClick = this.handleDemoClick.bind( this );
        this.handleActionClick = this.handleActionClick.bind( this );
        this.startGame = this.startGame.bind( this );
        this.registerBeepReaction = this.registerBeepReaction.bind( this );
        this.clearState = this.clearState.bind( this );
        this.playBeep = this.playBeep.bind( this );
        this.playEnding = this.playEnding.bind( this );
        this.measureReaction = this.measureReaction.bind( this );
        this.endGame = this.endGame.bind( this );

        this.cacheDom();
        this.bindEvents();
        this.render();
    },

    render: function() {

    },

    handleDemoClick: function( event ) {
        event.preventDefault();

        const audio = new Audio( event.target.dataset.file );
        audio.play();
    },

    handleActionClick: function() {
        switch ( this.state.gameState ) {
            case 'to start':
                this.startGame();
                break;
            case 'playing':
                this.registerBeepReaction();
                break;
            case 'ended':
                this.clearState();
                this.startGame();
                break;
            default:
                return false;
        }
    },

    startGame: function() {
        this.$action.innerText = 'I\'m here!';
        this.state.gameState = 'playing';
        this.state.duration = +this.$durationInput.value * 60 * 1000;
        this.state.beepCount = Math.floor( 
            Math.random() * (+this.$durationInput.value) + Math.round(+this.$durationInput.value*1.2) 
        );
        
        for (let i = 0; i < this.state.beepCount; i++) {
            const beep = i === 0 
                ? Math.floor( Math.random() * ((+this.state.duration * 0.3333) - 5000) + 5000 )
                : Math.floor( 
                    Math.random() * (this.state.duration - this.state.beepTimes[i-1]+3000) + (this.state.beepTimes[i-1])
                );
            if ( beep < this.state.duration) this.state.beepTimes.push( beep );
        }
        
        this.state.beepTimes.forEach( beep => {
            let beepTimeout = setTimeout( this.measureReaction, beep );
            this.state.beepTimeouts.push( beepTimeout );
        });
        this.state.endTimeout = setTimeout( this.endGame, this.state.duration );
        this.state.countInterval = setInterval( () => {
            if ( +this.$seconds.innerText < 9 ) {
                this.$seconds.innerText = '0' + (+this.$seconds.innerText + 1)
            } else if ( +this.$seconds.innerText > 58 ) {
                this.$seconds.innerText = '00';
                this.$minutes.innerText = +this.$minutes.innerText < 9 
                    ? '0' + (+this.$minutes.innerText + 1)
                    : +this.$minutes.innerText + 1
            } else {
                this.$seconds.innerText = +this.$seconds.innerText + 1;
            }
            // this.$seconds.innerText = +this.$seconds.innerText < 9 
            //     ? '0' + (+this.$seconds.innerText + 1)
            //     : +this.$seconds.innerText + 1
        }, 1000 );

        console.log( this.state.duration, this.state.beepTimes );
    },

    registerBeepReaction: function() {
        if ( this.state.reactionMs >= 100 ) return false;

        clearTimeout( this.state.reactionInterval );
        console.log( 'click registered', this.state.reactionMs );
        this.state.clickTimes.push( this.state.reactionMs < 100 ? this.state.reactionMs : null );
        this.state.reactionMs = 0;
    },

    clearState: function() {
        this.state.history.push[{
            duration: this.state.duration,
            beepTimes: this.state.beepTimes,
            clickTimes: this.state.clickTimes
        }];

        this.state.gameState = 'to start';
        this.state.duration = null;
        this.state.beepCount = null;
        this.state.beepTimes = [];
        this.state.clickTimes = [];
        this.state.currentBeepCount = 0;
        this.state.countInterval = null;
        this.state.beepTimeouts = [];
        this.state.endTimeout = null;
        this.state.reactionInterval = null;
        this.state.reactionMs = 0;

        this.$seconds.innerText = '00';
        this.$minutes.innerText = '00';
        this.$stats.parentElement.classList.remove( 'show' );
    },

    playBeep: function() {
        const beep = new Audio( './Beep_Short.mp3' );
        beep.play();
        this.state.currentBeepCount += 1;
    },

    playEnding: function() {
        const ending = new Audio( './Emergency_Siren_Short_Burst.mp3' );
        ending.play();
    },

    measureReaction() {
        this.playBeep();
        
        // clearTimeout( this.state.reactionInterval );
        this.state.reactionInterval = setInterval( () => {
            this.state.reactionMs += 1;
            // console.log( this.state.reactionMs );
        }, 10);
        setTimeout( () => {
            clearInterval( this.state.reactionInterval );
            console.log('this.state.clickTimes: ', this.state.clickTimes);
            console.log('this.state.currentBeepCount: ', this.state.currentBeepCount);
            if ( this.state.clickTimes.length < this.state.currentBeepCount ) {
                this.state.clickTimes.push( null );
                this.state.reactionMs = 0;
            }
        }, 1001 );
    },

    endGame: function() {
        this.playEnding();
        clearInterval( this.state.countInterval );
        this.state.beepTimeouts.forEach( timeout => clearTimeout(timeout) );
        this.state.gameState = 'ended';

        this.$action.innerText = 'Play Again';
        this.$stats.innerText = `${this.state.beepCount} beeps played`;
        this.state.beepTimes.forEach( (beep, ind) => {
            const $statItem = document.createElement( 'li' );
            $statItem.innerText = this.state.clickTimes[ind] !== null
                ? `Beep #${ind + 1} Reaction Time: ${+this.state.clickTimes[ind]/100} seconds`
                : `Missed beep #${ind + 1} (more than one second)`;

            console.log( `Click time for Beep #${ind + 1}: ${this.state.clickTimes[ind]}` );
            this.$stats.appendChild( $statItem );
        });
        this.$stats.parentElement.classList.add( 'show' );
    }
};

focusApp.init();
