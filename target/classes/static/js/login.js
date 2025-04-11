/**
 * Script para gerenciar o login de usuários com validação correta, animações legais e tratamento de erros
 */

// Função para validar formato de email
function validateEmail(email) {
    // Validação básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: "Formato de email inválido. Deve conter '@' e um domínio válido." };
    }

    // Verificar se termina com .com, .br, etc.
    const domainRegex = /\.(com|net|org|edu|gov|br|io|me|co|app)$/i;
    if (!domainRegex.test(email)) {
        return { valid: false, message: "Email deve terminar com um domínio válido (ex: .com, .br, .org)" };
    }

    // Verificar tamanho mínimo e máximo
    if (email.length < 5) {
        return { valid: false, message: "Email muito curto" };
    }
    if (email.length > 100) {
        return { valid: false, message: "Email muito longo (máximo 100 caracteres)" };
    }

    return { valid: true };
}

// Função para validar senha
function validatePassword(password) {
    if (password.length < 6) {
        return { valid: false, message: "A senha deve ter no mínimo 6 caracteres" };
    }

    if (password.length > 50) {
        return { valid: false, message: "A senha deve ter no máximo 50 caracteres" };
    }

    // Verificar se a senha contém apenas espaços em branco
    if (password.trim().length === 0) {
        return { valid: false, message: "A senha não pode conter apenas espaços em branco" };
    }

    return { valid: true };
}

async function postLogin() {
    console.log("Função postLogin chamada.");
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const remember = document.getElementById("remember").checked;

    // Garantir que os campos estão visíveis
    ensureFormFieldsVisibility();

    // Limpar mensagem de erro anterior
    const errorElement = document.querySelector('.error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }

    // Validação dos campos com animações
    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");
    let isValid = true;

    // Validação avançada de email
    if (!email) {
        animateInvalidInput(emailInput);
        showErrorMessage("O campo de email é obrigatório.");
        ensureFormFieldsVisibility(); // Garantir visibilidade após mostrar erro
        return;
    } else {
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            animateInvalidInput(emailInput);
            showErrorMessage(emailValidation.message);
            ensureFormFieldsVisibility(); // Garantir visibilidade após mostrar erro
            return;
        } else {
            resetInputValidation(emailInput);
        }
    }

    // Validação avançada de senha
    if (!senha) {
        animateInvalidInput(senhaInput);
        showErrorMessage("O campo de senha é obrigatório.");
        ensureFormFieldsVisibility(); // Garantir visibilidade após mostrar erro
        return;
    } else {
        const senhaValidation = validatePassword(senha);
        if (!senhaValidation.valid) {
            animateInvalidInput(senhaInput);
            showErrorMessage(senhaValidation.message);
            ensureFormFieldsVisibility(); // Garantir visibilidade após mostrar erro
            return;
        } else {
            resetInputValidation(senhaInput);
        }
    }

    // Efeito de carregamento no botão
    const btnSubmit = document.querySelector('button[type="submit"]');
    const btnText = btnSubmit.querySelector('span');
    const originalText = btnText.textContent;

    btnSubmit.disabled = true;
    btnText.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Entrando...';

    try {
        // Criação do FormData e envio do login
        const formData = new FormData();
        formData.append('email', email);
        formData.append('senha', senha);
        if (remember) {
            formData.append('remember', 'true');
        }

        console.log("Enviando login com email:", email);

        const response = await fetch('/login', {
            method: 'POST',
            body: formData,
            redirect: 'follow'
        });

        console.log("Status da resposta:", response.status);

        if (response.redirected) {
            // Sucesso com redirecionamento
            btnText.innerHTML = '<i class="fas fa-check"></i> Sucesso!';
            btnSubmit.style.backgroundColor = '#0F9D58';
            const loginContainer = document.querySelector('.login-container');
            setTimeout(() => {
                loginContainer.style.opacity = '0';
                loginContainer.style.transform = 'scale(0.95)';
                loginContainer.style.transition = 'all 0.5s ease';
                setTimeout(() => {
                    window.location.href = response.url;
                }, 500);
            }, 800);
        } else {
            // Se não houve redirecionamento, lemos a resposta para verificar mensagem de erro
            const responseText = await response.text();
            if (responseText.includes('Email ou senha inválidos')) {
                // Tratamento quando as credenciais estão erradas
                btnText.innerHTML = '<i class="fas fa-times"></i> Erro';
                btnSubmit.style.backgroundColor = '#e74c3c';
                setTimeout(() => {
                    btnText.textContent = originalText;
                    btnSubmit.style.backgroundColor = '';
                    btnSubmit.disabled = false;
                    showErrorMessage("Email ou senha inválidos. Verifique suas credenciais e tente novamente.");
                    ensureFormFieldsVisibility(); // Garantir visibilidade após mostrar erro
                }, 1000);
            } else {
                // Se não houver mensagem de erro, trata como login bem-sucedido
                btnText.innerHTML = '<i class="fas fa-check"></i> Sucesso!';
                btnSubmit.style.backgroundColor = '#0F9D58';
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 800);
            }
        }
    } catch (error) {
        console.error("Exceção no login:", error);
        btnText.textContent = originalText;
        btnSubmit.style.backgroundColor = '';
        btnSubmit.disabled = false;
        showErrorMessage("Erro na requisição de login. Verifique sua conexão e tente novamente.");
        ensureFormFieldsVisibility(); // Garantir visibilidade após mostrar erro
    }
}

