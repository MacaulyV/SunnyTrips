/**
 * Script para gerenciar o cadastro de usuários com validação correta, animações legais e tratamento de erros
 */

// Variável para controlar se um cadastro já está em andamento
let cadastroEmAndamento = false;

// Função para validar formato de email
function validateEmail(email) {
    // Verificar se está vazio ou muito curto
    if (email.length < 5) {
        return { valid: false, message: "Email muito curto" };
    }
    
    if (email.length > 100) {
        return { valid: false, message: "Email muito longo (máximo 100 caracteres)" };
    }
    
    // Verificar formato básico (algo@algo.algo)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        // Mensagens específicas para diferentes problemas
        if (!email.includes('@')) {
            return { valid: false, message: "O email deve conter o símbolo '@'" };
        } else if (!email.includes('.')) {
            return { valid: false, message: "O email deve conter um domínio válido com ponto (.)" };
        } else if (email.indexOf('@') === 0) {
            return { valid: false, message: "O email deve começar com algum texto antes do '@'" };
        } else if (email.lastIndexOf('.') < email.indexOf('@')) {
            return { valid: false, message: "O email deve ter um domínio válido após o '@'" };
        } else {
            return { valid: false, message: "Formato de email inválido. Deve conter um formato válido como 'usuario@dominio.com'" };
        }
    }
    
    // Validar parte local (antes do @)
    const localPart = email.split('@')[0];
    if (localPart.length < 2) {
        return { valid: false, message: "A parte antes do '@' deve ter pelo menos 2 caracteres" };
    }
    
    // Validar domínio (depois do @)
    const domainPart = email.split('@')[1];
    
    // Verificar se termina com .com, .br, etc.
    const domainRegex = /\.(com|net|org|edu|gov|br|io|me|co|app)$/i;
    if (!domainRegex.test(email)) {
        return { valid: false, message: "O email deve terminar com um domínio válido como .com, .br, .org, etc." };
    }
    
    // Verificar se tem caracteres inválidos
    const invalidChars = /[^\w.@-]/;
    if (invalidChars.test(email)) {
        return { valid: false, message: "O email contém caracteres não permitidos" };
    }
    
    // Verificar se não tem pontos consecutivos
    if (email.includes('..')) {
        return { valid: false, message: "O email não pode conter pontos consecutivos" };
    }
    
    return { valid: true };
}

// Função para validar senha
function validatePassword(password) {
    // Verificar comprimento mínimo
    if (password.length < 6) {
        return { valid: false, message: "A senha deve ter no mínimo 6 caracteres" };
    }
    
    // Verificar comprimento máximo
    if (password.length > 50) {
        return { valid: false, message: "A senha deve ter no máximo 50 caracteres" };
    }
    
    // Verificar se a senha contém apenas espaços em branco
    if (password.trim().length === 0) {
        return { valid: false, message: "A senha não pode conter apenas espaços em branco" };
    }
    
    // Verificar se a senha contém espaços
    if (/\s/.test(password)) {
        return { valid: false, message: "A senha não deve conter espaços" };
    }
    
    // Verificar caracteres repetidos em sequência (mais de 3)
    const repeatedCharsRegex = /(.)\1{2,}/;
    if (repeatedCharsRegex.test(password)) {
        return { valid: false, message: "A senha não deve conter caracteres repetidos em sequência (ex: aaa, 111)" };
    }
    
    // Verificar sequências óbvias
    const commonSequences = ['123456', '654321', 'abcdef', 'qwerty', 'password', 'senha123'];
    for (const seq of commonSequences) {
        if (password.toLowerCase().includes(seq)) {
            return { valid: false, message: "A senha contém uma sequência comum e fácil de adivinhar" };
        }
    }
    
    // Embora não seja obrigatório, sugerimos que a senha tenha letras e números
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    
    if (!hasLetters && !hasNumbers) {
        return { valid: false, message: "A senha deve conter pelo menos letras ou números" };
    }
    
    // Sugestão para senhas mais fortes (não obrigatória)
    if (!hasLetters || !hasNumbers) {
        // A senha é válida, mas poderia ser mais forte
        // Retornamos valid: true, mas com uma sugestão
        return { 
            valid: true, 
            suggestion: "Dica: Senhas mais seguras contêm combinação de letras e números" 
        };
    }
    
    return { valid: true };
}

