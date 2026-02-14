const observerOptions = {
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

document.querySelectorAll('.panel').forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(50px)";
    section.style.transition = "all 1.5s ease-out";
    observer.observe(section);
});

const lightCounter = document.getElementById('light-counter');
const countdownEl = document.getElementById('countdown');

function pluralize(value, singular, plural) {
    return value === 1 ? singular : plural;
}

function updateLightCounter() {
    if (!lightCounter) return;
    const birthDate = new Date(1989, 1, 15, 0, 0, 0);
    const now = new Date();

    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();
    let hours = now.getHours() - birthDate.getHours();
    let minutes = now.getMinutes() - birthDate.getMinutes();
    let seconds = now.getSeconds() - birthDate.getSeconds();

    if (seconds < 0) {
        seconds += 60;
        minutes -= 1;
    }

    if (minutes < 0) {
        minutes += 60;
        hours -= 1;
    }

    if (hours < 0) {
        hours += 24;
        days -= 1;
    }

    if (days < 0) {
        const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days += daysInPrevMonth;
        months -= 1;
    }

    if (months < 0) {
        months += 12;
        years -= 1;
    }

    const yearsText = `${years} ${pluralize(years, 'ano', 'anos')}`;
    const monthsText = `${months} ${pluralize(months, 'mês', 'meses')}`;
    const daysText = `${days} ${pluralize(days, 'dia', 'dias')}`;
    const hoursText = `${hours} ${pluralize(hours, 'hora', 'horas')}`;
    const minutesText = `${minutes} ${pluralize(minutes, 'minuto', 'minutos')}`;
    const secondsText = `${seconds} ${pluralize(seconds, 'segundo', 'segundos')}`;

    lightCounter.textContent = `Você está espalhando sua luz há: ${yearsText}, ${monthsText}, ${daysText}, ${hoursText}, ${minutesText} e ${secondsText}.`;

    updateCountdown(now);
}

function updateCountdown(now) {
    if (!countdownEl) return;
    const year = now.getFullYear();
    let nextBirthday = new Date(year, 1, 15, 0, 0, 0);
    if (now >= nextBirthday) {
        nextBirthday = new Date(year + 1, 1, 15, 0, 0, 0);
    }

    let diff = nextBirthday - now;
    if (diff < 0) diff = 0;

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const daysText = `${days} ${pluralize(days, 'dia', 'dias')}`;
    const hoursText = `${hours} ${pluralize(hours, 'hora', 'horas')}`;
    const minutesText = `${minutes} ${pluralize(minutes, 'minuto', 'minutos')}`;
    const secondsText = `${seconds} ${pluralize(seconds, 'segundo', 'segundos')}`;

    countdownEl.textContent = `Contagem regressiva para 15/02: ${daysText}, ${hoursText}, ${minutesText} e ${secondsText}.`;
}

updateLightCounter();
setInterval(updateLightCounter, 1000);

const PASSWORD = 'nosteamamos';
const lockScreen = document.getElementById('lock-screen');
const siteContent = document.getElementById('site-content');
const passwordInput = document.getElementById('password-input');
const passwordBtn = document.getElementById('password-btn');
const passwordError = document.getElementById('password-error');

function unlockSite() {
    if (lockScreen) lockScreen.classList.add('hidden');
    if (siteContent) siteContent.classList.remove('hidden');
    if (passwordError) passwordError.classList.add('hidden');
    if (passwordInput) passwordInput.value = '';
    updateMusicButton();
}

function checkPassword() {
    if (!passwordInput) return;
    const attempt = passwordInput.value.trim().toLowerCase();
    if (attempt === PASSWORD) {
        unlockSite();
        startMusic();
    } else if (passwordError) {
        passwordError.classList.remove('hidden');
    }
}

if (passwordBtn) {
    passwordBtn.addEventListener('click', checkPassword);
}