// Função para exibir mensagem de erro com animação
function showErrorMessage(message) {
    const errorElement = document.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.style.animation = 'none';
        setTimeout(() => {
            errorElement.style.animation = 'error-shake 0.6s ease';
        }, 10);

        // Garante que todos os campos de input permaneçam visíveis
        ensureFormFieldsVisibility();
    } else {
        alert(message);
    }
}

// Função para garantir que todos os campos do formulário permaneçam visíveis
function ensureFormFieldsVisibility() {
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.style.display = 'block';
        input.style.opacity = '1';

        const parentElement = input.closest('.input-group');
        if (parentElement) {
            parentElement.style.display = 'block';
            parentElement.style.opacity = '1';
        }
    });
}

// Função para animar input inválido
function animateInvalidInput(inputElement) {
    // Preserva a visibilidade e apenas altera a cor da borda e o fundo
    inputElement.style.borderColor = '#e74c3c';
    inputElement.style.backgroundColor = 'rgba(231, 76, 60, 0.05)';

    // Mantém o elemento visível e interativo
    inputElement.style.display = 'block';
    inputElement.style.opacity = '1';

    const parentElement = inputElement.closest('.input-group');
    if (parentElement) {
        // Preserva a visibilidade do grupo de input também
        parentElement.style.display = 'block';
        parentElement.style.opacity = '1';

        // Reinicia a animação
        parentElement.style.animation = 'none';
        setTimeout(() => {
            parentElement.style.animation = 'error-shake 0.6s ease';
        }, 10);
    }
}

// Função para resetar validação visual, mantendo o campo visível
function resetInputValidation(inputElement) {
    inputElement.style.borderColor = '';
    inputElement.style.backgroundColor = '';

    // Garantir que o campo permaneça visível
    inputElement.style.display = 'block';
    inputElement.style.opacity = '1';

    const parentElement = inputElement.closest('.input-group');
    if (parentElement) {
        parentElement.style.display = 'block';
        parentElement.style.opacity = '1';
    }
}

// Função para alternar a visibilidade da senha
function togglePasswordVisibility() {
    const senhaInput = document.getElementById('senha');
    const toggleIcon = document.querySelector('.toggle-password i');
    if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
        if (toggleIcon) {
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        }
    } else {
        senhaInput.type = 'password';
        if (toggleIcon) {
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    }
}

// Efeito parallax para elementos de fundo
function handleParallax(e) {
    const shapes = document.querySelectorAll('.shape-1, .shape-2, .shape-3, .shape-4');
    if (!shapes.length) return;
    const speed = 0.05;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = (e.clientX - centerX) * speed;
    const deltaY = (e.clientY - centerY) * speed;
    shapes.forEach((shape, index) => {
        const modifier = (index + 1) * 0.2;
        shape.style.transform = `translate(${deltaX * modifier}px, ${deltaY * modifier}px)`;
    });
}

// Configura animação de hover no botão de login
function setupLoginButtonAnimation() {
    const loginButton = document.querySelector('button[type="submit"]');
    if (!loginButton) return;
    loginButton.addEventListener('mouseenter', () => {
        const hoverEffect = loginButton.querySelector('.btn-hover-effect');
        if (hoverEffect) {
            hoverEffect.style.left = '-100%';
            setTimeout(() => {
                hoverEffect.style.left = '100%';
            }, 10);
        }
    });
}

// Anima os campos de input quando focados
function setupInputAnimations() {
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const parent = input.closest('.input-group');
            if (parent) {
                parent.classList.add('input-focused');
            }
        });
        input.addEventListener('blur', () => {
            const parent = input.closest('.input-group');
            if (parent) {
                parent.classList.remove('input-focused');
            }

            // Validar em tempo real ao sair do campo
            if (input.id === 'email' && input.value.trim() !== '') {
                const emailValidation = validateEmail(input.value.trim());
                if (!emailValidation.valid) {
                    animateInvalidInput(input);
                    showErrorMessage(emailValidation.message);
                } else {
                    resetInputValidation(input);
                }
            }

            if (input.id === 'senha' && input.value.trim() !== '') {
                const senhaValidation = validatePassword(input.value.trim());
                if (!senhaValidation.valid) {
                    animateInvalidInput(input);
                    showErrorMessage(senhaValidation.message);
                } else {
                    resetInputValidation(input);
                }
            }
        });
    });
}

