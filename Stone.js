/* VERSION CONTROL :: 0.0.3.2


 .M"""bgd mm                                             
,MI    "Y MM                                             
`MMb.   mmMMmm ,pW"Wq.`7MMpMMMb.  .gP"Ya       ,p"q.,M7  
  `YMMNq. MM  6W'   `Wb MM    MM ,M'   Yb     6W'  `;W'  
.     `MM MM  8M     M8 MM    MM 8M""""""     8M    AW   
Mb     dM MM  YA.   ,A9 MM    MM YM.    ,     YA.  ,AP   
P"Ybmmd"  `Mbmo`Ybmd9'.JMML  JMML.`Mbmmd'      `Ybd9`Ybo

Nice!^
*/
/*

  @licstart  The following is the entire license notice for the 
  JavaScript code in this page.
  
  Copyright (C) 2014  Loic J. Duros
  
  The JavaScript code in this page is free software: you can
  redistribute it and/or modify it under the terms of the GNU
  General Public License (GNU GPL) as published by the Free Software
  Foundation, either version 3 of the License, or (at your option)
  any later version.  The code is distributed WITHOUT ANY WARRANTY;
  without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
  
  As additional permission under GNU GPL version 3 section 7, you
  may distribute non-source (e.g., minimized or compacted) forms of
  that code without the copy of the GNU GPL normally required by
  section 4, provided you include this license notice and a URL
  through which recipients can access the Corresponding Source.   
  
  
  @licend  The above is the entire license notice
  for the JavaScript code in this page.

*/

function toLogic() {
    var input = document.getElementById("input").value;
    if(input.length > 0) {
	var output = toArrayOfWords(input.toLowerCase());
	output = wordsToSymbols(output);
	
	var names = listNames(output);
	for(var i=0;i<output.length;i++) output[i] = output[i].toString().replace(/,/g," "); // Sub-arrays are turned into strings to use string.prototype.replace()
	
	output = assignVariables(output,names);
	testValidity(output);
	output = tagPremises(output);
	output = toStatements(output);
	document.getElementById("output").value = output;
    } else {
	document.getElementById("output").value = input; // Output empty string if empty string is inputted
    }
}

function toEnglish() {
    var input = document.getElementById("input").value;
    var output = input.replace(/¬(?=[^\s])/g,"¬ ");
    var copy = output.slice(0);
    output = symbolsToWords(output);
    document.getElementById("output").value = output;

    
    // Output has to be converted to array before testing validity
    copy = copy.split(/\n/g);
    for(var i=0;i<copy.length;i++) {
	copy[i] = copy[i].split(/\s/g);
    }
    
    testValidity(copy);
}

// Creates a flag in the document in case of invalid use of names in the conclusion
function testValidity(words) {
    var found;
    missingPremiseSearch:
    for(var i=0;i<words.length;i++) {
	if(words[i][0] == '∴') {
	    for(var j=1;j<words[i].length;j++) {
		if(words[i][j][0].match(/[A-O]|[Q-Z]/)) {
		    found = false
		    for(var k=0;k<i;k++) {
			if(words[k].indexOf(words[i][j]) > -1) found = true;
		    }

		    if(!found) {
			document.getElementById("flag").innerHTML = "Validity flags: <font color=\"#FA5858\">/!\\ Part(s) of your conlcusion(s) do not show up in your premises.</font>";
			break missingPremiseSearch;
		    }
		}
	    }
	}
    }
    
    if(found) document.getElementById("flag").innerHTML = "Validity flags:";    
}

// Input is text string
// Outputs 2D array of words/statements
// i are statements; j are words
function toArrayOfWords(text) {
    text = text.replace(/[?]+/g, " %QUESTION\n"); // Mark questions
    text = text.replace(/,/g, " %COMMA "); // Mark commas
    text = text.replace(/[\s.:;!]+$/g,""); // Remove trailing punctuation/spaces
    text = text.split(/\s*[.:;!]+\s*|\s*\n+\s*/g); // Statements are delimited by punctuation or newline (including surounding whitespaces)
    for(var i=0;i<text.length;i++) {
	text[i] = text[i].split(/\s+/g);
    }
    return text;
}

// Input is 2D array of words
// Outputs string of text
function toStatements(words) {
    for(var i=0;i<words.length;i++) {
	words[i] = words[i].toString();

	// Symbols with no following whitespace
	words[i] = words[i].replace(/¬,/g,"¬");
	//
	
	words[i] = words[i].replace(/,/g," ");
	words[i] = words[i].replace(/ %COMMA/g,",");
    }

    var text = words.join("\n");
    return text;
}

// Imput is 2D array of words
// Outputs them with premise tags at index 0 of each statement
function tagPremises(words) {
    var pIndex = 1;
    for(var i=0;i<words.length;i++) {
	if(words[i][0] == "∴" ) {
	    pIndex = 1;
	} else if(words[i][(words[i].length - 1)] == "%QUESTION") {
	    words[i].pop();
	    words[i].unshift("[?]:");
	} else {
	    words[i].unshift("P" + pIndex + ":");
	    pIndex++;
	}
    }

    return words
}

