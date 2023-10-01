/* eslint-disable max-len */
import { request } from './api.js';

let currentPage = 1;
let page = 1;
let fetchedCards = [];
const productsPerPage = 24;
const totalProducts = 461;
const totalPages = Math.ceil(totalProducts / productsPerPage);
const url = `/products.json?limit=${productsPerPage}`;
const defaultImg = 'https://voodoo-dev-store.com/cdn/shop/products/AAUvwnj0ICORVuxs41ODOvnhvedArLiSV20df7r8XBjEUQ_s900-c-k-c0x00ffffff-no-rj_72c7d7cb-344c-4f62-ad0d-f75ec755894d.jpg?v=1670516960'
const cardsContainer = document.getElementById('cards-container');
const total = document.getElementById('total');
const cartContainer = document.getElementById('cart-container');
const cardFromLocalStorage = localStorage.getItem('cart');
const cart = cardFromLocalStorage
  ? JSON.parse(cardFromLocalStorage)
  : [];

const createCartItem = (item) => {
  const cartItem = document.createElement('div');
  cartItem.setAttribute('id', `cart-item-${item.id}`)
  cartItem.classList.add(
    'flex',
    'gap-4',
    'justify-between',
  )

  const cartItemImage = document.createElement('img');
  cartItemImage.setAttribute('src', item.image);
  cartItemImage.setAttribute('alt', 'product');
  cartItemImage.classList.add(
    'w-20',
    'h-20',
    'border',
    'rounded',
  );

  const infoWraper = document.createElement('div');
  infoWraper.classList.add(
    'flex-auto',
    'flex',
    'flex-col',
    'justify-between',
  )

  const cartItemTitle = document.createElement('span');
  cartItemTitle.textContent = item.title;

  const cartItemTotal = document.createElement('span');
  cartItemTotal.textContent = item.price;

  const buttonWraper = document.createElement('div');
  buttonWraper.classList.add('flex', 'gap-1')

  const removeButton = document.createElement('button');
  removeButton.addEventListener('click', () => {
    updateCount(item.id, 'dec');
  
    const cartCount = cart.find(cartItem => cartItem.id = item.id).count;
    cartItemCount.textContent = cartCount;

    if (+total.textContent > +item.price) {
      total.textContent = +total.textContent - +item.price;
    } else {
      total.textContent = 0;
    }
  });
  removeButton.textContent = '-';

  const cartItemCount = document.createElement('span');
  cartItemCount.textContent = item.count;

  const addButton = document.createElement('button');
  addButton.addEventListener('click', () => {
    updateCount(item.id);
  
    const cartCount = cart.find(cartItem => cartItem.id = item.id).count;
    cartItemCount.textContent = cartCount;
    total.textContent = +total.textContent + +item.price;
  });
  addButton.textContent = '+';

  const deleteButton = document.createElement('button');
  deleteButton.addEventListener('click', () => {
    const filteredCart = cart.filter(cartItem => cartItem.id !== item.id);
  
    localStorage.setItem('cart', JSON.stringify(filteredCart));
    cartContainer.removeChild(cartItem);
    total.textContent = 0;

    const button = document.getElementById(`button-${item.id}`);
    button.classList.remove(
      'bg-[#fcf7e6]',
      'text-black',
    );
    button.classList.add(
      'transition',
      'ease-in-out',
      'delay-100',
      'hover:border',
      'hover:border-black',
      'hover:text-black',
      'hover:bg-[#fcf7e6]',
      'bg-black',
      'text-white',
    );
    button.textContent = 'ADD TO CART';
    button.disabled = false;
  });

  const deleteIcon = document.createElement('img');
  deleteIcon.setAttribute('src', './img/delete.svg');
  deleteIcon.setAttribute('alt', 'delete logo');

  buttonWraper.appendChild(removeButton);
  buttonWraper.appendChild(cartItemCount);
  buttonWraper.appendChild(addButton);

  infoWraper.appendChild(cartItemTitle);
  infoWraper.appendChild(cartItemTotal);
  infoWraper.appendChild(buttonWraper);

  deleteButton.appendChild(deleteIcon);

  cartItem.appendChild(cartItemImage);
  cartItem.appendChild(infoWraper);
  cartItem.appendChild(deleteButton);

  cartContainer.appendChild(cartItem);

  cart.forEach(currentCartItem => total.textContent = +total.textContent + +currentCartItem.price);
};

