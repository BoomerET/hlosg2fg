/*jshint esversion: 6 */
/*jshint multistr: true */

/* 
    Fantasy Ground adaptation by David Berkompas
       Skype: david.berkompas
       Discord: BoomerET#2354
       Fantasy Grounds: BoomerET
       Github: https://github.com/BoomerET
       Reddit: https://www.reddit.com/user/BoomerET
       Roll20: https://app.roll20.net/users/9982/boomeret
       Paypal.me: https://paypal.me/boomeret
       (All contributions are donated to Hospice,
          or go here: https://www.hollandhospice.org/giving/donate-now/)
*/

var startXML = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
startXML += "<root version=\"4\" dataversion=\"20201016\" release=\"19|CoreRPG:4\">\n";
startXML += "\t<character>\n";

var endXML = "\t</character>\n</root>\n";
var allXML = "";

var pcFilename = "";

var object;

var charRaceText = "";
var charRaceType = "";
var littleTheme = "";
var charClass = "";

$(function() {
    dispLinks.init();
    clLinks.init();
    donateFGC.init();

    $("#Linkwindow").jqxWindow("close");
    $("#CLwindow").jqxWindow("close");
    $("#DONwindow").jqxWindow("close");
    //$("#grabChar").jqxButton({ width: "150px", height: "35px", theme: "darkblue" });
    $("#charInput").jqxTextArea({ theme: "darkblue", width: 750, height: 150, placeHolder: "Input Character JSON here." });
    $("#charOutput").jqxTextArea({ theme: "darkblue", width: 750, height: 150, placeHolder: "Character XML output appear here." });
    //$("#getcharID").jqxInput({ placeHolder: "Enter Character ID", height: "35px", width: 200, minLength: 4, theme: "darkblue"});
    $("#dlChar").jqxButton({ width: "120px", height: "35px", theme: "darkblue" });
    $("#parseChar").jqxButton({ width: "120px", height: "35px", theme: "darkblue" });
    $("#resetChar").jqxButton({ width: "120px", height: "35px", theme: "darkblue" });
    //$("#verButtonC").jqxRadioButton({width: 250, height: 25, checked: true, theme: "darkblue"});
    //$("#verButtonU").jqxRadioButton({width: 250, height: 25, theme: "darkblue"});
    $("#jqxMenu").jqxMenu({ width: 95, height: "145px", mode: "vertical", theme: "darkblue"});
    $("#jqxMenu").css("visibility", "visible");

    $('#extLinks').click(function(e) {
        e.preventDefault();
        $('#Linkwindow').jqxWindow('open');
    });
    $('#goHome').click(function(e) {
        e.preventDefault();
        window.location.reload(false);
    });
    $('#contactUs').click(function(e) {
        e.preventDefault();
        window.open("https://docs.google.com/forms/d/1OTSE0zUqEcq14Epyp73YVHM9AavhI0uvtH1NeoRoKiA/edit", "_blank");
    });
    $('#showChangelog').click(function(e) {
        e.preventDefault();
        $('#CLwindow').jqxWindow('open');
    });
    $('#showDonations').click(function(e) {
        e.preventDefault();
        $('#DONwindow').jqxWindow('open');
    });

    $('#grabChar').on("click", function() {
        if (fgVersion == 0) {
            if (confirm("You've selected to create a character for FG Classic. Is this correct?")){
                //
            } else {
                return(false);
            }
        } else {
            if (confirm("You've selected to create a character for FG Unity. Is this correct?")){
                //
            } else {
                return(false);
            }
        }
        if(!$('#getcharID').val().trim().match(/\d+/)) {
            alert("Um, please enter your Character ID");
        } else if ($('#textHere').val() != "")  {
            var resetMe = confirm("You need to clear previous data, do you want me to do that for you?");
            if (resetMe == 1) {
                window.location.reload(false);
            }
        } else {
            $.ajax({
                data: { charID:  $('#getcharID').val().trim() },
                url: 'scripts/getChar.php',
                method: 'GET',
                success: function(data) {
                    try {
                        parseCharacter($.parseJSON(data));
                    } catch(e) {
                        alert("Unable to parse character: " + $('#getcharID').val().trim());
                        console.error(e);
                        return;
                    }
                },
                failure: function(msg) {
                    alert("Unable to find character: " + $('#getcharID').val().trim());
                    return;
                }
            });
        }
    });

    $("#dlChar").on("click", function() {
        if ($("#textHere").val() == "") {
            alert("You need to load a character first.");
            return;
        }
        if (pcFilename == "" || pcFilename == null) {
            var ts = Math.round((new Date()).getTime() / 1000);
            pcFilename = ts + ".xml";
        } else {
            pcFilename += ".xml";
        }

        var textFile = new Blob([$("#charOutput").val()], {
            type: 'text/plain'
        });
        invokeSaveAsDialog(textFile, pcFilename);
    });

    $("#parseChar").on("click", function() {
        //console.log("Parsing character");
        var character = jQuery.parseJSON($("#charInput").val());
        parseCharacter(character);
        //$.each(character.actors, function(i, v) {
        //    console.log("Key: " + i + "; Value: " + v.gameValues.actRace);
        //});
    });

    $("#popCharID").on("change", function(event) {
        var firstNumber = event.args.item.label.indexOf("(");
        var secondNumber = event.args.item.label.indexOf(")");
        glCharID = event.args.item.label.substring(firstNumber + 1, secondNumber);
        $('#getcharID').val(glCharID);
    });

    $("#resetChar").on("click", function() {
        window.location.reload(false);
    });

    // fgVersion = 0: Classic; = 1: Unity
    $("#verButtonC").on('change', function (event) {
        var checked = event.args.checked;
        if (checked) {
            fgVersion = 0;
        } else {
            fgVersion = 1;
        }
    });
});

