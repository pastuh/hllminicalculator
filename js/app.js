const artyom = new Artyom();
let Keyboard = window.SimpleKeyboard.default;

let myKeyboard = new Keyboard( {
    onInit: () => checkInputField(),
    // onChange: input => onChange(input),
    onKeyPress: button => onKeyPress( button ),
    useButtonTag: true,
    debug: false,
    physicalKeyboardHighlight: true,
    physicalKeyboardHighlightBgColor: "#2e2e2e",
    layout: {
        'default': [
            '7 8 9',
            '4 5 6',
            '1 2 3',
            '0 {bksp}'
        ]
    },
    display: {
        '{bksp}': 'delete',
    },
    maxLength: {
        'default': 4,
    },
    inputPattern: {
        'default': /^[^0]\d+$/
    },
    disableButtonHold: true,
    theme: "hg-theme-default hg-layout-numeric numeric-theme"
} );

let globalInput = document.querySelector( ".input" );
const allButtonNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
let timerId;

function checkInputField() {
    let input = document.querySelector( ".input" );
    disableButton( input.value === "", ['0', '{bksp}'] );
    // console.log( `Current input: ${input.value}` );

    const regexp = /^\d+$/;
    if (input.value.match( regexp )) {
        if (input.value.length <= 2) {
            input.style.color = "#898989";
        } else if (input.value.length <= 3) {
            input.style.color = "#c5c5c5";

            // Disable BUTTONS if DISTANCE limit reached
            allButtonNumbers.forEach( number => {
                let predictedFeature = `${input.value}${number}`;
                if (parseInt( predictedFeature ) > 1600) {
                    disableButton( true, [number] );
                }
            } );

            // Disable BUTTONS if INPUT limit reached
        } else if (input.value.length === 4) {
            input.style.color = "";
            disableButton( true, allButtonNumbers );
        }

        calculateDistance( input.value );
    }
}

function disableButton(status, buttons) {
    // console.log( `Button is disabled? : ${status} | ${buttons}` );
    buttons.forEach( button => {
        let btn = document.querySelector( `[data-skbtn="${button}"]` );
        btn.disabled = status;
        btn.style.color = status === true ? "#fff" : "";

        // Hide voice input
        let btnMiniText = document.querySelector( `[data-skbtn="${button}"] span` ).style;
        btnMiniText.setProperty( '--voice-text', `""` );
    } );
}

function calculateDistance(input) {
    let m = -0.23703;
    let b = 1001.46;

    if (input >= 100 && input <= 1600) {
        let distanceResult = (100 * input) / 1600;
        let realResult = Math.round( m * input + b );
        document.querySelector( '.result' ).innerHTML = realResult;

        // Additional indicators if Distance CALCULATED
        let infoMarker = document.querySelector( '.keyboard-container' ).style;
        infoMarker.setProperty( '--bg-position', `${distanceResult}` + '%' );

        let arrowMarker = document.querySelector( '.result' ).style;
        arrowMarker.setProperty( '--mark-color', `#2e2e2e` );
    }
}

function clearOldInfo() {
    globalInput.value = '';
    // Remove indicator
    let arrowMarker = document.querySelector( '.result' ).style;
    arrowMarker.setProperty( '--mark-color', `#ffdd40` );

    disableButton( false, allButtonNumbers );
    checkInputField();
}

// MAIN activator after each BUTTON click
function onKeyPress(button, voiceInput = '') {
    //console.log( `Received button: ${voiceInput}` );
    checkButton( button, voiceInput );
    checkInputField();
    // console.log( `Counter started` );
    clearTimeout( timerId );
    timerId = setTimeout( clearOldInfo, 10000 );
}

function checkButton(button, voiceInput = '') {
    if (button[0] !== 'delete' && button[0] !== 'enter' && !myKeyboard.getButtonElement( button ).disabled) {
        // console.log( `NotDisabled ::: ${button}` );

        // Show voice input
        let btnMiniText = document.querySelector( `[data-skbtn="${button}"] span` ).style;
        btnMiniText.setProperty( '--voice-text', `"${voiceInput}"` );


        updateInputField( button );
    } else if (button[0] === 'enter' || button[0] === 'delete') {
        clearOldInfo();
    }
}

function updateInputField(newInput) {
    // console.log( `newInput detected: ${newInput}` );
    let currentInput = document.querySelector( ".input" );
    if (newInput === "{bksp}") {
        currentInput.value = "";
        let arrowMarker = document.querySelector( '.result' ).style;
        arrowMarker.setProperty( '--mark-color', `#ffdd40` );

        disableButton( false, ['1', '2', '3', '4', '5', '6', '7', '8', '9'] );
    } else if (newInput === "enter") {
        console.log( 'Activated controls' );
    } else {
        currentInput.value += newInput;
    }
}

// Listen for KEYBOARD inputs
document.addEventListener( 'DOMContentLoaded', () => {
    'use strict';
    const options = {
        eventType: 'keydown',
    };
    keyMapper( [onKeyPress], options );
} );