if (passwordInput) {
    passwordInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            checkPassword();
        }
    });
}

let musicStarted = false;
let userPaused = false;
const music = document.getElementById('bg-music');
const hint = document.querySelector('.click-to-start');
const musicToggle = document.getElementById('music-toggle');

function startMusic() {
    if (musicStarted || !music) return;
    userPaused = false;
    music.play().then(() => {
        musicStarted = true;
        if (hint) hint.style.display = 'none';
        updateMusicButton();
    }).catch(() => {
        if (hint) hint.textContent = '[ Clique novamente para liberar o áudio ]';
    });
}

function updateMusicButton() {
    if (!musicToggle || !music) return;
    musicToggle.textContent = music.paused ? 'Tocar música' : 'Pausar música';
}

function attemptResume() {
    if (!music || !musicStarted || document.hidden || userPaused) return;
    if (music.paused) {
        music.play().then(updateMusicButton).catch(() => {});
    }
}

if (music) {
    music.loop = true;
    music.volume = 0.6;
    music.addEventListener('ended', () => {
        if (musicStarted && !userPaused) {
            music.play().then(updateMusicButton).catch(() => {});
        }
    });
    music.addEventListener('pause', () => {
        updateMusicButton();
        if (!userPaused) {
            setTimeout(attemptResume, 300);
        }
    });
    music.addEventListener('play', updateMusicButton);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && musicStarted && music.paused && !userPaused) {
            music.play().then(updateMusicButton).catch(() => {});
        }
    });

    window.addEventListener('focus', attemptResume);
    setInterval(attemptResume, 4000);
}

// Música inicia apenas após a senha correta

if (musicToggle) {
    musicToggle.addEventListener('click', () => {
        if (!music) return;
        if (music.paused) {
            userPaused = false;
            music.play().then(() => {
                musicStarted = true;
                updateMusicButton();
            }).catch(() => {});
        } else {
            userPaused = true;
            music.pause();
            updateMusicButton();
        }
    });
}

// Movimento das fotos ao mover o mouse

document.addEventListener('mousemove', (e) => {
    const x = (window.innerWidth / 2 - e.pageX) / 25;
    const y = (window.innerHeight / 2 - e.pageY) / 25;

    document.querySelectorAll('.photo-polaroid').forEach((photo, index, list) => {
        const factor = (index + 1) / list.length;
        photo.style.setProperty('--mx', `${x * factor}px`);
        photo.style.setProperty('--my', `${y * factor}px`);
    });
});

document.querySelectorAll('.photo-polaroid').forEach((photo) => {
    photo.addEventListener('click', (event) => {
        event.stopPropagation();
        photo.classList.toggle('is-highlight');
    });
});

