import requests
from bs4 import BeautifulSoup as soup

html = requests.get('https://www.tripadvisor.com.tr/Attractions-g293916-Activities-c26-t142-Bangkok.html')
html.status_code

bsobj = soup(html.content,'lxml')

pazar = []
for name in bsobj.findAll('div',{'class':'XfVdV o AIbhI'}):
    pazar.append(name.text.strip())
   
    
pazar