// Função para validar nome
function validateName(name) {
    if (name.length < 2) {
        return { valid: false, message: "O nome deve ter pelo menos 2 caracteres" };
    }
    
    if (name.length > 100) {
        return { valid: false, message: "O nome deve ter no máximo 100 caracteres" };
    }
    
    // Verificar se o nome tem pelo menos duas palavras (nome completo)
    const words = name.trim().split(/\s+/);
    if (words.length < 2) {
        return { valid: false, message: "Por favor, digite seu nome completo (nome e sobrenome)" };
    }
    
    // Verificar se cada palavra tem pelo menos 2 caracteres
    for (const word of words) {
        if (word.length < 2) {
            return { valid: false, message: "Cada parte do seu nome deve ter pelo menos 2 caracteres" };
        }
    }
    
    // Verificar se contém apenas letras, espaços e alguns caracteres especiais
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
    if (!nameRegex.test(name)) {
        return { valid: false, message: "O nome deve conter apenas letras, espaços, hífens e apóstrofos" };
    }
    
    return { valid: true };
}

// Função para validar localização (país, estado, cidade)
function validateLocation(value, field) {
    if (!value || value.trim() === '') {
        return { valid: false, message: `${field} deve ser selecionado` };
    }
    
    // Para país, que agora é um select, apenas verificamos se um valor válido foi selecionado
    if (field === "País") {
        return { valid: true };
    }
    
    // As validações a seguir são apenas para estado e cidade que continuam como texto
    if (value.length < 2) {
        return { valid: false, message: `${field} deve ter pelo menos 2 caracteres` };
    }
    
    const maxLength = field === "Cidade" ? 100 : 50;
    if (value.length > maxLength) {
        return { valid: false, message: `${field} deve ter no máximo ${maxLength} caracteres` };
    }
    
    // Verificar se contém apenas letras, espaços e alguns caracteres especiais
    const locationRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-.,]+$/;
    if (!locationRegex.test(value)) {
        return { valid: false, message: `${field} deve conter apenas letras, espaços e caracteres comuns` };
    }
    
    return { valid: true };
}

// Função para animar input inválido
function animateInvalidInput(inputElement) {
    // Preserva a visibilidade e apenas altera a cor da borda e o fundo
    inputElement.style.borderColor = '#e74c3c';
    inputElement.style.backgroundColor = 'rgba(231, 76, 60, 0.05)';
    
    // Mantém o elemento visível e interativo
    inputElement.style.display = 'block';
    inputElement.style.opacity = '1';
    
    // Se é o checkbox de termos, destacar a área inteira do checkbox
    if (inputElement.id === 'terms') {
        const customCheckbox = inputElement.closest('.custom-checkbox');
        if (customCheckbox) {
            customCheckbox.style.color = '#e74c3c';
            const checkmark = customCheckbox.querySelector('.checkmark');
            if (checkmark) {
                checkmark.style.borderColor = '#e74c3c';
                checkmark.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
            }
        }
    }
    
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
    } else {
        // Se não tiver um parent .input-group (como no caso do checkbox)
        // aplicar animação diretamente no elemento
        inputElement.style.animation = 'none';
        setTimeout(() => {
            inputElement.style.animation = 'error-shake 0.6s ease';
        }, 10);
    }
}

// Função para resetar validação visual, mantendo o campo visível
function resetInputValidation(inputElement) {
    inputElement.style.borderColor = '';
    inputElement.style.backgroundColor = '';
    
    // Se é o checkbox de termos, resetar o estilo da área inteira do checkbox
    if (inputElement.id === 'terms') {
        const customCheckbox = inputElement.closest('.custom-checkbox');
        if (customCheckbox) {
            customCheckbox.style.color = '';
            const checkmark = customCheckbox.querySelector('.checkmark');
            if (checkmark) {
                checkmark.style.borderColor = '';
                checkmark.style.backgroundColor = '';
            }
        }
    }
    
    // Garantir que o campo permaneça visível
    inputElement.style.display = 'block';
    inputElement.style.opacity = '1';
    
    const parentElement = inputElement.closest('.input-group');
    if (parentElement) {
        parentElement.style.display = 'block';
        parentElement.style.opacity = '1';
    }
}

