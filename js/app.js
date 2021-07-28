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
let targetInput, targetDistance, targetTeam;

function checkInputField() {
    let input = document.querySelector( ".input" );
    disableButton( input.value === "", ['0', '{bksp}'] );
    // console.log( `Current input: ${input.value}` );

    let teams = document.getElementById('teams');
    console.log( `Current input: ${teams.value}` );

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

        calculateDistance( input.value, teams.value );
    }
}

function disableButton(status, buttons) {
    //console.log( `Button is disabled? : ${status} | ${buttons}` );
    buttons.forEach( button => {
        let btn = document.querySelector( `[data-skbtn="${button}"]` );
        btn.disabled = status;
        btn.style.color = status === true ? "#fff" : "";

        // Hide voice input
        let btnMiniText = document.querySelector( `[data-skbtn="${button}"] span` ).style;
        btnMiniText.setProperty( '--voice-text', `""` );
    } );
}

function calculateDistance(input, teams) {
    if (input >= 100 && input <= 1600) {
        let distanceResult = (100 * input) / 1600;

        let realResult = 0;

        if (teams == "Original") {
            let m = -0.23703;
            let b = 1001.46;
            realResult = Math.round( m * input + b );
        } else if (teams == "Russian") {
            let k = 21.33;
            let l = 100;
            realResult = Math.round( (((input / l) - 1) * k) + 800);
        }

        document.querySelector( '.result' ).innerHTML = realResult;
        targetDistance = realResult;
        targetInput = input;
        targetTeam = teams == "Original" ? "US/Germany" : teams;
        
        // Additional indicators if Distance CALCULATED
        let infoMarker = document.querySelector( '.keyboard-container' ).style;
        infoMarker.setProperty( '--bg-position', `${distanceResult}` + '%' );

        let arrowMarker = document.querySelector( '.result' ).style;
        arrowMarker.setProperty( '--mark-color', `#2e2e2e` );
    }
}

function clearOldInfo() {
    let totalLastResults = document.querySelectorAll( '.last-result' );
    let lastVisibleInput;

    if (document.querySelector( '.last-input' ) !== null) {
        lastVisibleInput = document.querySelector( '.last-input' ).textContent;
    }

    if (targetInput !== lastVisibleInput) {

        if (totalLastResults.length === 4) {
            let last = totalLastResults[totalLastResults.length - 1];
            last.parentNode.removeChild( last );
        }

        let resultNode = '<div class="last-result"><span class="last-team">' + targetTeam + 
            '</span>' + '<span class="last-input">' + targetInput + '</span>' + 
            '<span class="last-distance">' + targetDistance + '</span></div>';
        let lastResults = document.querySelector( '.last-info' );
        lastResults.insertAdjacentHTML( 'afterbegin', resultNode );
    }

    if (totalLastResults.length > 0) {
        for (let i = 0; totalLastResults.length > i; i++) {
            let visibility = (70 - (i * 15));
            totalLastResults[i].style.opacity = visibility + '%';
        }
    }

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
    timerId = setTimeout( clearOldInfo, 5000 );
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
        document.querySelector( '.info-line' ).style.display = 'none';
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