function parseCharacter(inputChar) {
    var character = jQuery.extend(true, {}, inputChar);
    var buildXML = startXML;
    
    $.each(character.actors, function(index, element) {
        buildXML += "\t\t<name type=\"string\">" + element.name + "</name>\n";
        pcFilename = element.name;
    });

    
    $.each(character.actors, function(i, v) {
        
        // Abilities
        buildXML += "\t\t<abilities>\n";
        $.each(v.items, function(j, w) {
            if (w.compset == "AbilScore") {
                buildXML += "\t\t\t<" + w.name.toLowerCase() + ">\n";
                buildXML += "\t\t\t\t<score type=\"number\">" + w.stNet + "</score>\n";
                if (w.hasOwnProperty("stAbScModifier")) {
                    buildXML += "\t\t\t\t<bonus type=\"number\">" + w.stAbScModifier + "</bonus>\n";
                } else {
                    buildXML += "\t\t\t\t<bonus type=\"number\">0</bonus>\n";
                }
                buildXML += "\t\t\t</" + w.name.toLowerCase() + ">\n";
            }
        });
        buildXML += "\t\t</abilities>\n";

        // Race
        $.each(v.gameValues, function(k, x) {
            if (k == "actTypeText") {
                charRaceText = x;
            } else if (k == "actRace") {
                charRaceType = x;
            }
        });
        buildXML += "\t\t<race type=\"string\">" + charRaceText + "</race>\n";
		buildXML += "\t\t<racelink type=\"windowreference\">\n";
		buildXML += "\t\t\t<class>race</class>\n";
		buildXML += "\t\t\t<recordname>reference.race." + charRaceType + "@*</recordname>\n";
        buildXML += "\t\t</racelink>\n";
        
        // Theme
        $.each(v.items, function(j, w) {
            if (w.compset == "Ability") {
                // Find theme knowledge to get Theme, abThemeKnowSpa.139
                var themeKnow = j.substring(0,11);
                if (themeKnow == "abThemeKnow") {
                    var thisTheme = j.substring(11,14);

                    switch(j.substring(11,14)) {
                        case "AcP":
                            fullTheme = "Ace Pilot";
                            littleTheme = "acepilot";
                            break;
                        case "Bio":
                            fullTheme = "Biotechnician";
                            littleTheme = "biotechnician";
                            break;
                        case "BoH":
                            fullTheme = "Bounty Hunter";
                            littleTheme = "bountyhunter";
                            break;
                        case "CoA":
                            fullTheme = "Corporate Agent";
                            littleTheme = "corporateagent";
                            break;
                        case "Cul":
                            fullTheme = "Cultist";
                            littleTheme = "cultist";
                            break;
                        case "Cyb":
                            fullTheme = "Cyberborn";
                            littleTheme = "cyberborn";
                            break;
                        case "DTo":
                            fullTheme = "Death-Touched";
                            littleTheme = "deathtouched";
                            break;
                        case "Dra":
                            fullTheme = "Dragonblood";
                            littleTheme = "dragonblood";
                            break;
                        case "DrP":
                            fullTheme = ">Dream Prophet";
                            littleTheme = "dreamprophet";
                            break;
                        case "Gla":
                            fullTheme = "Gladiator";
                            littleTheme = "gladiator";
                            break;
                        case "Ico":
                            fullTheme = "Icon";
                            littleTheme = "icon";
                            break;
                        case "Mer":
                            fullTheme = "Mercenary";
                            littleTheme = "mercenary";
                            break;
                        case "Out":
                            fullTheme = "Outlaw";
                            littleTheme = "outlaw";
                            break;
                        case "Pri":
                            fullTheme = "Priest";
                            littleTheme = "priest";
                            break;
                        case "Rob":
                            fullTheme = "Roboticist";
                            littleTheme = "roboticist";
                            break;
                        case "Sch":
                            fullTheme = "Scholar";
                            littleTheme = "scholar";
                            break;
                        case "SoD":
                            fullTheme = "Solar Disciple";
                            littleTheme = "solardisciple";
                            break;
                        case "SPi":
                            fullTheme = "Space Pirate";
                            littleTheme = "spacepirate";
                            break;
                        case "Spa":
                            fullTheme = "Spacefarer";
                            littleTheme = "spacefarer";
                            break;
                        case "TeP":
                            fullTheme = "Tempered Pilgrim";
                            littleTheme = "temperedpilgrim";
                            break;
                        case "WiW":
                            fullTheme = "Wild Warden";
                            littleTheme = "wildwarden";
                            break;
                        case "Xna":
                            fullTheme = "Xenoarchaeologist";
                            littleTheme = "xenoarchaeologist";
                            break;
                        case "Xen":
                            fullTheme = "Xenoseeker";
                            littleTheme = "xenoseeker";
                            break;
                        default:
                            fullTheme = "Themeless";
                            littleTheme = "themeless";
                    }
                }
            }
        });
        buildXML += "\t\t<theme type=\"string\">" + fullTheme + "</theme>\n";
        buildXML += "\t\t<themelink type=\"windowreference\">\n";
        buildXML += "\t\t\t<class>theme</class>\n";
        buildXML += "\t\t\t<recordname>reference.theme." + littleTheme + "@*</recordname>\n";
        buildXML += "\t\t</themelink>\n";
        buildXML += "\t\t<themerecord type=\"string\">reference.theme." + littleTheme + "@*</themerecord>\n";

        // Class
        buildXML += "\t\t<classes>\n";
        classCount = 1;
        $.each(v.items, function(j, w) {
            if (w.compset == "Class") {
                thisIteration = pad(classCount, 5);
                
                buildXML += "\t\t\t<id-" + thisIteration + ">\n";
                var getArchetype = w.name.split("(")[1].split(")")[0];
                charClass = w.name.split("(")[0].trim();
                var smallCharClass = charClass.toLowerCase().replace(/[ _-]/g, '');
                //console.log("Class reference: " + smallCharClass);
                
                buildXML += "\t\t\t\t<archetype type=\"string\">" + getArchetype + "</archetype>\n";

                buildXML += "\t\t\t\t<archetypelink type=\"windowreference\">\n";
                buildXML += "\t\t\t\t\<class>archetype</class>\n";
                buildXML += "\t\t\t\t\t<recordname>reference.archetype." + getArchetype.toLowerCase().replace(/[ _-]/g, '') + "@*</recordname>\n";
                buildXML += "\t\t\t\t</archetypelink>\n";


                buildXML += "\t\t\t\t<name type=\"string\">" + charClass + "</name>\n";
                buildXML += "\t\t\t\t<level type=\"number\">" + w.clLevelNet + "</level>\n";
                buildXML += "\t\t\t\t<shortcut type=\"windowreference\">\n";
                buildXML += "\t\t\t\t\t<class>class</class>\n";
                buildXML += "\t\t\t\t\t<recordname>reference.class." + smallCharClass + "@*</recordname>\n";
                buildXML += "\t\t\t\t</shortcut>\n";

                switch(smallCharClass) {
                    case "envoy":
                        buildXML += "\t\t\t\t<classkey type=\"string\">Charisma</classkey>\n";
                        break;
                    case "mechanic":
                        buildXML += "\t\t\t\t<classkey type=\"string\">Intelligence</classkey>\n";
                        break;
                    case "mystic":
                        buildXML += "\t\t\t\t<classkey type=\"string\">Wisdom</classkey>\n";
                        break;
                    case "operative":
                        buildXML += "\t\t\t\t<classkey type=\"string\">Dexterity</classkey>\n";
                        break;
                    case "solarian":
                        buildXML += "\t\t\t\t<classkey type=\"string\">Charisma</classkey>\n";
                        break;
                    case "soldier":
                        buildXML += "\t\t\t\t<classkey type=\"string\">Strength</classkey>\n";
                        break;
                    case "technomancer":
                        buildXML += "\t\t\t\t<classkey type=\"string\">Intelligence</classkey>\n";
                        break;
                    default:
                        buildXML += "\t\t\t\t<classkey type=\"string\">None</classkey>\n";
                }

                buildXML += "\t\t\t</id-" + thisIteration + ">\n";
                classCount += 1;
            }
        });
        buildXML += "\t\t</classes>\n";

        // Skills
        totalSkills = 1;
        buildXML += "\t\t\t<skilllist>\n";
        $.each(v.items, function(j, w) {
            if (w.compset == "Skill") {
                thisIteration = pad(totalSkills, 5);
                totalSkills += 1;
                buildXML += "\t\t\t<id-" + thisIteration + ">\n";

                buildXML += "\t\t\t\t<label type=\"string\">" + w.name + "</label>\n";
                if (w.hasOwnProperty("skRanks")) {
                    buildXML += "\t\t\t\t<ranks type=\"number\">" + w.skRanks + "</ranks>\n";
                } else {
                    buildXML += "\t\t\t\t<ranks type=\"number\">0</ranks>\n";
                }
                if (w.hasOwnProperty("stNet")) {
                    buildXML += "\t\t\t\t<total type=\"number\">" + w.stNet + "</total>\n";
                } else {
                    buildXML += "\t\t\t\t<total type=\"number\">0</total>\n";
                }
                buildXML += "\t\t\t\t<state type=\"number\">1</state>\n";
                buildXML += "\t\t\t\t<showonminisheet type=\"number\">0</showonminisheet>\n";
                buildXML += "\t\t\t</id-" + thisIteration + ">\n";
            }
        });
        buildXML += "\t\t\t</skilllist>\n";

        // Racial Traits
        var abilityCount = 1;
        buildXML += "\t\t\t<traitlist>\n";
        $.each(v.items, function(j, w) {
            if (w.compset == "Ability" && !w.hasOwnProperty("AbilType")) {
                // Need to determine if this is a class ability or racial trait
                thisIteration = pad(abilityCount, 5);
                abilityCount += 1
                buildXML += "\t\t\t<id-" + thisIteration + ">\n";
                buildXML += "\t\t\t\t<name type=\"string\">" + w.name.split("(")[0] + "</name>\n";
                buildXML += "\t\t\t</id-" + thisIteration + ">\n";
            }
        });
        buildXML += "\t\t\t</traitlist>\n";

        // Theme abilities
        var themeCount = 1;
        buildXML += "\t\tt\<themeabilitylist>\n";
        $.each(v.items, function(j, w) {
            if (w.compset == "Ability" && w.hasOwnProperty("AbScUsed")) {
                thisIteration = pad(themeCount, 5);
                themeCount += 1;
                buildXML += "\t\t\t<id-" + thisIteration + ">\n";
                buildXML += "\t\t\t\t<name type=\"string\">" + w.name.split("(")[0] + "</name>\n";
                buildXML += "\t\t\t</id-" + thisIteration + ">\n";
            }
        });
        buildXML += "\t\tt\</themeabilitylist>\n";

        // Class Abilities
        var classAbilCount = 1;
        buildXML += "\t\tt\<specialabilitylist>\n";
        $.each(v.items, function(j, w) {
            if (w.compset == "Ability" && !w.hasOwnProperty("AbScUsed") && w.hasOwnProperty("AbilType") && w.AbilType == "Extra") {
                thisIteration = pad(classAbilCount, 5);
                classAbilCount += 1;
                buildXML += "\t\t\t<id-" + thisIteration + ">\n";
                buildXML += "\t\t\t\t<name type=\"string\">" + w.name.split("(")[0] + "</name>\n";
                buildXML += "\t\t\t</id-" + thisIteration + ">\n";
            }
        });
        buildXML += "\t\tt\</specialabilitylist>\n";
    });

    buildXML += endXML;
    $('#charOutput').val(buildXML);
}

