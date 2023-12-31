/* eslint-disable max-len */
import { request } from './api.js';

let currentPage = 1;
let page = 1;
let fetchedCards = [];
const productsPerPage = 24;
const totalProducts = 461;
const totalPages = Math.ceil(totalProducts / productsPerPage);
const url = `/products.json?limit=${productsPerPage}`;
const defaultImg = 'https://voodoo-dev-store.com/cdn/shop/products/AAUvwnj0ICORVuxs41ODOvnhvedArLiSV20df7r8XBjEUQ_s900-c-k-c0x00ffffff-no-rj_72c7d7cb-344c-4f62-ad0d-f75ec755894d.jpg?v=1670516960';

const productCards = document.getElementById('product-cards');
const cartContainer = document.getElementById('cart-container');

const alphaButton = document.getElementById('alpha');
let isAlphaButtonClick = false;

const getTotalStorage = () => {
  const totalFromLocalStorage = localStorage.getItem('total');
  const totalStorage = totalFromLocalStorage
    ? JSON.parse(totalFromLocalStorage)
    : 0;

  return totalStorage;
};

const getCartStorage = () => {
  const cardFromLocalStorage = localStorage.getItem('cart');
  const cartStorage = cardFromLocalStorage
    ? JSON.parse(cardFromLocalStorage)
    : [];

  return cartStorage;
};

const getCartStorageItemCount = id => {
  const cartStorage = getCartStorage();
  const cartStorageCount = cartStorage.find(cartStorageItem => cartStorageItem.id === id).count;
  const cartItemCount = document.getElementById(`count-${id}`);
  
  if (cartItemCount) {
    cartItemCount.textContent = cartStorageCount;
  }
  
  return cartStorageCount;
};

const updateCartStorage = cart => {
  const cartStorage = getCartStorage();

  cartStorage.push(cart);

  localStorage.setItem('cart', JSON.stringify(cartStorage));
};

const deleteFromCartStorage = id => {
  const cart = getCartStorage();
  const filteredCart = cart.filter(cartItem => cartItem.id !== id);

  localStorage.setItem('cart', JSON.stringify(filteredCart));
};

const updateTotalStorage = price => {
  let totalStorage = getTotalStorage();
  const total = Math.round((totalStorage + price) * 100) / 100;
  
  localStorage.setItem('total', JSON.stringify(total));
};

const updateTotal = () => {
  const total = document.getElementById('total');
  total.textContent = getTotalStorage();
};

const createCartItem = item => {
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

  const cartItemCount = document.createElement('span');
  cartItemCount.setAttribute('id', `count-${item.id}`);
  cartItemCount.textContent = getCartStorageItemCount(item.id);

  const removeButton = document.createElement('button');
  removeButton.disabled = !(getCartStorageItemCount(item.id) > 1);
  removeButton.setAttribute('id', `remove-${item.id}`);
  removeButton.addEventListener('click', () => {
    updateCount(item.id, 'dec');

    const cartCount = getCartStorageItemCount(item.id);

    removeButton.disabled = cartCount <= 1;
  });
  removeButton.textContent = '-';

  const addButton = document.createElement('button');
  addButton.setAttribute('id', `add-${item.id}`);
  addButton.addEventListener('click', () => {
    updateCount(item.id);

    const cartCount = getCartStorageItemCount(item.id);
    
    removeButton.disabled = !(cartCount > 1);
  });
  addButton.textContent = '+';

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('id', `delete-button-${item.id}`)
  deleteButton.addEventListener('click', () => {
    const cart = getCartStorage();
    const cartItemCount = cart.find(cartItem => cartItem.id === item.id).count;
    const button = document.getElementById(`add-button-${item.id}`);

    if (button) {
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
    }
  
    updateTotalStorage(-(+item.price * cartItemCount));
    updateTotal();
    deleteFromCartStorage(item.id);
  
    cartContainer.removeChild(cartItem);
  });

  const deleteIcon = document.createElement('img');
  deleteIcon.setAttribute('src', 'delete.svg');
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
};

const updateCount = (id, action = 'inc') => {
  const cart = getCartStorage()
  const cartItemIndex = cart.findIndex(cartItem => cartItem.id === id);

  if (action === 'inc') {
    cart[cartItemIndex].count += 1;

    updateTotalStorage(+cart[cartItemIndex].price);
  } else  {
    cart[cartItemIndex].count -= 1;

    updateTotalStorage(-cart[cartItemIndex].price);
  } 

  localStorage.setItem('cart', JSON.stringify(cart));
  
  updateTotal();
}

const addToCart = item => {
  const cartItem = {
    id: item.id,
    title: item.title,
    image: item.images[0]?.src || defaultImg,
    price: item.variants[0].price,
    count: 1,
  }
  
  updateCartStorage(cartItem);
  updateTotalStorage(+cartItem.price)
  updateTotal();
  createCartItem(cartItem);
}