// Returns a list of all names (strings inbetween symbols)
// Removes duplicates before returning
function listNames(words) {
    var names = []; // Stores detected names
    var k = 0; // Index in names[]
    var nameCreated = false;

    // Creates list
    for(var i=0;i<words.length;i++) {
	for(var j=0;j<words[i].length;j++) {
	    if(/[a-z]+/.test(words[i][j])) {
		nameCreated = true;
		if(!names[k]) {
		    names[k] = words[i][j]; // New name
		} else {
		    names[k] = names[k].concat(" " + words[i][j]); // Concat to present name
		}
	    } else {
		if(nameCreated) { // End name at encounter with symbol
		    nameCreated = false;
		    k++;
		}
	    }
	}
	
	if(nameCreated) { // End name at end of statement
	    nameCreated = false;
	    k++;
	}
    }

    // Removes duplicates
    var copy = [];
    for(var i=0;i<names.length;i++) {
	if(copy.indexOf(names[i]) === -1) {
	    copy.push(names[i]);
	}
    }
    
    return copy;
}

// Replaces names with variables
function assignVariables(words,names) {
    // Augments the names[] array with their assigned variable in an array called variables[]
    var variables = [] 
    var ccIndex = 0 // 0,1,2,3... for A,B,C,D...
    var nameRegex; 
    // Letter:
    for(var i=0;i<names.length;i++) {
	variables.push([names[i],String.fromCharCode(65+ccIndex)]);
	if(ccIndex == 14) ccIndex++; // no 'P' as a variable
	if(ccIndex == 25) ccIndex = -1; // loop letters
	ccIndex++;
    }
    // Number:
    if(names.length > 25) {
	for(var i=0;i<names.length;i++) {
	    variables[i][1] = (variables[i][1] + (Math.ceil((i+1)/25)));
	}
    }

    // Sorts variables[] by the length of their name to avoid replacing substrings of names with variables
    variables = variables.sort(function (a,b) {
	if(a[0].length < b[0].length) return 1;
	else if(a[0].length > b[0].length) return -1;
	else return 0;
    });
    
    // Replaces the names in words[] with their variables and divides the statements back into arrays
    for(var i=0;i<words.length;i++) {
	for(var k=0;k<variables.length;k++) {
	    nameRegex = new RegExp(variables[k][0],'g');
	    words[i] = words[i].replace(nameRegex,variables[k][1]);
	}
	
	words[i] = words[i].split(' ');
    }

    return words
}

function countWords(statement) {
    return statement.split(' ').length;
}

// Replaces symbols with words in a text string
function symbolsToWords(words) {
    var symbolRegex
    var symbolDic = [
	['∀', "all"],
	['∧', "and"],
	['∨', "or"],
	['≡', "is"],
	['¬', "not"],
	['∴', "therefore"],
	['∃', "there exists"],
	['⊥', "contradicts"],
	['⊤', "tautologically"],
	['⊨', "implies"],
	['⊩', "makes"],
	['⊢', "proves"],
	['⊃', "if/then"],
	['◊', "maybe"],
	['|', "nand"],
	['↓', "nor"],
	['□', "necessitates"],
	['⊕', "xor"] ];
    
    for(var i=0;i<symbolDic.length;i++) {
	symbolRegex = new RegExp('\\' + symbolDic[i][0],'g');
	words = words.replace(symbolRegex,symbolDic[i][1]);
    }

    return words;
}

// Input is 2D array of words, outputs 2D array of words+symbols
// i are statements; j are words
function wordsToSymbols(words) {
    for(var i=0;i<words.length;i++) {
	for(var j=0;j<words[i].length;j++) {
	    switch (words[i][j])
	    {
		case "it is not the case that":
		case "it's not the case that":
		case "it is not true that":
		case "it's not true that":
		case "not":
		case "false":
		case "untrue":
		case "negates": words[i][j] = '¬';
		break;
		
		case "and":
		case "but":
		case "unless":
		case "also": words[i][j] = '∧';
		break;
		
		case "or": words[i][j] = '∨';
		break;
		
		case "xor": words[i][j] = '⊕';
		break;
		
		case "equals":
		case "is":
		case "is equivalent to":
		case "is equal to":
		case "is the same as":
		case "are":
		case "if and only if":
		case "only if":
		case "iff": words[i][j] = '≡';
		break;
		
		case "if":
		case "then": words[i][j] = '⊃';
		break;
		
		case "in conclusion":
		case "ergo":
		case "therefore":
		case "so":
		case "concludes":
		// Makes a new statement if ∴ is not at the begining of a statement
		if(j == 0) {
		    words[i][j] = "∴";
		} else {
		    var a = words[i].slice(0,j);
		    var b = words[i].slice(j,(words[i].length));
		    words.splice(i,2,a,b);
		}
		break;
		
		case "nand": words[i][j] = '|';
		break;

		case "nor": words[i][j] = '↓';
		break; 

		case "every":
		case "for all":
		case "all": words[i][j] = '∀';
		break;

		case "there exists":
		case "exists": words[i][j] = '∃';
		break;
		
		case "may be":
		case "maybe":
		case "may":
		case "might be":
		case "might":
		case "possible":
		case "possibly": words[i][j] = '◊';
		break;
		
		case "necessary":
		case "necessarily":
		case "necessitates":
		case "required":
		case "requires": words[i][j] = '□';
		break;
		
		case "definitionally":
		case "is the definition of":
		case "by definition":
		case "tautologically":
		case "tautology": words[i][j] = '⊤';
		break;
		
		case "is contradictory to":
		case "is contrary to":
		case "contradicts":
		case "contrarily": words[i][j] = '⊥';
		break;
		
		case "prove":
		case "proves":
		case "is provably": words[i][j] = '⊢';
		break;
		
		case "implicates":
		case "implies": words[i][j] = '⊨';
		break;
		
		case "forces":
		case "makes": words[i][j] = '⊩';
		break;
	    }
	}
    }
    
    return words;
}

