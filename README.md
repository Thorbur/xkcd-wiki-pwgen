xkcd-wiki-pwgen
===============

A password generator like in http://xkcd.com/936/ based on random words from a random Wikipedia article. 
There are already existing some webpages implementing this, but only in english and presumably using any kind of dictionary. 
But by using Wikipedia as word source, it's possible to have more uncommon words than from a dictonary and you could choose Wikipedia sites in different languages, because I think remembering words in your mother tongue is easier.

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
