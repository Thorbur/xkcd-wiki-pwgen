xkcd-wiki-pwgen
===============

This is another password generator inspired by http://xkcd.com/936/, but based on random words from a random Wikipedia article. 
There exist already some webpages implementing a similar algorithm, but they use only english words and presumably use any kind of dictionary. 
But by using Wikipedia as word source, it's possible to have more uncommon words than from a dictonary and you could also choose Wikipedia sites in different languages. I think remembering words in your mother tongue is easier, therefore I wrote this password generator.

To view the password generator follow this link:  
http://htmlpreview.github.io/?https://github.com/Thorbur/xkcd-wiki-pwgen/blob/master/xkcd-wiki-pwgen.html

NOTICE:  
I found another great project on github that is doing the same   
https://github.com/RobertZenz/Bivalvia/blob/master/Tools/genPassWiki.sh  
Kudos!  
However, because this implementation uses only HTML and JavaScript, it is platform independent and has less requirements.

TODO:
- wikipedia site selection
- fix word separation for some cases (I think issue is caused by tables)