function keyMapper(callbackList, options) {
    // Allowed buttons
    const charList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'enter', 'delete'];
    const eventType = hasProperty( 'eventType', options ) && options.eventType || 'keydown';

    let state = {
        buffer: []
    };

    document.addEventListener( eventType, event => {
        const key = event.key.toLowerCase();
        let buffer = [];
        if (charList.indexOf( key ) === -1) return;
        buffer = [key];
        // Update state after all inputs
        state = { buffer: buffer };
        // Activate all functions from keyMapper
        callbackList.forEach( callback => callback( buffer ) );
    } );

    function hasProperty(property, object) {
        return object && object.hasOwnProperty( property );
    }
}

function startContinuousArtyom(language = 'en-US') {
    artyom.fatality(); // use this to stop any of

    setTimeout( function () {
        // if you use artyom.fatality , wait 250 ms to initialize again.
        artyom
            .initialize( {
                lang: language, // A lot of languages are supported. Read the docs ! en-US
                continuous: true, // Artyom will listen forever
                listen: true, // Start recognizing
                debug: false, // Show everything in the console
                speed: 1 // talk normally
            } )
            .then( function () {
                console.log( "Ready to work !" );
            } );
    }, 250 );
}

document.querySelector( ".activate-voice" ).addEventListener( 'click', function (e) {
    e.target.style.visibility = 'hidden';
    document.querySelector( ".voice-preview" ).style.display = 'block';
    startContinuousArtyom();
} );


// Suggested to say: G * | B * (* is any word from the list)
var myGroup = [
    {
        indexes: ["1", "won", "when", "what", "loan", "month", "go1", "go one", "want", "beat one", "go first"],
        action: function (i) {
            onKeyPress( 1, this.indexes[i] );
        }
    },
    {
        indexes: ["2", "two", "too", "do", "you", "to do", "go to", "YouTube", "tune", "G-tube", "go second",
            "давай", "davai", "да", "vba"],
        action: function (i) {
            onKeyPress( 2, this.indexes[i] );
        }
    },
    {
        indexes: ["3", "three", "tree", "treat", "tweet", "free", "Tamari", "fry", "be free", "beef tripe", "defeat", "City", "Freddy", "gold tint", "tent", "troika", "тройка"],
        action: function (i) {
            console.log( 'Pressing 3' );
            onKeyPress( 3, this.indexes[i] );
        }
    },
    {
        indexes: ["4", "four", "phone", "floor", "for", "few", "false", "Feud", "fruit", "fur", "before", "g-form", "Seafood", "food", "Quant"],
        action: function (i) {
            onKeyPress( 4, this.indexes[i] );
        }
    },
    {
        indexes: ["5", "five", "fine", "find", "define", "gheefunny", "Farm", "beef", "GTA V"],
        action: function (i) {
            onKeyPress( 5, this.indexes[i] );
        }
    },
    {
        indexes: ["6", "six", "sex", "Sikhs", "seeds", "snakes", "search", "Siege"],
        action: function (i) {
            onKeyPress( 6, this.indexes[i] );
        }
    },
    {
        indexes: ["7", "seven", "center", "amen", "Shannon", "salmon", "Shaymin", "Sharon", "shaving", "send", "Beast", "decent", "Beeson", "GSM", "BCM"],
        action: function (i) {
            onKeyPress( 7, this.indexes[i] );
        }
    },
    {
        indexes: ["8", "eight", "age", "Ange", "each", "eat", "GH", "Beach", "BH", "Beat It", "being"],
        action: function (i) {
            onKeyPress( 8, this.indexes[i] );
        }
    },
    {
        indexes: ["9", "nine", "mine", "Noid", "join", "benign", "beanie", "be mine", "big night", "Gina", "G night", "G line", "Jean Knight"],
        action: function (i) {
            // console.log(`Index: ${i} at ${this.indexes}`);
            onKeyPress( 9, this.indexes[i] );
        }
    },
    {
        indexes: [
            "0",
            "zero",
            "Zeno",
            "Zito",
            "gyro",
            "zeal",
            "null",
            "empty",
            "GMT",
            "Gmail",
            "Zidane",
            "G-Eazy",
            "G-Man",
            "GG",
            "busy"
        ],
        action: function (i) {
            onKeyPress( 0, this.indexes[i] );
        }
    },
    {
        indexes: ["black", "game", "white", "quit", "\."],
        action: function (i) {
            onKeyPress( `{bksp}`, this.indexes[i] );
        }
    },
    {
        indexes: ["Russia", "fashion", "Hashem"],
        action: function () {
            document.querySelector( ".voice-preview" ).innerHTML = 'Language: ru-RU';
            startContinuousArtyom( 'ru-RU' );
        }
    }
];

artyom.addCommands( myGroup );

// Check if correct (and improve)
/*artyom.redirectRecognizedTextOutput( function (recognized, isFinal) {
    console.log( `Recognized: ${recognized} || isFinal: ${isFinal}` );
} );*/