const updateCount = (id, action = 'inc') => {
  const cartItemIndex = cart.findIndex(cartItem => cartItem.id === id);

  if (action === 'inc') {
    cart[cartItemIndex].count += 1;
  } else {
    cart[cartItemIndex].count = cart[cartItemIndex].count > 0
      ? cart[cartItemIndex].count -= 1
      : cart[cartItemIndex].count = 0;
  }

  localStorage.setItem('cart', JSON.stringify(cart));
}

const addToCart = (item) => {
  const cartItem = {
    id: item.id,
    title: item.title,
    image: item.images[0]?.src || defaultImg,
    price: item.variants[0].price,
    count: 1,
  }

  cart.push(cartItem);
  
  localStorage.setItem('cart', JSON.stringify(cart));
  createCartItem(cartItem);
}

const createCard = fetchedCard => {
  const imgUrl = fetchedCard.images[0]?.src
    ? fetchedCard.images[0].src
    : defaultImg;

  const card = document.createElement('article');
  card.setAttribute('id', `card-${fetchedCard.id}`);
  card.classList.add(
    'flex',
    'flex-col',
    'gap-3',
    'mx-auto',
    'md:mx-0',
  );

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('relative');

  const usedTag = document.createElement('div');
  usedTag.classList.add(
    'absolute',
    'rounded',
    'text-sm',
    'py-1.5',
    'px-2',
    'bg-black',
    'text-white',
    'top-3',
    'left-3',
  );
  usedTag.textContent = 'Used';

  const imageWraper = document.createElement('div');
  imageWraper.classList.add(
    'border',
    'border-black',
    'rounded',
  );

  const image = document.createElement('img');
  image.setAttribute('src', `${imgUrl}`);
  image.setAttribute('alt', 'product');
  image.classList.add(
    'object-cover',
    'h-72',
    'w-72',
  );

  const textContainer = document.createElement('div');
  textContainer.classList.add('flex', 'justify-between', 'w-72',);

  const textLeft = document.createElement('div');
  textLeft.classList.add(
    'font-bold',
    'text-sm',
    'flex',
    'flex-col',
    'truncate'
  );

  const title = document.createElement('span');
  title.classList.add('truncate');
  title.textContent = `${fetchedCard.title}`;
  
  const price = document.createElement('span');
  price.textContent = `${fetchedCard.variants[0].price}`;

  const textRight = document.createElement('div');
  textRight.classList.add(
    'text-sm',
    'flex',
    'flex-col',
    'items-end',
  );

  const condition = document.createElement('span');
  condition.classList.add('font-medium');
  condition.textContent = 'Condition';

  const used = document.createElement('span');
  used.classList.add('text-right');
  used.textContent = 'Slightly used';

  const buttonAddToCart = document.createElement('button');
  buttonAddToCart.setAttribute('id', `button-${fetchedCard.id}`);
  buttonAddToCart.classList.add(
    'border',
    'border-black',
    'transition',
    'ease-in-out',
    'delay-100',
    'hover:border',
    'hover:border-black',
    'hover:text-black',
    'hover:bg-[#fcf7e6]',
    'font-bold',
    'text-white',
    'bg-black',
    'text-sm',
    'p-3',
    'rounded',
    'text-center',
  );
  buttonAddToCart.textContent = 'ADD TO CARD';
  buttonAddToCart.addEventListener('click', () => {
    addToCart(fetchedCard);
  
    buttonAddToCart.textContent = 'ADDED';
    buttonAddToCart.disabled = true;
    buttonAddToCart.classList.remove(
      'transition',
      'ease-in-out',
      'delay-100',
      'hover:border',
      'hover:border-black',
      'hover:text-black',
      'hover:bg-[#fcf7e6]',
      'bg-black',
      'text-white',
    );
    buttonAddToCart.classList.add(
      'bg-[#fcf7e6]',
      'text-black',
    );
  })

  imageWraper.appendChild(image);
  imageContainer.appendChild(usedTag);
  imageContainer.appendChild(imageWraper);

  textLeft.appendChild(title);
  textLeft.appendChild(price);
  textRight.appendChild(condition);
  textRight.appendChild(used);
  textContainer.appendChild(textLeft);
  textContainer.appendChild(textRight);

  card.appendChild(imageContainer);
  card.appendChild(textContainer);
  card.appendChild(buttonAddToCart);

  cardsContainer.appendChild(card);
};

if(cart) {
  cart.forEach(createCartItem);
}

const fetchCards = async page => {
  const data = await request(url + `&page=${page}`);
  return data.products;
}

fetchedCards = await fetchCards(page);
fetchedCards.forEach(createCard);


