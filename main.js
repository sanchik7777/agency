import { translations } from './translations.js'
const headerButtons = document.querySelector('.header-buttons')
const modalForm = document.querySelector('.modalForm')
const closeModalBtn = document.querySelector('#closeModal')

const modalContent = document.querySelector('.modal-content')
// Открытие модального окна
headerButtons.addEventListener('click', () => {
	modalForm.classList.add('active')
})

// Закрытие по крестику
closeModalBtn.addEventListener('click', () => {
	modalForm.classList.remove('active')
})

modalForm.addEventListener('click', e => {
	// Проверяем, был ли клик именно на фон (а не на дочерние элементы)
	if (e.target === modalForm) {
		modalForm.classList.remove('active')
	}
})

// Остановка всплытия события для содержимого модалки
modalContent.addEventListener('click', e => {
	e.stopPropagation()
})
function updateLanguage(lang) {
	const upperLang = lang.toUpperCase()
	const lowerLang = lang.toLowerCase()

	// Меняем текст на странице
	document.querySelectorAll('.translatable').forEach(el => {
		const key = el.dataset.key
		if (translations[upperLang] && translations[upperLang][key]) {
			el.innerHTML = translations[upperLang][key]
		}
	})
	// Меняем плейсхолдеры
	document.querySelectorAll('[data-placeholder-key]').forEach(input => {
		const key = input.dataset.placeholderKey
		if (translations[upperLang] && translations[upperLang][key]) {
			input.placeholder = translations[upperLang][key]
		}
	})
	// Меняем текущий язык в селекте
	document.querySelector('.selected').textContent = upperLang

	// Меняем lang в <html>
	document.documentElement.lang = lowerLang

	// Обновляем URL
	updateURLWithLang(lowerLang)

	// 🔽 Скрываем текущий язык из списка
	document.querySelectorAll('.lang-options li').forEach(li => {
		const liLang = li.getAttribute('data-lang').toUpperCase()
		li.style.display = liLang === upperLang ? 'none' : 'block'
	})
}

function updateURLWithLang(lang) {
	const url = new URL(window.location)
	url.searchParams.set('lang', lang.toLowerCase())
	window.history.replaceState({}, '', url)
}

document.addEventListener('DOMContentLoaded', () => {
	const select = document.querySelector('.lang-select')
	const selected = select.querySelector('.selected')
	const options = select.querySelector('.lang-options')

	// Toggle language dropdown
	selected.addEventListener('click', () => {
		options.style.display = options.style.display === 'block' ? 'none' : 'block'
		select.classList.toggle('active')
	})

	// Handle language option click
	select.querySelectorAll('.lang-options li').forEach(option => {
		option.addEventListener('click', () => {
			const lang = option.getAttribute('data-lang')
			options.style.display = 'none'
			select.classList.remove('active')
			console.log('Detected browser language:', navigator.language)
			console.log('Using language:', lang)
			updateLanguage(lang)
		})
	})

	// Close dropdown if clicked outside
	document.addEventListener('click', e => {
		if (!select.contains(e.target)) {
			options.style.display = 'none'
			select.classList.remove('active')
		}
	})

	// Detect language from URL or browser
	const urlParams = new URLSearchParams(window.location.search)
	let lang = urlParams.get('lang')
	console.log('Lang - ', lang)
	if (!lang) {
		// Use browser language if no lang param
		const browserLang = navigator.language.slice(0, 2).toLowerCase()

		if (browserLang === 'uk') lang = 'ua'
		else if (browserLang === 'ru') lang = 'ru'
		else lang = 'en'
	}

	updateLanguage(lang)
})
const buttons = document.querySelectorAll('.faq-item-text-wrapper')

buttons.forEach(button => {
	button.addEventListener('click', () => {
		const faq = button.nextElementSibling
		const icon = button.children[1]

		if (faq.classList.contains('show')) {
			// Закрыть
			faq.style.maxHeight = '0px'
			faq.style.opacity = '0'
			faq.classList.remove('show')
			icon.classList.remove('rotate')
		} else {
			// Открыть
			faq.style.maxHeight = faq.scrollHeight + 'px'
			faq.style.opacity = '1'
			faq.classList.add('show')
			icon.classList.add('rotate')
		}
	})
})

const burger = document.getElementById('burger')
const navbar = document.querySelector('.navbar')
const body = document.body
burger.addEventListener('click', () => {
	navbar.classList.toggle('active')
	body.classList.toggle('no-scroll')
})
document.querySelectorAll('.navbar-list a').forEach(link => {
	link.addEventListener('click', () => {
		navbar.classList.remove('active')
		body.classList.remove('no-scroll')
	})
})

// Находим все формы на странице
const forms = document.querySelectorAll('.contact-form')

// Для каждой формы на странице
forms.forEach(form => {
	const inputs = form.querySelectorAll('.input')
	const submitButton = form.querySelector('button[type="submit"]')

	// Валидаторы для каждого поля (можно вынести наружу, если одинаковые для всех форм)
	const validators = {
		name: val => val.length >= 3 && val.length <= 20,
		email: val => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val),
		message: val => val.length >= 5,
	}

	// Проверка одного инпута
	function validateInput(input) {
		const value = input.value.trim()
		const container = input.closest('.input-container')
		const isValid = validators[input.name](value)

		container.classList.remove('error', 'success')
		container.classList.add(isValid ? 'success' : 'error')

		return isValid
	}

	// Проверка всей формы и управление кнопкой
	function checkFormValidity() {
		let isFormValid = true
		inputs.forEach(input => {
			if (!validators[input.name](input.value.trim())) {
				isFormValid = false
			}
		})
		submitButton.disabled = !isFormValid
		return isFormValid
	}

	// Валидация при потере фокуса
	inputs.forEach(input => {
		input.addEventListener('blur', () => {
			validateInput(input)
			checkFormValidity()
		})
	})

	// Live-проверка
	inputs.forEach(input => {
		input.addEventListener('input', () => {
			checkFormValidity()
		})
	})

	// Отправка формы в Telegram
	form.addEventListener('submit', function (e) {
		e.preventDefault()

		if (checkFormValidity()) {
			const name = form.name.value.trim()
			const email = form.email.value.trim()
			const message = form.message.value.trim()

			const text = `📩 Новое сообщение с сайта:\n👤 Имя: ${name}\n📧 Email: ${email}\n💬 Сообщение: ${message}`

			const token = '7782617456:AAFkO-LC-pzy8DKBA-a4qnEDrL0z4xcosi8' // ← ЗАМЕНИ
			const chatId = '-1002608084613' // ← ЗАМЕНИ

			fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chat_id: chatId,
					text: text,
				}),
			})
				.then(res => {
					if (res.ok) {
						// Используем this вместо form, чтобы работать с текущей формой
						;[...form.children].forEach(child => {
							if (!child.classList.contains('form-message')) {
								child.style.display = 'none'
							}
						})

						// Показать блок благодарности
						const thanksBlock = document.querySelector('.thanks-block')
						if (!thanksBlock) return
						thanksBlock.classList.add('show')

						// Авто-скрытие через 4 секунды (опционально)
						setTimeout(() => {
							thanksBlock.classList.remove('show')
						}, 2800)
					} else {
						alert('Ошибка отправки. Попробуйте позже.')
					}
				})
				.catch(err => {
					console.error('Ошибка:', err)
					alert('Ошибка соединения с Telegram API')
				})
		}
	})
})