const getObjects = function(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == ''){
            if (objects.lastIndexOf(obj) == -1){
                objects.push(obj);
            }
        }
    }
    return objects;
};

function replaceDash(str) {
    firstStep = str.replace(/-/g, "_");
    return firstStep.replace(/\s/g, "_");
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function pad(num, size) {
    var s = num + "";

    while (s.length < size) s = "0" + s;
    return s;
}

function invokeSaveAsDialog(file, fileName) {
    if (!file) {
        throw 'Blob object is required.';
    }

    if (!file.type) {
        file.type = 'video/webm';
    }

    var fileExtension = file.type.split('/')[1];

    if (fileName && fileName.indexOf('.') !== -1) {
        var splitted = fileName.split('.');
        fileName = splitted[0];
        fileExtension = splitted[1];
    }

    var fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension;

    if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
        return navigator.msSaveOrOpenBlob(file, fileFullName);
    } else if (typeof navigator.msSaveBlob !== 'undefined') {
        return navigator.msSaveBlob(file, fileFullName);
    }

    var hyperlink = document.createElement('a');
    hyperlink.href = URL.createObjectURL(file);
    hyperlink.target = '_blank';
    hyperlink.download = fileFullName;

    if (!!navigator.mozGetUserMedia) {
        hyperlink.onclick = function() {
            (document.body || document.documentElement).removeChild(hyperlink);
        };
        (document.body || document.documentElement).appendChild(hyperlink);
    }

    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    hyperlink.dispatchEvent(evt);

    if (!navigator.mozGetUserMedia) {
        URL.revokeObjectURL(hyperlink.href);
    }
}

