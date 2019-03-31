/***
 Generates a easy human memorizable password from random words of a random Wikipedia article.
 Idea taken from http://jsfiddle.net/HMJJg/
 ***/

let ajaxQ = [];

function removeHTMLSection(text, beginIdentifier, baseTag, endTag) {
    // NOTE: Could be also done by parsing the input in the DOM, but that would be a security risk
    let beginIndex = text.search(beginIdentifier);
    if (beginIndex >= 0) {
        let baseTagCounter = 1;
        let subIndex = beginIndex + beginIdentifier.length;
        let endIndex = subIndex;
        let subtext = text.substring(subIndex);
        do {
            subIndex = subtext.search(baseTag);
            let nextEndIndex = subtext.search(endTag);
            if (subIndex >= 0 && nextEndIndex >= 0 && subIndex < nextEndIndex) {
                subIndex += baseTag.length;
                endIndex += subIndex;
                subtext = subtext.substring(subIndex);
                baseTagCounter++;
            } else {
                if(nextEndIndex >= 0) {
                    nextEndIndex += endTag.length;
                    endIndex += nextEndIndex;
                    subtext = subtext.substring(nextEndIndex);
                }
                baseTagCounter--;
            }

        } while (subtext.length > 0 && baseTagCounter > 0);
        return text.substring(0, beginIndex) + text.substring(endIndex, text.length);
    }

    return text;
}

function removeAllHTMLSection(text, beginIdentifier, baseTag, endTag){
    while(text.search(beginIdentifier) >= 0){
        text = removeHTMLSection(text, beginIdentifier, baseTag, endTag);
    }
    return text;
}

function generate() {
    const min_num_chars = parseInt(document.getElementById("chars").value);
    const sepa_char = document.getElementById("sepachar").value;
    const num_passwords = parseInt(document.getElementById("times").value);
    const lang = document.querySelector('input[name="wiki"]:checked').value;

    //abort all previous requests and clear array
    for (let r = 0; r < ajaxQ.length; r++) {
        ajaxQ[r].abort();
    }
    ajaxQ = [];

    // create table and fill it with ajax requests
    $("#output").empty()
        .append("<table id='pwtable' border='1'><tr><th>Password</th><th>Article</th><th>Link</th>" +
            "<th><a target='_blank' href='https://github.com/dropbox/zxcvbn'>zxcvbn-score</a></th></tr></table>");
    for (let i = 0; i < num_passwords; i++) {
        add_passwd(min_num_chars, sepa_char, lang);
    }
}

function add_passwd(min_num_chars, sepa_char, lang) {
    let title = "";

    //Get random ID and invoke next call
    ajaxQ.push($.getJSON("https://" + lang +
        ".wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&format=json&callback=?",
        function (data) {

            let rndID = Object.keys(data['query']['pages'])[0];
            title = data['query']['pages'][rndID]['title'];
            //console.log("ID = " + rndID);
            //rndID = 1860844;

            //Get text
            ajaxQ.push($.getJSON("https://" + lang + ".wikipedia.org/w/api.php?action=parse&pageid=" + rndID +
                "&prop=text&format=json&callback=?", function (data) {

                //console.log(JSON.stringify(data));

                const token = Object.keys(data.parse.text)[0];
                let text = data.parse.text[token];

                text = text.replace(/<!--[\s\S]*?(?=-->)-->/gm, ' '); // Remove html comment
                text = text.replace(/<script.*?(?=<\/script>)<\/script>/gm, ' '); // Remove script tags
                text = text.replace(/<style.*?(?=<\/style>)<\/style>/gm, ' '); // Remove style tags
                // Remove Wikipedia UI elements
                text = removeAllHTMLSection(text, '<span class="mw-headline"', "<span", "</span>");
                text = removeAllHTMLSection(text, '<span class="mw-editsection"', "<span", "</span>");
                text = removeAllHTMLSection(text, '<div class="NavHead"', "<div", "</div>");
                text = removeAllHTMLSection(text, '<div class="NavContent"', "<div", "</div>");
                text = removeAllHTMLSection(text, 'class="mw-editsection-visualeditor"', "<a", "</a>");
                text = removeAllHTMLSection(text, '<div id="toc"', "<div", "</div>");
                text = removeAllHTMLSection(text, '<div id="normdaten"', "<div", "</div>"); // German
                text = removeAllHTMLSection(text, '<table class="metadata', "<table", "</table>");
                text = removeAllHTMLSection(text, '<table class="box-Multiple_issues', "<table", "</table>"); // English
                text = removeAllHTMLSection(text, '<div role="navigation" class="navbox"', "<div", "</div>"); // English
                text = removeAllHTMLSection(text, 'class="noprint', "<table", "</table>");
                text = removeAllHTMLSection(text, '<div class="bandeau-article', "<div", "</div>"); // French
                text = removeAllHTMLSection(text, '<div class="homonymie"', "<div", "</div>"); // French
                text = removeAllHTMLSection(text, '<div class="autres-projets', "<div", "</div>"); // French
                text = removeAllHTMLSection(text, 'class="bandeau-portail"', "<ul", "</ul>"); // French
                text = removeAllHTMLSection(text, 'class="catlinks"', "<div", "</div>"); // French
                text = removeAllHTMLSection(text, 'class="ambox metadata', "<table", "</table>"); // Italian
                text = removeAllHTMLSection(text, 'class="extiw"', "<a", "</a"); // Italian

                text = text.replace(/<[^>]+>/gm, " "); // Remove HTML tags
                text = text.replace(/&[^;]*;/gmi, ' '); // Remove HTML codes
                text = text.replace(/\r\n|\r|\n/gm, ' '); // Remove newlines

                // Prepare text
                text = text.replace(/\[\d+]/gm, " "); // Remove reference tags (e.x. [1], [4], etc)
                text = text.replace(/-/gmi, ' ').replace(/–/gmi, ' '); // Replace hyphen
                text = text.replace(/:/gmi, ' '); // Replace colon
                text = text.replace(/\./gmi, ' '); // Replace dot
                text = text.replace(/,/gmi, ' '); // Replace comma
                text = text.replace(/\|/gmi, ' '); // Replace tab
                text = text.replace(/Ä/gm, "Ae").replace(/ä/gm, "ae").replace(/Ö/gm, "Oe")
                    .replace(/ö/gm, "öe").replace(/Ü/gm, "Ue").replace(/ü/gm, "ue")
                    .replace(/ß/gm, "ss"); // Replace Umlaute + Eszett
                text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, ""); // Replace diacritics
                text = text.replace(/[^a-zA-Z0-9 ]/gm, ''); // Remove any other special characters

                //console.log(text);

                // Generate password from list of words
                if (text.length > (min_num_chars * 2)) {
                    let pw = "";
                    const words = text.trim().split(/\s+/); // Split on whitespace
                    let pick = Math.floor((Math.random() * words.length));
                    pw += words.splice(pick, 1);
                    while (pw.length < min_num_chars) {
                        pick = Math.floor((Math.random() * words.length));
                        pw += sepa_char + words.splice(pick, 1);
                    }

                    $("#pwtable").append('<tr><td class="pwtext">' + pw + '</td><td>' + title + '</td><td>' +
                        "<a target='_blank' href='https://" + lang + ".wikipedia.org/wiki/" + title.replace(" ", "_") +
                        "'>https://" + lang + ".wikipedia.org/wiki/" + title.replace(" ", "_") + "</a></td>" +
                        "<td>" + zxcvbn(pw).score + "</td>");

                } else {
                    add_passwd(min_num_chars, sepa_char, lang); // try another time
                }
            }));
        }));
}
