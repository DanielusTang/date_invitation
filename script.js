const yesButton = document.getElementById('yessir')
const noButton = document.getElementById('nooo')

const MARGIN = 16
const SAFE_CURSOR_DISTANCE = 120
const isCompactScreen = window.matchMedia('(max-width: 430px), (max-height: 700px)').matches

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const overlap = (a, b, padding = 0) => {
    return !(
        a.right + padding < b.left ||
        a.left - padding > b.right ||
        a.bottom + padding < b.top ||
        a.top - padding > b.bottom
    )
}

const moveNoButton = (cursorX, cursorY) => {
    if (isCompactScreen) {
        return
    }

    const noRect = noButton.getBoundingClientRect()
    const yesRect = yesButton.getBoundingClientRect()
    const maxX = Math.max(MARGIN, window.innerWidth - noRect.width - MARGIN)
    const maxY = Math.max(MARGIN, window.innerHeight - noRect.height - MARGIN)

    let nextLeft = MARGIN
    let nextTop = MARGIN
    let attempts = 0

    while (attempts < 30) {
        attempts += 1
        nextLeft = randomBetween(MARGIN, maxX)
        nextTop = randomBetween(MARGIN, maxY)

        const nextRect = {
            left: nextLeft,
            top: nextTop,
            right: nextLeft + noRect.width,
            bottom: nextTop + noRect.height
        }

        const centerX = nextLeft + noRect.width / 2
        const centerY = nextTop + noRect.height / 2
        const tooCloseToCursor = Math.hypot(centerX - cursorX, centerY - cursorY) < SAFE_CURSOR_DISTANCE

        if (!overlap(nextRect, yesRect, 20) && !tooCloseToCursor) {
            break
        }
    }

    noButton.style.position = 'fixed'
    noButton.style.left = `${nextLeft}px`
    noButton.style.top = `${nextTop}px`
    noButton.style.zIndex = '20'
}

yesButton.addEventListener('click', () => {
    window.location.href = './yes.html'
})

noButton.addEventListener('mouseenter', (event) => {
    moveNoButton(event.clientX, event.clientY)
})

noButton.addEventListener('mousedown', (event) => {
    event.preventDefault()
    moveNoButton(event.clientX, event.clientY)
})

noButton.addEventListener('touchstart', (event) => {
    const touch = event.touches[0]
    if (!touch) {
        return
    }

    event.preventDefault()
    moveNoButton(touch.clientX, touch.clientY)
}, { passive: false })

noButton.addEventListener('click', (event) => {
    event.preventDefault()
    moveNoButton(window.innerWidth / 2, window.innerHeight / 2)
})

document.addEventListener('mousemove', (event) => {
    const rect = noButton.getBoundingClientRect()
    const xInside = event.clientX >= rect.left - 8 && event.clientX <= rect.right + 8
    const yInside = event.clientY >= rect.top - 8 && event.clientY <= rect.bottom + 8

    if (xInside && yInside) {
        moveNoButton(event.clientX, event.clientY)
    }
})