// Função para validar os termos
function validateTerms(termsCheck) {
    if (!termsCheck.checked) {
        return { valid: false, message: "É necessário aceitar os termos e condições para prosseguir" };
    }
    return { valid: true };
}

// Função para cadastrar um novo usuário
async function cadastrarUsuario() {
    // Previne múltiplos cliques/submits
    if (cadastroEmAndamento) {
        console.log("Cadastro já está em andamento, ignorando requisição duplicada");
        return;
    }
    
    cadastroEmAndamento = true;
    
    // Garantir que os campos estão visíveis no início do processo
    ensureFormFieldsVisibility();
    
    try {
        // Limpar mensagem de erro anterior
        const errorElement = document.querySelector('.error-message');
        errorElement.style.display = "none";
        
        // Capturar dados do formulário
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();
        const pais = document.getElementById("pais").value;
        const estado = document.getElementById("estado").value.trim();
        const cidade = document.getElementById("cidade").value.trim();
        const termsCheck = document.getElementById("terms");
        
        // Array para armazenar campos inválidos
        let invalidFields = [];
        
        // Validar campos individualmente com validações específicas
        if (!nome) {
            invalidFields.push({ field: document.getElementById("nome"), message: "O campo nome é obrigatório" });
        } else {
            const nameValidation = validateName(nome);
            if (!nameValidation.valid) {
                invalidFields.push({ field: document.getElementById("nome"), message: nameValidation.message });
            }
        }
        
        if (!email) {
            invalidFields.push({ field: document.getElementById("email"), message: "O campo email é obrigatório" });
        } else {
            const emailValidation = validateEmail(email);
            if (!emailValidation.valid) {
                invalidFields.push({ field: document.getElementById("email"), message: emailValidation.message });
            }
        }
        
        if (!senha) {
            invalidFields.push({ field: document.getElementById("senha"), message: "O campo senha é obrigatório" });
        } else {
            const passwordValidation = validatePassword(senha);
            if (!passwordValidation.valid) {
                invalidFields.push({ field: document.getElementById("senha"), message: passwordValidation.message });
            } else if (passwordValidation.suggestion) {
                console.log("Sugestão para senha:", passwordValidation.suggestion);
            }
        }
        
        if (!pais) {
            invalidFields.push({ field: document.getElementById("pais"), message: "Selecione um país" });
        } else {
            const paisValidation = validateLocation(pais, "País");
            if (!paisValidation.valid) {
                invalidFields.push({ field: document.getElementById("pais"), message: paisValidation.message });
            }
        }
        
        if (!estado) {
            invalidFields.push({ field: document.getElementById("estado"), message: "O campo estado é obrigatório" });
        } else {
            const estadoValidation = validateLocation(estado, "Estado");
            if (!estadoValidation.valid) {
                invalidFields.push({ field: document.getElementById("estado"), message: estadoValidation.message });
            }
        }
        
        if (!cidade) {
            invalidFields.push({ field: document.getElementById("cidade"), message: "O campo cidade é obrigatório" });
        } else {
            const cidadeValidation = validateLocation(cidade, "Cidade");
            if (!cidadeValidation.valid) {
                invalidFields.push({ field: document.getElementById("cidade"), message: cidadeValidation.message });
            }
        }
        
        // Verificar se os termos foram aceitos
        const termsValidation = validateTerms(termsCheck);
        if (!termsValidation.valid) {
            invalidFields.push({ field: termsCheck, message: termsValidation.message });
        }
        
        // Se houver campos inválidos, mostrar o primeiro erro e animar os campos
        if (invalidFields.length > 0) {
            invalidFields.forEach(item => {
                animateInvalidInput(item.field);
            });
            
            // Mostrar a mensagem de erro
            showError(invalidFields[0].message);
            
            // Destacar visualmente o checkbox de termos se for o erro
            if (invalidFields[0].field.id === 'terms') {
                const checkboxContainer = document.querySelector('.form-options');
                if (checkboxContainer) {
                    checkboxContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            
            ensureFormFieldsVisibility(); // Garantir visibilidade após mostrar erro
            cadastroEmAndamento = false;
            return;
        }
        
        // Mostrar feedback visual de processamento
        const btnSubmit = document.querySelector('button[type="submit"]');
        const btnText = btnSubmit.querySelector('span');
        const originalText = btnText.textContent;
        btnSubmit.disabled = true;
        btnText.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Cadastrando...';
        
        // Preparar payload para envio
        const payload = {
            nome: nome,
            email: email,
            senha: senha,
            pais: pais,
            estado: estado,
            cidade: cidade
        };
        
        console.log("Enviando cadastro:", payload);
        
        // Enviar requisição para o endpoint de criação de usuário
        const response = await fetch('/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log("Cadastro realizado com sucesso");
            const usuarioCriado = await response.json();
            console.log("Usuário criado:", usuarioCriado);
            
            // Indicar sucesso no botão
            btnText.innerHTML = '<i class="fas fa-check"></i> Cadastrado!';
            btnSubmit.style.backgroundColor = '#0F9D58';
            
            // Aguardar um momento para mostrar o sucesso antes de redirecionar
            setTimeout(() => {
                console.log("Tentando fazer login pelo formulário POST para /login");
                
                const tempForm = document.createElement('form');
                tempForm.method = 'POST';
                tempForm.action = '/login';
                tempForm.style.display = 'none';
                
                const emailField = document.createElement('input');
                emailField.type = 'hidden';
                emailField.name = 'email';
                emailField.value = email;
                tempForm.appendChild(emailField);
                
                const senhaField = document.createElement('input');
                senhaField.type = 'hidden';
                senhaField.name = 'senha';
                senhaField.value = senha;
                tempForm.appendChild(senhaField);
                
                document.body.appendChild(tempForm);
                console.log("Enviando formulário de login...");
                tempForm.submit();
            }, 1000);
            
        } else {
            btnText.innerHTML = originalText;
            btnSubmit.disabled = false;
            btnSubmit.style.backgroundColor = '';
            
            try {
                const errorData = await response.json();
                showError("Erro no cadastro: " + (errorData.message || JSON.stringify(errorData)));
            } catch (e) {
                const errorText = await response.text();
                if (errorText.includes("já existe")) {
                    showError("Este email já está cadastrado. Por favor, use outro email ou faça login.");
                } else {
                    showError("Erro no cadastro: " + errorText);
                }
            }
            
            ensureFormFieldsVisibility();
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        showError("Erro na conexão com o servidor. Verifique sua conexão e tente novamente mais tarde.");
        
        const btnSubmit = document.querySelector('button[type="submit"]');
        if (btnSubmit) {
            const btnText = btnSubmit.querySelector('span');
            btnText.textContent = 'Cadastrar';
            btnSubmit.disabled = false;
            btnSubmit.style.backgroundColor = '';
        }
        
        ensureFormFieldsVisibility();
    } finally {
        cadastroEmAndamento = false;
    }
}

// Função para mostrar mensagem de erro
function showError(message, suggestion = null) {
    const errorElement = document.querySelector('.error-message');
    
    // Se temos uma mensagem e uma sugestão, combina-os
    if (message && suggestion) {
        errorElement.innerHTML = `${message}<br><span style="font-size: 0.9em; color: #666; font-style: italic;">${suggestion}</span>`;
    } else {
        errorElement.textContent = message;
    }
    
    errorElement.style.display = "block";
    errorElement.style.animation = 'none';
    setTimeout(() => {
        errorElement.style.animation = 'error-shake 0.6s ease';
    }, 10);
    
    // Garante que todos os campos de input permaneçam visíveis
    ensureFormFieldsVisibility();
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

// Configura animação de hover no botão de cadastro
function setupCadastroButtonAnimation() {
    const cadastroButton = document.querySelector('button[type="submit"]');
    if (!cadastroButton) return;
    cadastroButton.addEventListener('mouseenter', () => {
        const hoverEffect = cadastroButton.querySelector('.btn-hover-effect');
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
            if (input.value.trim() !== '') {
                let validationResult = { valid: true };
                
                switch (input.id) {
                    case 'nome':
                        validationResult = validateName(input.value.trim());
                        break;
                    case 'email':
                        validationResult = validateEmail(input.value.trim());
                        break;
                    case 'senha':
                        validationResult = validatePassword(input.value.trim());
                        break;
                    case 'pais':
                        validationResult = validateLocation(input.value.trim(), "País");
                        break;
                    case 'estado':
                        validationResult = validateLocation(input.value.trim(), "Estado");
                        break;
                    case 'cidade':
                        validationResult = validateLocation(input.value.trim(), "Cidade");
                        break;
                }
                
                if (!validationResult.valid) {
                    animateInvalidInput(input);
                    showError(validationResult.message);
                } else {
                    resetInputValidation(input);
                    // Esconder mensagem de erro se ainda estiver visível
                    const errorElement = document.querySelector('.error-message');
                    if (errorElement && errorElement.style.display === 'block') {
                        errorElement.style.display = 'none';
                    }
                    
                    // Se temos uma sugestão, mostrá-la
                    if (validationResult.suggestion) {
                        showError(null, validationResult.suggestion);
                    }
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

document.addEventListener('DOMContentLoaded', function() {
    console.log("Página de cadastro carregada");
    
    addKeyframesRules();
    
    // Configurar o toggle de visibilidade da senha
    const toggleButton = document.querySelector('.toggle-password');
    if (toggleButton) {
        toggleButton.addEventListener('click', togglePasswordVisibility);
    }
    
    document.addEventListener('mousemove', handleParallax);
    setupCadastroButtonAnimation();
    setupInputAnimations();
    
    // Garantir visibilidade dos campos ao iniciar
    ensureFormFieldsVisibility();
    
    // Adicionar eventos de foco para garantir visibilidade
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', ensureFormFieldsVisibility);
    });
    
    // Adicionar evento ao checkbox de termos
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function() {
            const errorElement = document.querySelector('.error-message');
            
            // Se o checkbox foi marcado e há uma mensagem de erro sobre os termos
            if (this.checked && errorElement && errorElement.textContent.includes("termos")) {
                errorElement.style.display = 'none';
                resetInputValidation(this);
            }
            
            // Se o checkbox foi desmarcado e não há mensagem de erro
            if (!this.checked && (!errorElement || errorElement.style.display === 'none')) {
                // Não mostrar erro aqui, apenas resetar estilo
                resetInputValidation(this);
            }
        });
    }
    
    // Capturar o formulário
    const registerForm = document.getElementById('registerForm');
    
    // Configurar apenas um único event listener para o formulário
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            cadastrarUsuario();
        });
    }
    
    // Configurar a animação inicial - entrando de baixo
    const container = document.querySelector('.login-container');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(100vh)';
        
        // Pequeno atraso para garantir que as propriedades sejam aplicadas antes da animação
        setTimeout(() => {
            // Animação usando Anime.js
            const animationTimeline = anime.timeline({ loop: false });
            
            // Primeira animação: Container entrando de baixo
            animationTimeline.add({
                targets: '.login-container',
                opacity: [0, 1],
                translateY: ['100vh', '0'],
                easing: 'easeOutExpo',
                duration: 1000,
            })
            
            // Animação do título
            .add({
                targets: '.title-animation',
                opacity: [0, 1],
                translateY: [30, 0],
                easing: 'easeOutExpo',
                duration: 1000,
                delay: 1300
            })
            
            // Animação do subtítulo
            .add({
                targets: '.subtitle-animation',
                opacity: [0, 1],
                translateY: [20, 0],
                easing: 'easeOutExpo',
                duration: 800,
                delay: 1100
            })
            
            // Animação dos grupos de input, aparecendo sequencialmente
            .add({
                targets: '.input-group',
                opacity: [0, 1],
                translateY: [20, 0],
                easing: 'easeOutExpo',
                duration: 800,
                delay: anime.stagger(150, { start: 2300 })
            })
            
            // Animação das opções do formulário
            .add({
                targets: '.form-options-animation',
                opacity: [0, 1],
                translateY: [15, 0],
                easing: 'easeOutExpo',
                duration: 800,
                offset: '-=400'
            })
            
            // Animação do botão
            .add({
                targets: 'button[type="submit"]',
                scale: [0.9, 1],
                opacity: [0, 1],
                easing: 'easeOutExpo',
                duration: 800,
                offset: '-=400'
            })
            
            // Animação do link de login
            .add({
                targets: '.login-link',
                opacity: [0, 1],
                translateY: [10, 0],
                easing: 'easeOutExpo',
                duration: 800,
                offset: '-=400'
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