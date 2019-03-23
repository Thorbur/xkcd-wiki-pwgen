/***
 Generates a easy human memorizable password from random words of a random Wikipedia article.
 Idea taken from http://jsfiddle.net/HMJJg/
 ***/

function strip(html) {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function generate() {
    const min_num_chars = parseInt(document.getElementById("chars").value);
    const sepa_char = document.getElementById("sepachar").value;
    const num_passwords = parseInt(document.getElementById("times").value);

    $("#output").empty();
    for (let i = 0; i < num_passwords; i++) {
        add_passwd(min_num_chars, sepa_char);
    }
}

function add_passwd(min_num_chars, sepa_char) {
    let title = "";


    //Get random ID and invoke next call
    $.getJSON("https://de.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&format=json&callback=?",
        function (data) {

            console.log(JSON.stringify(data));
            console.log("");

            const rndID = Object.keys(data['query']['pages'])[0];
            title = data['query']['pages'][rndID]['title'];
            console.log("ID = " + rndID);
            console.log("");


            //Get text
            $.getJSON("https://de.wikipedia.org/w/api.php?action=parse&pageid=" + rndID +
                "&prop=text&format=json&callback=?", function (data) {

                console.log(JSON.stringify(data));
                console.log("");

                const token = Object.keys(data.parse.text)[0];
                let text = data.parse.text[token].split("<p>");


                let pText = "";
                for (let p = 0; p < text.length; p++) {
                    //Remove html comment
                    text[p] = text[p].split("<!--");
                    if (text[p].length > 1) {
                        text[p][0] = text[p][0].split(/\r\n|\r|\n/);
                        text[p][0] = text[p][0][0];
                        text[p][0] += "</p> ";
                    }
                    text[p] = text[p][0];

                    //Construct a string from paragraphs
                    const htmlStrip = strip(text[p]); // remove HTML
                    const splitNewline = htmlStrip.split(/\r\n|\r|\n/); //Split on newlines
                    for (let newline = 0; newline < splitNewline.length; newline++) {
                        if (splitNewline[newline].substring(0, 11) !== "Cite error:") {
                            pText += splitNewline[newline];
                            pText += " ";
                        }
                    }
                }

                pText = pText.substring(0, pText.length - 2); // Remove extra newline
                pText = pText.replace(/\[\d+]/g, ""); // Remove reference tags (e.x. [1], [4], etc)
                pText = pText.replace("\&amp;", ""); // Remove &
                //pText = pText.replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/Ä/g,"Ae")
                // .replace(/Ö/g,"Oe").replace(/Ü/g,"Ue").replace(/ß/g,"ss");
                pText = pText.replace(/\u00e4/g, "ae").replace(/\u00c4/g, "Ae").replace(/\u00f6/g, "oe")
                    .replace(/\u00d6/g, "Oe").replace(/\u00fc/g, "ue").replace(/\u00dc/g, "Ue").replace(/\u00df/g, "ss"); // Remove Umlaute
                pText = pText.replace("-", " "); // Replace hyphen
                pText = pText.replace(/[^\w\s]/gi, ""); // Remove special characters

                console.log(pText);
                console.log("");

                if (pText.length > (min_num_chars * 2)) {
                    let pw = "";
                    const words = pText.trim().split(/\s+/); // Split on whitespace
                    let pick = Math.floor((Math.random() * words.length));
                    pw += words.splice(pick, 1);
                    while (pw.length < min_num_chars) {
                        pick = Math.floor((Math.random() * words.length));
                        pw += sepa_char + words.splice(pick, 1);
                    }

                    $("#output").append('<div class="pwtext">' + pw + '</div>')
                        .append('<div>' + title + '</div>')
                        .append("<a href='https://de.wikipedia.org/wiki/" + title.replace(" ", "_") +
                            "'>https://de.wikipedia.org/wiki/" + title.replace(" ", "_") + "</a>")
                        .append("<br>").append("<br>");

                } else {
                    add_passwd(min_num_chars, sepa_char); // try another time
                }
            });
        });
}
