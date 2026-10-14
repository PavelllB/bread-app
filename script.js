// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// Навигация по табам
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
});

// Конструктор — подсчёт цены
const BASE_PRICE = 350;
const ADDON_PRICE = {
    flax: 30,
    sesame: 30,
    sunflower: 30,
    pumpkin: 40
};

let quantity = 1;

function calculateTotal() {
    let price = BASE_PRICE;
    
    // Добавки
    document.querySelectorAll('input[name="add-ons"]:checked').forEach(cb => {
        price += ADDON_PRICE[cb.value] || 0;
    });
    
    const total = price * quantity;
    document.getElementById('total-price').textContent = `${total} ₽`;
    return { price, total };
}

// Слушатели изменений
document.querySelectorAll('input[name="base"], input[name="malt"], input[name="add-ons"]').forEach(input => {
    input.addEventListener('change', calculateTotal);
});

// Количество
document.getElementById('qty-minus').addEventListener('click', () => {
    if (quantity > 1) {
        quantity--;
        document.getElementById('qty-value').textContent = quantity;
        calculateTotal();
    }
});

document.getElementById('qty-plus').addEventListener('click', () => {
    quantity++;
    document.getElementById('qty-value').textContent = quantity;
    calculateTotal();
});

// Отправка заказа
document.getElementById('order-btn').addEventListener('click', () => {
    const base = document.querySelector('input[name="base"]:checked').value;
    const malt = document.querySelector('input[name="malt"]:checked').value;
    const addons = [...document.querySelectorAll('input[name="add-ons"]:checked')].map(cb => cb.value);
    const { price, total } = calculateTotal();
    
    const baseNames = {
        rye: 'Ржаная цельнозерновая',
        wheat1: 'Пшеничная 1с',
        'wheat-whole': 'Пшеничная цельнозерновая',
        mix: 'Микс 3 муки'
    };
    
    const addonNames = {
        flax: 'Семена льна',
        sesame: 'Кунжут',
        sunflower: 'Семечки подсолнечника',
        pumpkin: 'Тыквенные семечки'
    };
    
    let message = `🍞 Заказ хлеба:\n\n`;
    message += `Основа: ${baseNames[base]}\n`;
    message += `Солод: ${malt === 'yes' ? 'Да' : 'Нет'}\n`;
    if (addons.length) {
        message += `Добавки: ${addons.map(a => addonNames[a]).join(', ')}\n`;
    }
    message += `Количество: ${quantity} бух.\n`;
    message += `Итого: ${total} ₽`;
    
    // Показываем красивое уведомление через Telegram API
    if (tg) {
        tg.showPopup({
            title: 'Заказ сформирован!',
            message: 'Сейчас откроется чат с Павлом. Текст заказа уже вставлен — просто нажмите "Отправить".',
            buttons: [
                {type: 'ok', text: 'Открыть чат'}
            ]
        }, (buttonId) => {
            if (buttonId === 'ok') {
                const encodedMessage = encodeURIComponent(message);
                tg.openTelegramLink(`https://t.me/pavel_bornovalov?text=${encodedMessage}`);
            }
        });
    } else {
        // Фоллбэк для браузера
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://t.me/pavel_bornovalov?text=${encodedMessage}`, '_blank');
    }
});

// Первичный расчёт
calculateTotal();
