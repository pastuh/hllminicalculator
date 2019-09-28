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
function onKeyPress(button) {
    checkButton( button );
    checkInputField();
    // console.log( `Counter started` );
    clearTimeout( timerId );
    timerId = setTimeout( clearOldInfo, 6000 );
}

function checkButton(button) {
    if (button[0] !== 'delete' && button[0] !== 'enter' && !myKeyboard.getButtonElement( button ).disabled) {
        // console.log( `NotDisabled ::: ${button}` );
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