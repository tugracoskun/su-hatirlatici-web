from flask import Flask, render_template

# Flask uygulamasını oluşturuyoruz
app = Flask(__name__)

# Birisi ana sayfaya (yani http://127.0.0.1:5000/ adresine) geldiğinde
# aşağıdaki fonksiyonun çalışacağını söylüyoruz.
@app.route('/')
def index():
    # 'templates' klasörünün içindeki 'index.html' dosyasını bul ve
    # kullanıcının tarayıcısına gönder diyoruz.
    return render_template('index.html')

# Bu dosya doğrudan çalıştırılırsa, web sunucusunu başlat diyoruz.
# debug=True olması, biz kodda değişiklik yaptıkça sunucunun kendini
# otomatik yenilemesini sağlar. Bu çok kullanışlıdır.
if __name__ == '__main__':
    app.run(debug=True)