const createProductCard = fetchedProductCard => {
  const cart = getCartStorage();
  const cardsContainer = document.getElementById('cards-container');

  const imgUrl = fetchedProductCard.images[0]?.src
    ? fetchedProductCard.images[0].src
    : defaultImg;

  const card = document.createElement('article');
  card.setAttribute('id', `card-${fetchedProductCard.id}`);
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
  title.textContent = `${fetchedProductCard.title}`;
  
  const price = document.createElement('span');
  price.textContent = `${fetchedProductCard.variants[0].price}`;

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
  buttonAddToCart.setAttribute('id', `add-button-${fetchedProductCard.id}`);
  buttonAddToCart.classList.add(
    'border',
    'border-black',
    'text-sm',
    'p-3',
    'rounded',
    'text-center',
  )

  if (cart.findIndex(cartItem => cartItem.id === fetchedProductCard.id) > -1) {
    buttonAddToCart.classList.add(
      'bg-[#fcf7e6]',
      'text-black',
    );
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

    buttonAddToCart.textContent = 'ADDED';
    buttonAddToCart.disabled = true;
  } else {
    buttonAddToCart.classList.add(
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
    buttonAddToCart.classList.remove(
      'bg-[#fcf7e6]',
      'text-black',
    );
  
    buttonAddToCart.textContent = 'ADD TO CARD';
    buttonAddToCart.disabled = false;
  }

  buttonAddToCart.addEventListener('click', () => {
    addToCart(fetchedProductCard);
  
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

const fetchProductCards = async page => {
  const data = await request(url + `&page=${page}`);

  return data.products;
}

const clearCardContainer = () => {
  const cardsContainer = document.getElementById('cards-container');
  productCards.removeChild(cardsContainer);

  const newCardsContainer = document.createElement('div');

  newCardsContainer.setAttribute('id', 'cards-container');
  newCardsContainer.classList.add(
    'flex',
    'flex-col',
    'gap-y-12',
    'md:flex-row',
    'md:flex-wrap',
    'md:justify-center',
    'md:gap-x-8',
  )

  productCards.appendChild(newCardsContainer);
}

const renderCards = async page => {
  fetchedCards = await fetchProductCards(page);
  fetchedCards.forEach(createProductCard);
}

const createPaginationList = (currentPage) => {
  const maxPages = 3;

  const pages = [{
    page: 1,
    current: currentPage === 1,
  }];

  let start = 0;

  if (currentPage < maxPages + 1) {
     start = 2;
  } else if (currentPage >= maxPages + 1 && currentPage < totalPages - 1) {
    
     start = currentPage - 1
  } else {
    start = totalPages - maxPages;
  }
  
  let end = start + maxPages;

  if (currentPage >= totalPages - 2) {
  
    end = totalPages;
  }

  if (currentPage >= maxPages + 1) {
    pages.push({ page: '...'} )
  }

  for (let i = start; i < end; i++) {
    pages.push({ page: i, current: currentPage === i });
  }

  if (currentPage <= totalPages - 3) {
    pages.push({ page: '...' })
  }

  pages.push({
    page: 20,
    current: currentPage === totalPages,
  }); 

  return pages;
}

const paginate = (currentPage) => {
  const pages = createPaginationList(currentPage);
  const pagination = document.getElementById('pagination');
  const paginationContainer = document.createElement('div');
  paginationContainer.classList.add(
    'mx-auto',
    'flex',
    'justify-center',
    'gap-2.5',
    'xl:mt-16',
  );

  pages.map((item) => {
    const paginationLinkElement = document.createElement('button');
    const paginationActiveElement = document.createElement('span');
    const paginationEmptyElement = document.createElement('span');

    paginationLinkElement.addEventListener('click', async () => {
      pages.find(page => page.current).current = false;
      
      item.current = true;

      window.scrollTo(0, 0);

      clearCardContainer();
      renderCards(item.page);

      pagination.removeChild(paginationContainer);
      paginate(item.page);
    })

    paginationEmptyElement.textContent = '...';
    paginationEmptyElement.classList.add(
      'h-10',
      'w-10',
      'leading-10',
      'border',
      'border-black',
      'rounded-full',
      'text-center',
      'text-lg',
    );

    paginationLinkElement.classList.add(
      'h-10',
      'w-10',
      'leading-10',
      'border',
      'border-black',
      'rounded-full',
      'text-center',
      'text-lg',
    );

    paginationActiveElement.classList.add(
      'current',
      'h-10',
      'w-10',
      'leading-10',
      'border',
      'border-black',
      'rounded-full',
      'text-center',
      'text-lg',
      'bg-black',
      'text-white',
    );

    if (item.current) {
      paginationActiveElement.setAttribute('id', `pagination-${item.page}`);
      paginationActiveElement.textContent = item.page;
      paginationContainer.appendChild(paginationActiveElement);
    } else if (item.page === '...') {
      paginationContainer.appendChild(paginationEmptyElement);
    } else {
      paginationLinkElement.setAttribute('id', `pagination-${item.page}`);
      paginationLinkElement.textContent = item.page;
      paginationContainer.appendChild(paginationLinkElement);
    }
  });
  
  pagination.appendChild(paginationContainer);
}

if(localStorage.getItem('cart')) {
  const cart = getCartStorage()
  cart.forEach(createCartItem);
}

if (localStorage.getItem('total')) {
  const total = document.getElementById('total');
  total.textContent = getTotalStorage();
}

alphaButton.addEventListener('click', () => {
  const hiddenInfo = document.getElementById('alert');

  if (isAlphaButtonClick) {
    isAlphaButtonClick = false;

    hiddenInfo.classList.add('hidden');
  } else {
    isAlphaButtonClick = true;

    hiddenInfo.classList.remove('hidden');
  }
});

renderCards(page);
paginate(currentPage);