function fixQuote(badString) {
    if(badString == "" || badString == null) {
        return "";
    }
    return badString.replace(/\n/g, '\n').replace(/\u2019/g, "'").replace(/\u2014/g, "-").replace(/"/g, "&#34;").replace(/\u2022/g, ":").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&nbsp;/g, " ").replace(/&rsquo;/g, "'").replace(/\s&/g, "&amp;").trim();
}

// Need two, one for FGC, another for FGU
function fixDesc(badString) {
    if(badString == "" || badString == null) {
        return "";
    }
    if (fgVersion == 0) {
        // FG Classic
        var tempString1 = badString.replace(/<a\s.*?\">/g, "").replace(/<\/a>/g, "").replace(/<\/span>/g, "").replace(/’/g, "'").replace(/—/g, "-");
    } else {
        // FG Unity
        var tempString1 = badString.replace(/<a\s.*?\">/g, "").replace(/<\/a>/g, "").replace(/<\/span>/g, "");
    }
    
    var tempString2 = tempString1.replace(/<img.*?">/g, "").replace(/<hr>/g, "<hr />").replace(/<span>/g, "");
    var tempString3 = tempString2.replace(/<br>/g, "<br />").replace(/&rsquo;/g, "'").replace(/&nbsp;/g, " ");
    var tempString4 = tempString3.replace(/&ldquo;/g, '"').replace(/<span\s.*?">/g, "").replace(/<em>/g, "").replace(/<\/em>/g, "")
    return tempString4.replace(/&rdquo;/g, '"').replace(/&mdash;/g, "-").replace(/&times;/g, "*").replace(/&minus;/g, "-").trim();
}

function convert_case(str) {
    var lower = str.toLowerCase();
    return lower.replace(/(^|\s)(w)/g, function(x) {
        return x.toUpperCase();
    });
}

function remove_tags_traits(badString) {
    var tempString1 = badString.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    var tempString2 = tempString1.replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&rdquo;/g, "\"").replace(/&ldquo;/g, "\"");
    var tempString3 = tempString2.replace(/&#34;/g, "\"").replace(/<br>/g, "<br />").replace(/&ndash;/g, "-");
    var tempString4 = tempString3.replace(/<th\sstyle/g, "<td style").replace(/<\/th>/g, "</td>").replace(/<th\srowspan/g, "<td rowspan").replace(/<th\scolspan/g, "<td colspan").replace(/<th>/g, "<td>");
    var tempString5 = tempString4.replace(/<span>/g, "").replace(/<\/span>/g, "").replace(/<span\sstyle\="font-weight\:400">/g, "");
    var tempString6 = tempString5.replace(/&nbsp;/g, " ").replace(/<br>/g, "\n").replace(/<h5>/g, "<p><b>").replace(/<\/h5>/g, "</b></p>").replace(/<span\sstyle\="color\:#[a-zA-Z0-9]{3}">/g, "").replace(/<span\sstyle\="color\:#[a-zA-Z0-9]{6}">/g, "");

    return tempString6;
}

var dispLinks = (function () {
    function _createLinks() {
        var userLinks = $('#displayLinks');
        var offset = userLinks.offset();
        $('#Linkwindow').jqxWindow({
            position: { x: 150, y: 150} ,
            theme: 'darkblue',
            isModal: true,
            showCollapseButton: true, maxHeight: 400, maxWidth: 700, minHeight: 200, minWidth: 200, height: 300, width: 500,
            initContent: function () {
                $('#Linkwindow').jqxWindow('focus');
            }
        });
    }
    return {
        config: {
            dragArea: null
        },
        init: function () {
            _createLinks();
        }
    };
} ());

var clLinks = (function () {
    function _createCL() {
        var userCL = $('#displayCL');
        var offset = userCL.offset();
        $('#CLwindow').jqxWindow({
            position: { x: 150, y: 50},
            theme: 'darkblue',
            showCollapseButton: true,
            maxWidth: 700, 
            minWidth: 200, 
            height: 450, 
            width: 500, 
            resizable: true,
            isModal: true,
            initContent: function () {
                $('#CLwindow').jqxWindow('focus');
            }
        });
    }
    return {
        config: {
            dragArea: null
        },
        init: function () {
            _createCL();
        }
    };
} ());

var donateFGC = (function () {
    function _createDon() {
        var userDon = $('#displayDon');
        var offset = userDon.offset();
        $('#DONwindow').jqxWindow({
            position: { x: 150, y: 150} ,
            theme: 'darkblue',
            isModal: true,
            showCollapseButton: true, maxHeight: 400, maxWidth: 700, minHeight: 200, minWidth: 200, height: 300, width: 500, 
            initContent: function () {
                $('#DONwindow').jqxWindow('focus');
            }
        });
    }
    return {
        config: {
            dragArea: null
        },
        init: function () {
            _createDon();
        }
    };
} ());