const quizData = [
    [
        {
            question: "Qual é o horário preferido dela para tomar café?",
            options: ["18h", "6h", "12h", "22h"],
            answer: 0
        },
        {
            question: "Qual estilo musical ela ama de verdade?",
            options: ["Pagode", "Sertanejo", "Rock", "Forró"],
            answer: 0
        },
        {
            question: "Quais cores mais combinam com o gosto dela?",
            options: ["Tons de terra (bege, caramelo, marrom)", "Azul e prata", "Rosa e lilás", "Preto e neon"],
            answer: 0
        },
        {
            question: "Que tipo de livros ela prefere ler?",
            options: ["Romances", "Biografias", "Fantasia", "Suspense"],
            answer: 0
        },
        {
            question: "Quando fica chateada, ela costuma...",
            options: ["Fazer bico", "Ficar em silêncio absoluto", "Sair para correr", "Cantar alto"],
            answer: 0
        }
    ],
    [
        {
            question: "A frase de confirmação dela é:",
            options: ["Fulano tá aqui que não me deixa mentir", "Quem viu, viu", "Eu sempre disse", "Tá gravado"],
            answer: 0
        },
        {
            question: "Ela prefere qual animal de estimação?",
            options: ["Cachorros", "Gatos", "Pássaros", "Peixes"],
            answer: 0
        },
        {
            question: "Que tipo de filme ela prefere?",
            options: ["Romance, de preferência clichês", "Terror", "Ação", "Suspense"],
            answer: 0
        },
        {
            question: "Qual prato deixa ela feliz?",
            options: ["Arroz, batata frita e carne moída no mesmo prato", "Pizza de quatro queijos", "Salada com frango", "Sushi"],
            answer: 0
        },
        {
            question: "Qual cidade ela ama e diz se sentir outra pessoa?",
            options: ["João Pessoa", "Recife", "Natal", "Fortaleza"],
            answer: 0
        }
    ],
    [
        {
            question: "Qual é o sonho declarado dela?",
            options: ["Morar em João Pessoa", "Viver no exterior", "Abrir um restaurante", "Comprar um sítio"],
            answer: 0
        },
        {
            question: "Na praia, o que ela evita?",
            options: ["Levar sol", "Ficar perto do mar", "Sentir a brisa", "Molhar os pés"],
            answer: 0
        },
        {
            question: "Sobre a personalidade dela, é correto dizer:",
            options: ["Delicada e bruta ao mesmo tempo", "Sempre tímida", "Sempre séria", "Sempre distraída"],
            answer: 0
        },
        {
            question: "Se pudesse escolher onde morar, ela escolheria:",
            options: ["Perto da praia", "No campo", "Em uma metrópole", "Nas montanhas"],
            answer: 0
        },
        {
            question: "Como ela define o sonho de morar em João Pessoa?",
            options: ["Uma longa história", "Uma decisão rápida", "Um plano secreto", "Um desejo passageiro"],
            answer: 0
        }
    ]
];

const statusEl = document.querySelector('.quiz-status');
const timerEl = document.querySelector('.quiz-timer');
const questionEl = document.querySelector('.quiz-question');
const optionsEl = document.querySelector('.quiz-options');
const feedbackEl = document.querySelector('.quiz-feedback');
const startBtn = document.querySelector('.quiz-start');
const nextBtn = document.querySelector('.quiz-next');
const restartBtn = document.querySelector('.quiz-restart');

let roundIndex = 0;
let questionIndex = 0;
let score = 0;
let timerId = null;
let timeLeft = 15;
let quizActive = false;
let awaitingNext = false;
let intermission = false;

const totalQuestions = quizData.reduce((sum, round) => sum + round.length, 0);

function updateStatus() {
    if (!statusEl) return;
    const roundTotal = quizData[roundIndex].length;
    statusEl.textContent = `Rodada ${roundIndex + 1}/3 • Pergunta ${questionIndex + 1}/${roundTotal} • Pontos: ${score}`;
}

function resetTimer() {
    timeLeft = 15;
    if (timerEl) timerEl.textContent = timeLeft;
}

function startTimer() {
    clearInterval(timerId);
    resetTimer();
    timerId = setInterval(() => {
        timeLeft -= 1;
        if (timerEl) timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerId);
            handleTimeout();
        }
    }, 1000);
}

function renderQuestion() {
    intermission = false;
    const current = quizData[roundIndex][questionIndex];
    updateStatus();
    if (questionEl) questionEl.textContent = current.question;
    if (optionsEl) optionsEl.innerHTML = '';
    if (feedbackEl) feedbackEl.textContent = '';
    awaitingNext = false;

    current.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = option;
        btn.addEventListener('click', () => handleAnswer(index));
        optionsEl.appendChild(btn);
    });

    startTimer();
}

function setOptionsDisabled() {
    optionsEl.querySelectorAll('button').forEach((btn) => {
        btn.disabled = true;
    });
}

function markCorrectAnswer(correctIndex) {
    const buttons = optionsEl.querySelectorAll('button');
    if (buttons[correctIndex]) {
        buttons[correctIndex].classList.add('correct');
    }
}

