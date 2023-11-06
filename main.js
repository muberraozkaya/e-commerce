//! HTML'den gelenler
const menuBtn = document.querySelector(".menu-bar")
const navBar = document.querySelector(".navbar-toggle")
const categoryList = document.querySelector(".categories");
const productList = document.querySelector(".products");
const modal = document.querySelector(".modal-wrapper");
const basketBtn = document.querySelector("#basket-btn");
const closeBtn = document.querySelector("#close-btn");
const basketList = document.querySelector("#list");
const totalInfo = document.querySelector("#total");

//! AddEventListener
menuBtn.addEventListener("click", () => {
  navBar.classList.toggle("active");
})

//HTML'nin yüklenme anını izleyen ve ardından fetchCategories'i çalıştıran yapı
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  fetchCategories();
});

/* Kategori bilgilerini alma
1- API'ye istek at
2- Gelen veriyi işle
3- Verileri ekrana bascak fonksiyonu çalıştır
4- Hata olursa kullanıcıyı bilgilendir */

const baseUrl = "https://fakestoreapi.com";

function fetchCategories() {
  fetch(`${baseUrl}/products/categories`)
    .then((response) => response.json())
    .then(renderCategories) //! then rendercategories'e yukarından aldığı verileri parametre olarak gönderir
    .catch((err) => alert("kategorileri alırken bir hata oluştu"));
}
// Arrow fonksiyonlarda hiç süslü parantez yoksa yazdığımız veriyi otomatikman return eder.
// Test.js örneğindeki gibi ayrıca return yapılmasına gerek yoktur

// Her bir kategori için ekrana kart oluşturur
function renderCategories(categories) {
  categories.forEach((category) => {
    // 1-div oluştur
    const categoryDiv = document.createElement("div");
    // 2-div'e class ekleme
    categoryDiv.classList.add("category");
    // 3-içeriğini belirleme
    const randomNum = Math.round(Math.random() * 1000);
    categoryDiv.innerHTML = ` 
        <div class="category">
        <img src="https://picsum.photos/300/300?r=${randomNum}" />
        <h2>${category}</h2>`;
    //4- HTML'ye gönderme
    categoryList.appendChild(categoryDiv);
  });
}

// Data değişkenini global scope'da tanımladık
// Bu sayede tüm fonksiyonlar bu değere erişebilecek
let data;

// Ürünler verisini çeken fonk
async function fetchProducts() {
  try {
    const response = await fetch(`${baseUrl}/products`);
    //api'ye istek at
    data = await response.json();
    //üstten cevap gelene kadar da ikinci await bekler, then gibi
    //gelen cevabı işle
    renderProducts(data);
    // async await aynı görevi yapıyo ve then catch, tek farkı hata işleme özelliği yok
    // async awaitte de hata potansiyeli olan durumlarda -sunucuya istek atma gibi-  try catch yapmalıyız
  } catch (error) {
    alert("Ürünleri alırken bir hata oluştu");
  }
}
// Tek fonksiyonda birden fazla url'e istek atıyorsam async await kullanılır,
// Kalan durumlarda then catch mantıklı

function renderProducts(products) {
  // Her ürün için bir ürün kartı oluşturma
  const cardHTML = products
    .map(
      (product) => `
  <div class="card">
    <div class="img-wrapper">
       <img src="${product.image}" alt="">
    </div>
    <h4>${product.title}</h4>
    <h4>${product.category}</h4>
    <div class="info">
      <span>${product.price}$</span>
      <button onclick="addToBasket(${product.id})">Sepete Ekle</button>
    </div>
</div>`
    )
    .join(" ");

  productList.innerHTML = cardHTML;

  // Cards html dizi halinde. Diziyi ekrana basamayacağımız için onu stringe cevirmeliyiz
}

//! Sepet işlemleri
let basket = [];
let total = 0;

// Modalı açar
basketBtn.addEventListener("click", () => {
  modal.classList.add("active");
  renderBasket();
  calculateTotal();
});

// Dışarıya veya çarpıya tıklanırsa model'ı kapatır
document.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("modal-wrapper") ||
    e.target.id === "close-btn"
  ) {
    modal.classList.remove("active");
  }
});

function addToBasket(id) {
  // Id'sinden yola çıkarak objenin değerlerini bulma
  const product = data.find((i) => i.id === id);
  console.log(product);
  // Sepete ürün daha önce eklendi ise bulma
  const found = basket.find((i) => i.id == id);

  if (found) {
    // Miktarını arttır
    found.amount++;
  } else {
    // Sepete ürünü ekler
    basket.push({ ...product, amount: 1 });
  }

  // Ürün sepete eklendiğinde bildirim verme
  Toastify({
    text: "Product added to chart.",
    duration: 3000,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();
}

// Sepete eklenen elemanları listeleyerek ekranda gösterme
function renderBasket() {
  console.log(basket);
  basketList.innerHTML = basket
    .map(
      (item) =>
        `<div class="item">
           <img src="${item.image}"/>
           <h3 class="title">${item.title.slice(0, 20) + "..."}</h3>
           <h4 class="price">$${item.price}</h4>
           <p>Miktar: ${item.amount}</p>
           <img onclick="handleDelete(${item.id})" id="delete-img" src="images/e-trash.png" alt="">
        </div>`
    )
    .join(" ");
}

//Toplam ürün sayısını ve fiyatını hesaplar
function calculateTotal() {
  // reduce > diziyi dönder ve elemanların belirlediğimiz değerlerini toplar
  const total = basket.reduce((sum, item) => sum + item.price * item.amount, 0);

  //toplam miktar hesaplama
  const amount = basket.reduce((sum, i) => sum + i.amount, 0);

  // hesapladığımız bilgileri ekrana basma
  totalInfo.innerHTML = `
  <span id="count">${amount} ürün</span>
  toplam:
  <span id="price">${total.toFixed(2)}</span>$ `;
}

// Ürünü toplamdan siler
function handleDelete(deleteId) {
  // kaldırılacak ürünü diziden çıkarma
  const newArray = basket.filter((i) => i.id !== deleteId);
  basket = newArray;

  // listeyi günceller
  renderBasket();

  // toplamı güncelle
  calculateTotal();
}