// Adiciona keyframes dinamicamente para as animações
function addKeyframesRules() {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = `
        @keyframes error-shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-10px); }
            40%, 80% { transform: translateX(10px); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .input-focused .input-focus-effect {
            width: 100%;
        }
        
        .pulse {
            animation: pulse 0.3s ease;
        }
    `;
    document.head.appendChild(styleSheet);
}

// Ao carregar a página, limpa a sessão ativa para evitar uso indevido de dados salvos
async function clearActiveSession() {
    try {
        await fetch('/logout', { method: 'POST' });
        console.log("Sessão limpa com sucesso.");
    } catch (error) {
        console.error("Erro ao limpar sessão:", error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log("Página de login carregada");
    // Limpa a sessão ativa para que o login sempre comece zerado
    await clearActiveSession();

    addKeyframesRules();

    if (!document.querySelector('.error-message')) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.display = 'none';
        const formElement = document.getElementById('loginForm');
        if (formElement) {
            formElement.parentNode.insertBefore(errorElement, formElement);
        }
    }

    const toggleButton = document.querySelector('.toggle-password');
    if (toggleButton) {
        toggleButton.addEventListener('click', togglePasswordVisibility);
    }

    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    if (emailInput && senhaInput) {
        const checkEnter = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                postLogin();
            }
        };
        emailInput.addEventListener('keypress', checkEnter);
        senhaInput.addEventListener('keypress', checkEnter);

        // Garante que os campos estão visíveis a cada interação
        emailInput.addEventListener('focus', ensureFormFieldsVisibility);
        senhaInput.addEventListener('focus', ensureFormFieldsVisibility);
    }

    document.addEventListener('mousemove', handleParallax);
    setupLoginButtonAnimation();
    setupInputAnimations();

    // Chamada inicial para garantir visibilidade
    ensureFormFieldsVisibility();

    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Configurar apenas o efeito de zoom ao passar o mouse (sem o efeito 3D)
    const container = document.querySelector('.login-container');
    if (container) {

        // Configurar a animação inicial - agora vindo de cima
        container.style.opacity = '0';
        container.style.transform = 'translateY(-100vh)';
        
        // Pequeno atraso para garantir que as propriedades sejam aplicadas antes da animação
        setTimeout(() => {
            // Animação usando Anime.js
            const animationTimeline = anime.timeline({ loop: false });
            
            // Primeira animação: Container entrando de cima
            animationTimeline.add({
                targets: '.login-container',
                opacity: [0, 1],
                translateY: ['-100vh', '0'],
                easing: 'easeOutExpo',
                duration: 2000,
            })
            
            // Animação dos botões sociais, aparecendo imediatamente
            .add({
                targets: '.social-btn',
                opacity: [0, 1],
                translateY: [15, 0],
                easing: 'easeOutExpo',
                duration: 800,
                delay: anime.stagger(100), // Sem delay, aparecem imediatamente
            })
            
            // Animação do título com delay maior, apenas quando o container terminar
            .add({
                targets: '.title-animation',
                opacity: [0, 1],
                translateY: [30, 0],
                easing: 'easeOutExpo',
                duration: 1000,
                delay: 1300 // Aumentado para 1 segundo a mais
            })
            
            // Animação do subtítulo
            .add({
                targets: '.subtitle-animation',
                opacity: [0, 1],
                translateY: [20, 0],
                easing: 'easeOutExpo',
                duration: 800,
                delay: 1100 // Aumentado para 1 segundo a mais
            })
            
            // Animação dos grupos de input, aparecendo sequencialmente
            .add({
                targets: '.input-group',
                opacity: [0, 1],
                translateY: [20, 0],
                easing: 'easeOutExpo',
                duration: 800,
                delay: anime.stagger(150, { start: 2300 }) // Aumentado para 1 segundo a mais
            })
            
            // Animação das opções do formulário
            .add({
                targets: '.form-options-animation',
                opacity: [0, 1],
                translateY: [15, 0],
                easing: 'easeOutExpo',
                duration: 800,
                offset: '-=400' // Começar um pouco antes do fim da animação anterior
            })
            
            // Animação do botão
            .add({
                targets: 'button[type="submit"]',
                scale: [0.9, 1],
                opacity: [0, 1],
                easing: 'easeOutExpo',
                duration: 800,
                offset: '-=400' // Começar um pouco antes do fim da animação anterior
            })
            
            // Animação do separador
            .add({
                targets: '.separator-animation',
                opacity: [0, 1],
                scale: [0.8, 1],
                easing: 'easeOutExpo',
                duration: 800,
                offset: '-=400' // Começar um pouco antes do fim da animação anterior
            });
            
            // Garantir visibilidade após animação completa
            setTimeout(() => {
                ensureFormFieldsVisibility();
            }, 3500); // Tempo total aproximado das animações
        }, 100);
    } else {
        console.log("Container não encontrado para animação");
    }
});
