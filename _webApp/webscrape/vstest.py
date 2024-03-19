import requests
import time
from bs4 import BeautifulSoup


ratecount = []
rates = []
max_attempts = 10

for i in range(3):
    if i == 0:
        url = 'https://www.tripadvisor.com.tr/Attractions-g293916-Activities-zft11154-Bangkok.html'
    else:
        url = 'https://www.tripadvisor.com.tr/Attractions-g293916-Activities-oa' + str(i*30) + '-zft11154-Bangkok.html'

    attempt_count = 0
    while attempt_count < max_attempts:
        try:
            response = requests.get(url, headers={'User-Agent': "Mozilla/5.0"})
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                name_elements = soup.find_all('div', class_='XfVdV o AIbhI')
                rating_elements = soup.find_all('div', class_='jVDab o W f u w JqMhy')

                for j in range(min(len(name_elements), len(rating_elements))):
                    rating_svg = rating_elements[j].find('svg')
                    if rating_svg:
                        rating_text = rating_svg.get('aria-label')
                        if rating_text:
                            # '\xa0' karakterinden sonrasını almak için split ve son elemanı seçmek
                            rating_text = rating_text.split('\xa0')[-1]
                    else:
                        rating_text = 'Rating bilgisi bulunamadı'
    
                    rating_number = rating_elements[j].find('span', class_='biGQs _P pZUbB osNWb').get_text(strip=True)
                    rates.append(rating_number)
                    ratecount.append(rating_text)
                break  # Başarılı olduğunda döngüyü kır
            elif response.status_code == 403:
                print(f"403 Forbidden hatası alındı. {attempt_count + 1}. yeniden deneme yapılıyor.")
                time.sleep(15)  # 10 saniye bekleyip yeniden deneyin
                attempt_count += 1
            else:
                print(f"Beklenmeyen hata: {response.status_code}")
                break
        except Exception as e:
            print(f"Bir hata oluştu: {e}")
            break

    time.sleep(5) 