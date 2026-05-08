const yesButton = document.getElementById('yessir')
const noButton = document.getElementById('nooo')
const emailStatus = document.getElementById('email-status')

const EMAILJS_CONFIG = {
    publicKey: 'BewoEG1APDGfv8yZ3',
    serviceId: 'service_lqq8jup',
    templateId: 'template_a3pe36j',
    toEmail: 'danielus.tangleyuan@gmail.com'
}

let emailClientReady = false

const hasEmailConfig = () => {
    return Object.values(EMAILJS_CONFIG).every((value) => value && !String(value).startsWith('YOUR_'))
}

const initEmailClient = () => {
    if (emailClientReady || !window.emailjs || !hasEmailConfig()) {
        return
    }

    window.emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey })
    emailClientReady = true
}

const sendDateAcceptedEmail = async () => {
    try {
        initEmailClient()

        if (!emailClientReady) {
            return false
        }

        await window.emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            {
                to_email: EMAILJS_CONFIG.toEmail,
                accepted_at: new Date().toLocaleString(),
                page_url: window.location.href,
                message: 'She clicked Ja! and agreed to go on a date.'
            }
        )

        return true
    } catch (error) {
        console.error('Failed to send acceptance email:', error)
        return false
    }
}

const MARGIN = 16
const SAFE_CURSOR_DISTANCE = 120

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

yesButton.addEventListener('click', async () => {
    yesButton.disabled = true
    yesButton.textContent = 'Sending...'

    const emailSent = await sendDateAcceptedEmail()

    if (emailStatus) {
        emailStatus.textContent = emailSent ? 'Email sent' : 'Could not send email'
    }

    yesButton.textContent = emailSent ? 'Ja! Sent' : 'Ja!'

    setTimeout(() => {
        window.location.href = './yes.html'
    }, 900)
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

// Background video fallback: try to play, and if it fails, replace with a GIF fallback
function handleBgVideoFailure(video) {
    console.warn('Background video failed to play, switching to GIF fallback')
    const container = video.parentElement
    if (!container) return

    const img = document.createElement('img')
    img.src = './img/cutegif.gif'
    img.alt = 'Invitation animation fallback'
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.objectFit = 'cover'
    img.style.display = 'block'

    container.innerHTML = ''
    container.appendChild(img)

    const status = document.getElementById('email-status')
    if (status) status.textContent = 'Video not supported; showing fallback.'
}

function setupBgVideo() {
    const video = document.getElementById('bgvideo')
    if (!video) return

    // Listen for error events
    video.addEventListener('error', () => handleBgVideoFailure(video))
    video.addEventListener('stalled', () => handleBgVideoFailure(video))

    // Some browsers return a promise for play(); catch rejection
    const playPromise = video.play()
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => handleBgVideoFailure(video))
    }
}

// Initialize when DOM is ready (script is deferred, so DOM is loaded)
setupBgVideo()