function handleAnswer(selectedIndex) {
    if (awaitingNext) return;
    awaitingNext = true;
    clearInterval(timerId);

    const current = quizData[roundIndex][questionIndex];
    const correct = selectedIndex === current.answer;

    setOptionsDisabled();
    markCorrectAnswer(current.answer);

    if (correct) {
        score += 1;
        if (feedbackEl) feedbackEl.textContent = 'Resposta certa!';
    } else {
        const buttons = optionsEl.querySelectorAll('button');
        if (buttons[selectedIndex]) buttons[selectedIndex].classList.add('incorrect');
        if (feedbackEl) feedbackEl.textContent = `Resposta errada. A correta é: ${current.options[current.answer]}.`;
    }

    if (nextBtn) nextBtn.classList.remove('hidden');
    setTimeout(() => {
        if (nextBtn && !nextBtn.classList.contains('hidden')) {
            nextQuestion();
        }
    }, 1200);
}

function handleTimeout() {
    if (awaitingNext) return;
    awaitingNext = true;
    const current = quizData[roundIndex][questionIndex];

    setOptionsDisabled();
    markCorrectAnswer(current.answer);
    if (feedbackEl) feedbackEl.textContent = `Tempo esgotado! A correta é: ${current.options[current.answer]}.`;

    if (nextBtn) nextBtn.classList.remove('hidden');
}

function showRoundBreak(finishedRound) {
    intermission = true;
    clearInterval(timerId);
    resetTimer();

    if (questionEl) questionEl.textContent = `Rodada ${finishedRound}/3 concluída!`;
    if (optionsEl) optionsEl.innerHTML = '';
    if (feedbackEl) feedbackEl.textContent = 'Respire, a próxima já começa.';

    if (nextBtn) {
        nextBtn.textContent = 'Continuar';
        nextBtn.classList.remove('hidden');
    }
}

function endQuiz() {
    quizActive = false;
    clearInterval(timerId);

    if (questionEl) {
        questionEl.textContent = `Fim do quiz! Você fez ${score} de ${totalQuestions} pontos.`;
    }
    if (optionsEl) optionsEl.innerHTML = '';

    let message = 'Hora de rever os capítulos e amar ainda mais.';
    if (score >= 13) {
        message = 'Memória de ouro! Você conhece demais.';
    } else if (score >= 10) {
        message = 'Você conhece muito e ama ainda mais.';
    } else if (score >= 7) {
        message = 'Você conhece bastante, mas ainda tem capítulo novo.';
    }

    if (feedbackEl) feedbackEl.textContent = message;
    if (nextBtn) nextBtn.classList.add('hidden');
    if (startBtn) startBtn.classList.add('hidden');
    if (restartBtn) restartBtn.classList.remove('hidden');
}

function nextQuestion() {
    if (nextBtn) nextBtn.classList.add('hidden');
    if (nextBtn) nextBtn.textContent = 'Próxima';

    if (intermission) {
        renderQuestion();
        return;
    }

    if (questionIndex < quizData[roundIndex].length - 1) {
        questionIndex += 1;
        renderQuestion();
        return;
    }

    if (roundIndex < quizData.length - 1) {
        const finishedRound = roundIndex + 1;
        roundIndex += 1;
        questionIndex = 0;
        showRoundBreak(finishedRound);
        return;
    }

    endQuiz();
}

function startQuiz() {
    if (quizActive) return;
    quizActive = true;
    roundIndex = 0;
    questionIndex = 0;
    score = 0;

    if (startBtn) startBtn.classList.add('hidden');
    if (restartBtn) restartBtn.classList.add('hidden');
    if (nextBtn) nextBtn.classList.add('hidden');

    renderQuestion();
}

if (startBtn) startBtn.addEventListener('click', startQuiz);
if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
if (restartBtn) restartBtn.addEventListener('click', startQuiz);
