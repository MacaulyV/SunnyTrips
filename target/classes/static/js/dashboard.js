// Constante para definir o tempo de exibição de cada vídeo de fundo (em segundos)
const BACKGROUND_VIDEO_DURATION = 25; // 20 segundos para cada vídeo
const PROFILE_IMAGE_KEY = 'sunnyTrips_profileImage'; // Chave para o localStorage

// Flag global para rastrear se as funcionalidades de perfil já foram inicializadas
let perfilFuncionalidadesInicializadas = false;
// Flag para evitar inicialização duplicada do painel e mensagens
let painelInicializado = false;
// Flag para evitar mostrar mensagens de boas-vindas duplicadas
let mensagemBoasVindasMostrada = false;

// Variável para controlar a exibição de toasts em sequência rápida
let lastProfileImageToastTime = 0;

// Variável para controlar se o menu de configurações está visível
let isMenuVisible = false;

// Variável para armazenar o ID do temporizador para fechar o menu
let menuCloseTimerId = null;

// Tempo em ms para manter o menu visível após tirar o mouse (0.25 segundos)
const MENU_HIDE_DELAY = 250;

// Funções para manipulação dos modais
function openModal(tipo) {
    const modal = document.getElementById('modal' + tipo);
    if (modal) {
        // Centralizar o modal na tela
        document.body.style.overflow = 'hidden'; // Impedir rolagem do body
        
        // Mostrar o modal com efeito de fade in
        modal.style.display = 'flex';
        
        // Adicionar classe para indicar que o modal está ativo
        modal.classList.add('active');
        
        // Posicionar o modal no centro da janela
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            // Garantir que o modal fique no centro
            modalContent.style.margin = 'auto';
            
            // Impedir que eventos de click dentro do modal se propaguem
            modalContent.addEventListener('click', function(event) {
                event.stopPropagation();
            });
        }
        
        // Centralizar o scroll do modal
        setTimeout(() => {
            if (modalContent) {
                // Se tiver scroll, centralizar o conteúdo
                if (modalContent.scrollHeight > modalContent.clientHeight) {
                    modalContent.scrollTop = 0;
                }
            }
        }, 100);
    }
}

function closeModal(tipo) {
    const modal = document.getElementById('modal' + tipo);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar rolagem do body
    }
}

// Função para confirmar exclusão de conta
function confirmarExclusao() {
    // Esconde qualquer menu visível
    const menuConfig = document.getElementById('menuConfiguracoes');
    if (menuConfig) {
        menuConfig.style.display = 'none';
    }
    
    // Cancelar qualquer temporizador pendente
    cancelMenuHideTimer();
    
    // Abre o modal
    openModal('DeleteConfirm');
    
    // Prevenção contra fechamento acidental - garante que o modal permaneça visível
    const modal = document.getElementById('modalDeleteConfirm');
    if (modal) {
        setTimeout(() => {
            modal.style.display = 'flex';
            modal.classList.add('active');
        }, 100);
    }
}

// Função para editar perfil
function editarPerfil() {
    try {
        // Esconde qualquer menu visível
        const menuConfig = document.getElementById('menuConfiguracoes');
        if (menuConfig) {
            menuConfig.style.display = 'none';
        }
        
        // Cancelar qualquer temporizador pendente
        cancelMenuHideTimer();
        
        // Preencher o campo de senha
        if (document.getElementById('senha')) {
            document.getElementById('senha').value = ''; // Limpar o campo de senha por segurança
        }
        
        // Abrir o modal
        openModal('EditProfile');
        
        // Prevenção contra fechamento acidental - garante que o modal permaneça visível
        const modal = document.getElementById('modalEditProfile');
        if (modal) {
            setTimeout(() => {
                modal.style.display = 'flex';
                modal.classList.add('active');
            }, 100);
        }
    } catch (error) {
        console.error('Erro ao abrir modal de edição:', error);
    }
}

// Função para excluir conta
async function excluirConta() {
    try {
        // Obter o ID do usuário atual da sessão
        const userId = document.getElementById('userId') ? document.getElementById('userId').value : null;
        
        if (!userId) {
            throw new Error('ID do usuário não encontrado na sessão');
        }
        
        // Mostrar indicador de carregamento
        const btnConfirmarExclusao = document.querySelector('#modalDeleteConfirm .btn-danger');
        if (btnConfirmarExclusao) {
            btnConfirmarExclusao.disabled = true;
            btnConfirmarExclusao.textContent = 'Excluindo...';
        }
        
        // Fechando o modal antes da chamada API para melhorar UX
        closeModal('DeleteConfirm');
        
        // Mostrar toast de processamento
        showToast('info', 'Processando', 'Excluindo sua conta...');
        
        console.log(`Deletando usuário com ID ${userId}...`);
        
        // URL do endpoint correto para deletar o usuário
        const deleteUrl = `/usuarios/${userId}`;
        
        // Fazendo a chamada DELETE para a API
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Verifica se a requisição foi bem-sucedida
        if (response.ok) {
            console.log('Conta excluída com sucesso na API');
            
            // Mostrando mensagem de sucesso
            showToast('success', 'Sucesso', 'Sua conta foi excluída com sucesso.');
            
            // Pequeno delay para garantir que o usuário veja a mensagem
            setTimeout(() => {
                // Redirecionando para a página de login
                window.location.href = '/login';
            }, 2000);
            
        } else {
            // Se houver erro na API, obter a mensagem de erro
            let errorMessage = 'Erro ao processar a solicitação';
            
            try {
                // Tente analisar o corpo da resposta como JSON
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
                // Se não for JSON, tente pegar o texto
                try {
                    const errorText = await response.text();
                    if (errorText) errorMessage = errorText;
                } catch (textError) {
                    // Se tudo falhar, use o status da resposta
                    errorMessage = `Erro ${response.status}: ${response.statusText}`;
                }
            }
            
            throw new Error(`Erro ao excluir conta: ${errorMessage}`);
        }
        
    } catch (error) {
        console.error('Erro ao excluir conta:', error);
        
        // Reabrir o modal se houver erro, para permitir nova tentativa
        const modal = document.getElementById('modalDeleteConfirm');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
        }
        
        // Reativa o botão de confirmação
        const btnConfirmarExclusao = document.querySelector('#modalDeleteConfirm .btn-danger');
        if (btnConfirmarExclusao) {
            btnConfirmarExclusao.disabled = false;
            btnConfirmarExclusao.textContent = 'Confirmar Exclusão';
        }
        
        // Exibe mensagem de erro para o usuário
        showToast('error', 'Erro', error.message);
    }
}

// Função para atualizar o perfil do usuário
function atualizarPerfil(event) {
    event.preventDefault();
    
    // Obter os valores do formulário
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const pais = document.getElementById('pais').value;
    const estado = document.getElementById('estado').value;
    const cidade = document.getElementById('cidade').value;
    
    // Validar a senha - requisito mínimo de 6 caracteres
    if (senha.length < 6) {
        // Remover qualquer mensagem de erro anterior
        removerMensagemErro('senha');
        
        // Exibir mensagem de erro amigável para o usuário
        exibirMensagemErro('senha', 'A senha deve ter pelo menos 6 caracteres.');
        
        // Destacar o campo com erro
        const senhaInput = document.getElementById('senha');
        senhaInput.classList.add('input-error');
        
        // Focalizar no campo de senha
        senhaInput.focus();
        
        return false; // Impede o envio do formulário
    }
    
    // Remover qualquer mensagem de erro e classe de erro se a senha for válida
    removerMensagemErro('senha');
    document.getElementById('senha').classList.remove('input-error');
    
    // Montar o objeto para a requisição seguindo o formato esperado pelo endpoint
    const userData = {
        nome: nome,
        email: email,
        senha: senha,
        pais: pais,
        estado: estado,
        cidade: cidade
    };
    
    // Obter o ID do usuário da sessão
    const userId = document.getElementById('userId') ? document.getElementById('userId').value : 1;
    
    console.log(`Atualizando dados do usuário ${userId}:`, userData);
    
    // Enviar a requisição para o backend
    atualizarUsuarioNaAPI(userId, userData);
}

/**
 * Exibe uma mensagem de erro abaixo de um campo de formulário
 * @param {string} fieldId - ID do campo de formulário
 * @param {string} message - Mensagem de erro a ser exibida
 */
function exibirMensagemErro(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = message;
    errorDiv.style.color = '#ff3860';
    errorDiv.style.fontSize = '0.85rem';
    errorDiv.style.marginTop = '5px';
    errorDiv.style.marginBottom = '10px';
    errorDiv.setAttribute('id', `${fieldId}-error`);
    
    // Inserir a mensagem de erro após o container do campo
    const formGroup = field.closest('.form-group');
    const existingError = formGroup.querySelector('.error-message');
    
    if (!existingError) {
        formGroup.appendChild(errorDiv);
    }
}

/**
 * Remove a mensagem de erro de um campo
 * @param {string} fieldId - ID do campo de formulário
 */
function removerMensagemErro(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * Função para enviar a requisição PUT para atualizar o usuário na API
 * @param {number} userId - ID do usuário
 * @param {Object} userData - Dados do usuário para atualização
 */
async function atualizarUsuarioNaAPI(userId, userData) {
    try {
        console.log('Atualizando usuário na API:', userData);
        
        const usuarioUpdateUrl = `/usuarios/${userId}`;
        
        // Converter o userData para JSON e remover aspas extras se necessário
        const usuarioUpdateBody = JSON.stringify(userData);
        
        // Fazer requisição para atualizar o usuário
        const response = await fetch(usuarioUpdateUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: usuarioUpdateBody
        });
        
        // Verificar se a atualização foi bem-sucedida
        if (response.ok) {
            console.log('Usuário atualizado com sucesso!');
            
            // Atualizar todos os elementos na interface que mostram os dados do usuário
            atualizarDadosNaInterface(userData);
            
            // Buscar dados atualizados do clima usando a cidade atualizada
            fetchWeatherData(userData.cidade);
            
            // Atualizar a sessão no servidor para manter os dados consistentes
            await atualizarSessao(userData);
            
            // Mostrar mensagem de sucesso para o usuário
            showToast('success', 'Sucesso', 'Perfil atualizado com sucesso!');
            
            // Fechar o modal após atualização bem-sucedida
            closeModal('EditProfile');
            
            return true;
        } else {
            console.error('Erro ao atualizar usuário:', response.statusText);
            
            // Exibir mensagem de erro amigável para o usuário
            let mensagemErro = 'Erro ao atualizar perfil. Por favor, tente novamente.';
            
            try {
                // Tentar obter detalhes específicos do erro do servidor
            const errorData = await response.text();
                
                // Verificar se contém mensagem relacionada à senha
                if (errorData.includes('senha') || errorData.toLowerCase().includes('password')) {
                    mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
                    // Destacar o campo de senha com erro
                    removerMensagemErro('senha');
                    exibirMensagemErro('senha', mensagemErro);
                    document.getElementById('senha').classList.add('input-error');
                    document.getElementById('senha').focus();
                } else {
                    showToast('error', 'Erro', mensagemErro);
                }
                
                // Registrar o erro detalhado apenas no console para depuração
                console.error('Detalhes do erro:', errorData);
            } catch (err) {
                // Se não conseguir obter detalhes, mostrar mensagem genérica
                showToast('error', 'Erro', mensagemErro);
            }
            
            return false;
        }
    } catch (error) {
        console.error('Exceção ao atualizar usuário:', error);
        showToast('error', 'Erro', 'Erro de conexão ao atualizar perfil. Verifique sua internet.');
        return false;
    }
}

/**
 * Função para atualizar todos os elementos da interface que mostram os dados do usuário
 * @param {Object} userData - Dados atualizados do usuário
 */
function atualizarDadosNaInterface(userData) {
    try {
        console.log('Atualizando elementos da interface com os novos dados:', userData);
        
        // Arrays com todos os seletores possíveis para cada tipo de dado
        const seletoresNome = [
            '.welcome-name',          // Nome no cabeçalho
            '.profile-name',          // Nome no perfil
            '[data-user-name]',       // Elementos com atributo data-user-name
            'h2:contains("' + userData.nome + '")', // Cabeçalhos que podem conter o nome antigo
        ];
        
        const seletoresPais = [
            '.profile-country',      // País no perfil
            '[data-user-country]',   // Elementos com atributo data-user-country
        ];
        
        const seletoresEstado = [
            '.location-item:first-child .location-value',   // Estado na localização
            '[data-user-state]',                           // Elementos com atributo data-user-state
        ];
        
        const seletoresCidade = [
            '.location-item:last-child .location-value',    // Cidade na localização
            '.weather-location span',                      // Cidade no card de clima
            '[data-user-city]',                           // Elementos com atributo data-user-city
        ];
        
        const seletoresEmail = [
            '[data-user-email]',    // Elementos com atributo data-user-email
        ];
        
        // Função auxiliar para atualizar elementos por seletor
        function atualizarElementosPorSeletor(seletores, valor, nomeDado) {
            seletores.forEach(seletor => {
                try {
                    // Se for um seletor com :contains, usar jQuery ou lógica personalizada
                    if (seletor.includes(':contains')) {
                        // Implementação simplificada - atualizar elementos que contêm o texto exato
                        document.querySelectorAll('h2, span, p, div').forEach(el => {
                            if (el.textContent.includes(nomeDado + ' antigo') || 
                                el.textContent === nomeDado + ' antigo') {
                                el.textContent = el.textContent.replace(nomeDado + ' antigo', valor);
                                console.log(`Texto atualizado em elemento:`, el);
                            }
                        });
                    } else {
                        // Seletor normal
                        const elementos = document.querySelectorAll(seletor);
                        elementos.forEach(elemento => {
                            elemento.textContent = valor;
                            console.log(`${nomeDado} atualizado em elemento:`, elemento);
                        });
                    }
                } catch (err) {
                    console.warn(`Erro ao atualizar ${nomeDado} usando seletor ${seletor}:`, err);
                }
            });
        }
        
        // Atualizar todos os elementos
        atualizarElementosPorSeletor(seletoresNome, userData.nome, 'nome');
        atualizarElementosPorSeletor(seletoresPais, userData.pais, 'país');
        atualizarElementosPorSeletor(seletoresEstado, userData.estado, 'estado');
        atualizarElementosPorSeletor(seletoresCidade, userData.cidade, 'cidade');
        atualizarElementosPorSeletor(seletoresEmail, userData.email, 'email');
        
        // Atualizar qualquer elemento com atributo data-prop que corresponda a uma propriedade do usuário
        // Isso permite maior flexibilidade para adicionar elementos atualizáveis no futuro
        Object.keys(userData).forEach(prop => {
            const elementos = document.querySelectorAll(`[data-prop="${prop}"]`);
            elementos.forEach(elemento => {
                elemento.textContent = userData[prop];
                console.log(`Propriedade ${prop} atualizada em elemento com data-prop:`, elemento);
            });
        });
        
        // Garantir que a imagem de perfil permaneça carregada
        loadProfileImage();
        
        console.log('Todos os elementos da interface foram atualizados com sucesso');
    } catch (error) {
        console.error('Erro ao atualizar elementos da interface:', error);
    }
}

// Função para atualizar os dados na sessão
async function atualizarSessao(userData) {
    try {
        // Endpoint para atualizar a sessão
        const sessionUrl = '/atualizarSessao';
        
        // Fazer requisição para atualizar a sessão
        const response = await fetch(sessionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            console.warn('Não foi possível atualizar a sessão. As alterações podem não persistir até o próximo login.');
        } else {
            console.log('Sessão atualizada com sucesso');
        }
    } catch (error) {
        console.warn('Erro ao atualizar sessão:', error);
    }
}

/**
 * Função auxiliar para atualizar o texto de um elemento com segurança
 * @param {string} selector - Seletor CSS do elemento
 * @param {string} text - Novo texto a ser definido
 */
function updateElementText(selector, text) {
    const element = document.querySelector(selector);
    console.log(`Atualizando elemento "${selector}":`, element);
    
    if (element) {
        element.textContent = text;
        return true;
    } else {
        console.warn(`Elemento não encontrado: ${selector}`);
        return false;
    }
}

/**
 * Função para buscar dados do clima usando a API OpenWeatherMap
 * @param {string} city - Cidade do usuário
 */
async function fetchWeatherData(city) {
    console.log(`Fazendo requisição de clima para a cidade: ${city}`);
    
    // Token da API
    const apiKey = '52d46be6275fdb3d3e69537f894fc3f5';
    
    // Usar apenas a cidade na consulta
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`;
    
    console.log(`Fazendo requisição para: ${apiUrl}`);
    
    try {
        showLoadingState();
        
        const response = await fetch(apiUrl);
        
        // Se a resposta não for ok, lançar erro
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        // Converter resposta para JSON
        const data = await response.json();
        console.log('Dados do clima recebidos:', data);
        
        // Atualizar a interface com os dados do clima
        updateWeatherUI(data);
        updateProfileWeather(data);
        
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados do clima:', error);
        showErrorState(`Não foi possível obter dados do clima para ${city}`);
        throw error;
    }
}

/**
 * Mostra estado de carregamento na interface
 * @deprecated Parcialmente obsoleto, mantido para compatibilidade
 */
function showLoadingState() {
    try {
        console.log('Mostrando estado de carregamento na interface');
        
        /* Elementos removidos do HTML
        // Card principal do clima
        const temperatureDisplay = document.querySelector('.temperature-display');
        if (temperatureDisplay) {
            temperatureDisplay.textContent = "...";
        }
        
        const weatherDescription = document.querySelector('.weather-description');
        if (weatherDescription) {
            weatherDescription.textContent = "Carregando...";
        }
        
        // Detalhes do clima
        const detailItems = document.querySelectorAll('.weather-detail-item strong');
        detailItems.forEach(item => {
            item.textContent = "...";
        });
        */
        
        // Clima no perfil - Ainda existente no HTML
        const profileWeatherCondition = document.querySelector('.profile-weather-condition');
        if (profileWeatherCondition) {
            profileWeatherCondition.textContent = "Carregando...";
        }
        
        const profileWeatherTemp = document.querySelector('.profile-weather-temp');
        if (profileWeatherTemp) {
            profileWeatherTemp.textContent = "...";
        }
        
        /* Elemento removido
        document.querySelector('.weather-card')?.classList.add('loading');
        */
        
        // Adicionar classe de carregamento ao card de clima do perfil
        document.querySelector('.profile-weather-card')?.classList.add('loading');
        
    } catch (error) {
        console.error('Erro ao mostrar estado de carregamento:', error);
    }
}

/**
 * Mostra estado de erro na interface
 * @param {string} message - Mensagem de erro
 * @deprecated Parcialmente obsoleto, mantido para compatibilidade
 */
function showErrorState(message) {
    try {
        console.log('Mostrando estado de erro na interface:', message);
        
        /* Elementos removidos do HTML
        // Card principal do clima
        const temperatureDisplay = document.querySelector('.temperature-display');
        if (temperatureDisplay) {
            temperatureDisplay.textContent = "--°C";
        }
        
        const weatherDescription = document.querySelector('.weather-description');
        if (weatherDescription) {
            weatherDescription.textContent = "Não disponível";
        }
        
        // Detalhes do clima
        const detailItems = document.querySelectorAll('.weather-detail-item strong');
        detailItems.forEach(item => {
            item.textContent = "--";
        });
        */
        
        // Clima no perfil - Ainda existente no HTML
        const profileWeatherCondition = document.querySelector('.profile-weather-condition');
        if (profileWeatherCondition) {
            profileWeatherCondition.textContent = "Indisponível";
        }
        
        const profileWeatherTemp = document.querySelector('.profile-weather-temp');
        if (profileWeatherTemp) {
            profileWeatherTemp.textContent = "--°C";
        }
        
        // Remover classe de carregamento e adicionar classe de erro
        /* Elemento removido
        document.querySelector('.weather-card')?.classList.remove('loading');
        document.querySelector('.weather-card')?.classList.add('error');
        */
        
        document.querySelector('.profile-weather-card')?.classList.remove('loading');
        document.querySelector('.profile-weather-card')?.classList.add('error');
        
        // Exibir alerta para o usuário
        showToast('error', 'Erro', message);
        
    } catch (error) {
        console.error('Erro ao mostrar estado de erro:', error);
    }
}

/**
 * Atualiza a interface principal com os dados do clima
 * @param {Object} weatherData - Dados do clima
 * @deprecated Os elementos principais foram removidos do HTML, mas a função é mantida por compatibilidade
 */
function updateWeatherUI(weatherData) {
    try {
        // Extrair informações relevantes dos dados
        const temp = Math.round(weatherData.main.temp);
        const tempMin = Math.round(weatherData.main.temp_min);
        const weatherDescription = weatherData.weather[0].description;
        const weatherIcon = weatherData.weather[0].icon;
        const pressure = weatherData.main.pressure;
        const visibility = (weatherData.visibility / 1000).toFixed(1); // Converter para km
        const humidity = weatherData.main.humidity;
        const windSpeed = weatherData.wind.speed;
        
        console.log('Atualizando interface do clima com temperatura:', temp);
        
        // Atualizar temperatura principal no card de clima
        const temperatureDisplay = document.querySelector('.temperature-display');
        if (temperatureDisplay) {
            temperatureDisplay.textContent = `${temp}°C`;
            console.log('Temperatura principal atualizada');
        }
        
        // Atualizar descrição do clima
        const weatherDescriptionElement = document.querySelector('.weather-description');
        if (weatherDescriptionElement) {
            weatherDescriptionElement.textContent = capitalizeFirstLetter(weatherDescription);
            console.log('Descrição do clima atualizada');
        }
        
        // Atualizar ícone do clima
        const weatherIconElement = document.querySelector('.weather-icon-container i');
        if (weatherIconElement) {
            // Limpar classes existentes relacionadas ao clima
            weatherIconElement.className = '';
            
            // Adicionar novas classes
        const iconClass = mapWeatherIconToFontAwesome(weatherIcon);
            weatherIconElement.classList.add('fas', iconClass, 'weather-icon');
            console.log('Ícone do clima atualizado para:', iconClass);
        }
        
        // Atualizar métricas detalhadas (umidade, vento, pressão)
        const humidityElement = document.querySelector('.weather-details .weather-detail-item:nth-child(1) strong');
        if (humidityElement) {
            humidityElement.textContent = `${humidity}%`;
            console.log('Umidade atualizada');
        }
        
        const windElement = document.querySelector('.weather-details .weather-detail-item:nth-child(2) strong');
        if (windElement) {
            windElement.textContent = `${windSpeed}km/h`;
            console.log('Velocidade do vento atualizada');
        }
        
        const pressureElement = document.querySelector('.weather-details .weather-detail-item:nth-child(3) strong');
        if (pressureElement) {
            pressureElement.textContent = `${pressure}mb`;
            console.log('Pressão atmosférica atualizada');
        }
        
        // Atualizar qualquer outra informação do clima na interface
        
    } catch (error) {
        console.error('Erro ao atualizar interface do clima:', error);
        showToast('error', 'Erro', 'Não foi possível atualizar os dados do clima na interface');
    }
}

/**
 * Atualiza o clima na seção de perfil do usuário com informações detalhadas
 * @param {Object} weatherData - Dados do clima
 */
function updateProfileWeather(weatherData) {
    try {
        if (!weatherData || !weatherData.main || !weatherData.weather || !weatherData.weather[0]) {
            console.error('Dados do clima inválidos ou incompletos:', weatherData);
            showErrorState('Dados do clima recebidos estão incompletos');
            return;
        }
        
        console.log('Atualizando clima no perfil do usuário com dados:', weatherData);
        
        // Extrair informações básicas
        const temp = Math.round(weatherData.main.temp);
        const feelsLike = Math.round(weatherData.main.feels_like);
        const weatherDescription = weatherData.weather[0].description;
        const weatherIcon = weatherData.weather[0].icon;
        
        // Informações adicionais que podem ser úteis
        const humidity = weatherData.main.humidity;
        const windSpeed = weatherData.wind.speed;
        const tempMin = weatherData.main.temp_min ? Math.round(weatherData.main.temp_min) : null;
        const tempMax = weatherData.main.temp_max ? Math.round(weatherData.main.temp_max) : null;
        
        // Construir a descrição detalhada para o tooltip
        let detailedDescription = `${capitalizeFirstLetter(weatherDescription)}`;
        if (feelsLike && feelsLike !== temp) {
            detailedDescription += ` (Sensação: ${feelsLike}°C)`;
        }
        if (humidity) {
            detailedDescription += ` · Umidade: ${humidity}%`;
        }
        if (windSpeed) {
            detailedDescription += ` · Vento: ${windSpeed}km/h`;
        }
        
        // Remover classe de carregamento ou erro se existir
        const weatherCard = document.querySelector('.profile-weather-card');
        if (weatherCard) {
            weatherCard.classList.remove('loading', 'error');
            
            // Adicionar atributo title para mostrar informações adicionais ao passar o mouse
            weatherCard.setAttribute('title', detailedDescription);
            
            // Adicionar classe para indicar que os dados são reais
            weatherCard.classList.add('data-loaded');
        }
        
        // Atualizar temperatura no card de perfil
        const profileTempElement = document.querySelector('.profile-weather-temp');
        if (profileTempElement) {
            profileTempElement.textContent = `${temp}°C`;
            profileTempElement.setAttribute('data-feels-like', `${feelsLike}°C`);
            console.log('Temperatura no perfil atualizada para:', temp);
        }
        
        // Atualizar descrição do clima no perfil
        const profileWeatherCondition = document.querySelector('.profile-weather-condition');
        if (profileWeatherCondition) {
            profileWeatherCondition.textContent = capitalizeFirstLetter(weatherDescription);
            console.log('Condição do clima no perfil atualizada para:', weatherDescription);
        }
        
        // Atualizar ícone do clima no perfil
        const profileIconContainer = document.querySelector('.profile-weather-icon');
        if (profileIconContainer) {
            // Construir URL do ícone da API
            const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
            console.log('URL do ícone do clima:', iconUrl);
            
            // Limpar o conteúdo do container
            profileIconContainer.innerHTML = '';
            
            // Criar e adicionar elemento de imagem
            const imgElement = document.createElement('img');
            imgElement.src = iconUrl;
            imgElement.alt = weatherDescription;
            imgElement.setAttribute('data-icon-code', weatherIcon);
            imgElement.title = capitalizeFirstLetter(weatherDescription);
            
            // Adicionar imagem ao container
            profileIconContainer.appendChild(imgElement);
            console.log('Ícone do clima substituído pela imagem da API');
        }
        
        // Adicionar evento de clique para mostrar mais detalhes se desejado
        if (weatherCard && !weatherCard.hasAttribute('data-listener-added')) {
            weatherCard.setAttribute('data-listener-added', 'true');
            weatherCard.addEventListener('click', function() {
                // Mostrar informações mais detalhadas quando o card for clicado
                showToast('info', 'Informações do Clima', detailedDescription, 5000);
            });
        }
        
    } catch (error) {
        console.error('Erro ao atualizar clima do perfil:', error);
        
        // Tentar usar o ícone Font Awesome como fallback se houver erro com a imagem
        try {
            const profileIconContainer = document.querySelector('.profile-weather-icon');
            if (profileIconContainer) {
                // Verificar se já existe um ícone Font Awesome, caso contrário criar um
                let iconElement = profileIconContainer.querySelector('i');
                
                if (!iconElement) {
                    // Limpar o container e criar o ícone
                    profileIconContainer.innerHTML = '';
                    iconElement = document.createElement('i');
                    iconElement.className = 'fas fa-cloud';
                    profileIconContainer.appendChild(iconElement);
                }
            }
            
            document.querySelector('.profile-weather-condition').textContent = 'Tempo atual';
            document.querySelector('.profile-weather-temp').textContent = 
                weatherData && weatherData.main ? `${Math.round(weatherData.main.temp)}°C` : 'N/A';
        } catch (e) {
            console.error('Erro ao fazer fallback de atualização do clima:', e);
        }
    }
}

/**
 * Mapeia os códigos de ícone da API para classes de ícones do FontAwesome
 * @param {string} iconCode - Código do ícone da API
 * @returns {string} - Classe do ícone FontAwesome
 */
function mapWeatherIconToFontAwesome(iconCode) {
    const iconMap = {
        '01d': 'fa-sun', // céu limpo (dia)
        '01n': 'fa-moon', // céu limpo (noite)
        '02d': 'fa-cloud-sun', // poucas nuvens (dia)
        '02n': 'fa-cloud-moon', // poucas nuvens (noite)
        '03d': 'fa-cloud', // nuvens dispersas
        '03n': 'fa-cloud',
        '04d': 'fa-cloud', // nuvens quebradas
        '04n': 'fa-cloud',
        '09d': 'fa-cloud-showers-heavy', // chuva de banho
        '09n': 'fa-cloud-showers-heavy',
        '10d': 'fa-cloud-sun-rain', // chuva (dia)
        '10n': 'fa-cloud-moon-rain', // chuva (noite)
        '11d': 'fa-bolt', // trovoada
        '11n': 'fa-bolt',
        '13d': 'fa-snowflake', // neve
        '13n': 'fa-snowflake',
        '50d': 'fa-smog', // névoa
        '50n': 'fa-smog'
    };
    
    return iconMap[iconCode] || 'fa-cloud'; // ícone padrão caso não encontre correspondência
}

/**
 * Capitaliza a primeira letra de uma string
 * @param {string} str - String para capitalizar
 * @returns {string} - String com primeira letra maiúscula
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Função para alternar entre os vídeos de fundo do perfil
 * Inicia com CapaPerfil3.mp4, depois CapaPerfil2.mp4, e por último CapaPerfil1.mp4
 * @param {number} intervalTime - Tempo em milissegundos para cada vídeo ser exibido
 */
function startBackgroundVideoRotation(intervalTime = 15000) {
    // Log para depuração
    console.log(`Iniciando rotação de vídeos com intervalo de ${intervalTime}ms (${intervalTime/1000} segundos)`);
    
    // Array com os nomes dos vídeos na ordem desejada (começando pelo 3)
    const videoFiles = [
        'CapaPerfil3.mp4',
        'CapaPerfil2.mp4',
        'CapaPerfil1.mp4'
    ];
    
    // Índice atual do vídeo
    let currentVideoIndex = 0;
    
    // Elemento de vídeo
    const videoElement = document.getElementById('profileVideo');
    
    // Verificar se o elemento de vídeo existe
    if (!videoElement) {
        console.error('Elemento de vídeo não encontrado');
        return;
    }
    
    // Variável para armazenar o temporizador de progresso
    let progressTimer = null;
    
    // Limpar todos os ouvintes de eventos existentes e temporizadores
    function clearAllTimersAndListeners() {
        // Limpar o intervalo principal se existir
        if (window.backgroundVideoInterval) {
            clearInterval(window.backgroundVideoInterval);
            window.backgroundVideoInterval = null;
        }
        
        // Limpar qualquer timeout pendente
        if (window.backgroundVideoTimeout) {
            clearTimeout(window.backgroundVideoTimeout);
            window.backgroundVideoTimeout = null;
        }
        
        // Limpar o temporizador de progresso
        if (progressTimer) {
            clearInterval(progressTimer);
            progressTimer = null;
        }
        
        // Remover eventos anteriores
        videoElement.onended = null;
        
        console.log('Todos os temporizadores e eventos anteriores foram limpos');
    }
    
    // Função para iniciar o temporizador de progresso
    function startProgressTimer(videoName, totalDuration) {
        if (progressTimer) {
            clearInterval(progressTimer);
        }
        
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + totalDuration);
        
        console.log(`🎬 Iniciando vídeo ${videoName} às ${startTime.toLocaleTimeString()}`);
        console.log(`⏱️ Próxima troca agendada para ${endTime.toLocaleTimeString()} (em ${totalDuration/1000} segundos)`);
        
        // Mostrar progresso a cada 10 segundos
        progressTimer = setInterval(() => {
            const now = new Date();
            const elapsedMs = now.getTime() - startTime.getTime();
            const elapsedSec = Math.floor(elapsedMs / 1000);
            const remainingSec = Math.floor((totalDuration - elapsedMs) / 1000);
            
            console.log(`⏱️ Vídeo ${videoName}: ${elapsedSec}s decorridos, ${remainingSec}s restantes`);
        }, 10000); // A cada 10 segundos
    }
    
    // Função para configurar o loop contínuo de um único vídeo
    function setupVideoLoop(videoElement) {
        // Adicionar evento para quando o vídeo terminar
        videoElement.onended = function() {
            console.log("🔄 Vídeo terminou, reiniciando imediatamente para manter loop contínuo");
            // Reiniciar o mesmo vídeo imediatamente para evitar congelamento
            videoElement.currentTime = 0;
            videoElement.play().catch(error => {
                console.error('Erro ao reiniciar o vídeo:', error);
            });
        };
    }
    
    // Função para trocar o vídeo
    function changeBackgroundVideo() {
        // Limpar temporizadores existentes para evitar chamadas concorrentes
        clearAllTimersAndListeners();
        
        // Obter o vídeo atual do array
        const nextVideo = videoFiles[currentVideoIndex];
        
        // Construir o caminho do vídeo com o contexto da aplicação
        const videoPath = `${window.location.origin}/images/${nextVideo}`;
        
        const currentTime = new Date();
        console.log(`[${currentTime.toLocaleTimeString()}] 🔄 Alternando para o vídeo: ${nextVideo} (índice ${currentVideoIndex})`);
        
        // Modificar a fonte do vídeo
        const sourceElement = videoElement.querySelector('source');
        if (sourceElement) {
            sourceElement.setAttribute('src', videoPath);
            
            // Definir atributo de preload para carregamento mais rápido
            videoElement.preload = "auto";
            
            // Recarregar o vídeo para aplicar a nova fonte
            videoElement.load();
            
            // Configurar o loop contínuo para este vídeo
            setupVideoLoop(videoElement);
            
            // Reproduzir o vídeo 
            videoElement.play().catch(error => {
                console.error('Erro ao reproduzir o vídeo:', error);
            });
            
            // Iniciar o temporizador de progresso para visualizar o tempo decorrido
            startProgressTimer(nextVideo, intervalTime);
            
            // Incrementar o índice para o próximo vídeo (circular)
            currentVideoIndex = (currentVideoIndex + 1) % videoFiles.length;
            
            // Configurar o próximo vídeo após o intervalo definido
            window.backgroundVideoTimeout = setTimeout(() => {
                console.log(`⏰ Temporizador de ${intervalTime/1000} segundos atingido`);
                changeBackgroundVideo();
            }, intervalTime);
        } else {
            console.error('Elemento source não encontrado no vídeo');
        }
    }
    
    // Limpar quaisquer temporizadores anteriores antes de começar
    clearAllTimersAndListeners();
    
    // Iniciar imediatamente o vídeo que já está carregado no HTML
    // Configurar seu loop contínuo
    setupVideoLoop(videoElement);
    
    videoElement.play().catch(error => {
        console.error('Erro ao reproduzir o vídeo inicial:', error);
    });
    
    // Iniciar o temporizador de progresso para o vídeo inicial
    startProgressTimer('CapaPerfil3.mp4 (inicial)', intervalTime);
    
    // Configurar a primeira alternância após o intervalo completo
    window.backgroundVideoTimeout = setTimeout(() => {
        console.log('🎬 Executando primeira alternância automática');
        changeBackgroundVideo();
    }, intervalTime);
}

/**
 * Função para acionar o seletor de arquivo para alterar a foto de perfil
 */
function alterarFotoPerfil() {
    // Adiciona uma animação pulsante ao contêiner da foto para feedback visual
    const avatarContainer = document.querySelector('.profile-avatar-container');
    if (avatarContainer) {
        // Adiciona classe de animação
        avatarContainer.classList.add('pulse-animation');
        
        // Remove a classe após a animação
        setTimeout(() => {
            avatarContainer.classList.remove('pulse-animation');
        }, 1000);
        
        // Exibe uma dica visual
        showToast('info', 'Alterar foto', 'Selecione uma imagem para seu perfil');
    }
    
    // Acionar o input file para seleção de arquivo
    const fileInput = document.getElementById('upload-profile-image');
    if (fileInput) {
        fileInput.value = ''; // Limpa o input para permitir selecionar o mesmo arquivo novamente
        fileInput.click();
    } else {
        console.error('Elemento de upload não encontrado');
        showToast('error', 'Erro', 'Não foi possível abrir o seletor de arquivos');
    }
}

/**
 * Manipula o upload da imagem de perfil
 */
function handleProfileImageUpload() {
    const fileInput = document.getElementById('upload-profile-image');
    const avatarImg = document.getElementById('avatar-img');
    
    // Verificar se o event listener já foi configurado para evitar duplicação
    if (fileInput && !fileInput.hasAttribute('data-listener-configured')) {
        fileInput.setAttribute('data-listener-configured', 'true');
        
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            
            // Verificar se um arquivo foi selecionado
            if (!file) return;
            
            // Verificar se o arquivo é uma imagem
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione uma imagem válida.');
                return;
            }
            
            // Limitar o tamanho do arquivo para 2MB
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                alert('A imagem deve ter no máximo 2MB.');
                return;
            }
            
            // Criar um FileReader para ler o arquivo como Data URL
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Obter a Data URL da imagem
                const imageDataUrl = e.target.result;
                
                // Exibir a imagem no avatar
                avatarImg.src = imageDataUrl;
                
                // Salvar a imagem no localStorage
                saveProfileImage(imageDataUrl);
                
                console.log('Imagem de perfil atualizada com sucesso!');
            };
            
            // Ler o arquivo como Data URL
            reader.readAsDataURL(file);
        });
    }
}

/**
 * Salva a imagem de perfil no localStorage
 * @param {string} imageDataUrl - URL da imagem em formato Data URL
 */
function saveProfileImage(imageDataUrl) {
    // Obter o ID do usuário atual
    const userId = document.getElementById('userId') ? document.getElementById('userId').value : null;
    
    if (!userId) {
        console.error('ID do usuário não encontrado, não é possível salvar a imagem de perfil');
        return;
    }
    
    // Atualizar imagem de perfil na sidebar
    const profileImage = document.getElementById('avatar-img');
    if (profileImage) {
        profileImage.src = imageDataUrl;
    }
    
    // Atualizar também a imagem no cabeçalho
    const headerImage = document.getElementById('avatar-img-header');
    if (headerImage) {
        headerImage.src = imageDataUrl;
    }
    
    // Armazenar no localStorage para persistência, usando o ID do usuário como parte da chave
    localStorage.setItem(`profileImage_${userId}`, imageDataUrl);
    
    // Evitar mostrar toasts múltiplos em sequência rápida (intervalo mínimo de 2 segundos)
    const now = Date.now();
    if (now - lastProfileImageToastTime > 2000) {
        // Mostrar notificação
        showToast('success', 'Sucesso', 'Foto de perfil atualizada com sucesso!');
        lastProfileImageToastTime = now;
    }
}

/**
 * Carrega a imagem de perfil do localStorage
 */
function loadProfileImage() {
    // Obter o ID do usuário atual
    const userId = document.getElementById('userId') ? document.getElementById('userId').value : null;
    
    if (!userId) {
        console.error('ID do usuário não encontrado, não é possível carregar a imagem de perfil');
        setDefaultProfileImage();
        return;
    }
    
    // Tenta obter a imagem do localStorage usando a chave com o ID do usuário
    const savedImage = localStorage.getItem(`profileImage_${userId}`);
    
    if (savedImage) {
        // Atualizar imagem de perfil na sidebar
        const profileImage = document.getElementById('avatar-img');
        if (profileImage) {
            profileImage.src = savedImage;
        }
        
        // Atualizar também a imagem no cabeçalho
        const headerImage = document.getElementById('avatar-img-header');
        if (headerImage) {
            headerImage.src = savedImage;
        }
    } else {
        // Se não tiver imagem salva, usar a imagem padrão
        setDefaultProfileImage();
    }
}

/**
 * Define a imagem padrão para o avatar do usuário
 */
function setDefaultProfileImage() {
    const defaultImagePath = '/images/avatar-default.png';
    console.log('Definindo imagem padrão de perfil:', defaultImagePath);
    
    // Atualizar imagem de perfil na sidebar
    const profileImage = document.getElementById('avatar-img');
    if (profileImage) {
        profileImage.src = defaultImagePath;
        
        // Adicionar tratamento de erro para a imagem
        profileImage.onerror = function() {
            console.error('Erro ao carregar a imagem padrão do perfil na sidebar. Tentando URL alternativa.');
            this.src = 'images/avatar-default.png'; // Tenta sem a barra inicial
            
            // Se ainda falhar, tenta um fallback absoluto
            this.onerror = function() {
                console.error('Erro ao carregar a URL alternativa. Usando data URI como fallback.');
                // Pequeno placeholder em base64 - círculo cinza como último recurso
                this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI2NjY2NjYyIvPjxwYXRoIGQ9Ik0zMCwzNWE1LDUgMCAxLDEgMTAsMGE1LDUgMCAxLDEgLTEwLDB6TTYwLDM1YTUsNSAwIDEsMSAxMCwwYTUsNSAwIDEsMSAtMTAsMHoiIGZpbGw9IiNmZmZmZmYiLz48cGF0aCBkPSJNNDAsNjVjMCwwIDUsMTAgMTAsMTBjNSwwIDEwLC0xMCAxMCwtMTAiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+PC9zdmc+';
            };
        };
    } else {
        console.warn('Elemento avatar-img não encontrado na sidebar');
    }
    
    // Atualizar também a imagem no cabeçalho
    const headerImage = document.getElementById('avatar-img-header');
    if (headerImage) {
        headerImage.src = defaultImagePath;
        
        // Adicionar tratamento de erro para a imagem do cabeçalho
        headerImage.onerror = function() {
            console.error('Erro ao carregar a imagem padrão do perfil no cabeçalho. Tentando URL alternativa.');
            this.src = 'images/avatar-default.png'; // Tenta sem a barra inicial
            
            // Se ainda falhar, tenta um fallback absoluto
            this.onerror = function() {
                console.error('Erro ao carregar a URL alternativa para o cabeçalho. Usando data URI como fallback.');
                // Pequeno placeholder em base64 - círculo cinza como último recurso
                this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI2NjY2NjYyIvPjxwYXRoIGQ9Ik0zMCwzNWE1LDUgMCAxLDEgMTAsMGE1LDUgMCAxLDEgLTEwLDB6TTYwLDM1YTUsNSAwIDEsMSAxMCwwYTUsNSAwIDEsMSAtMTAsMHoiIGZpbGw9IiNmZmZmZmYiLz48cGF0aCBkPSJNNDAsNjVjMCwwIDUsMTAgMTAsMTBjNSwwIDEwLC0xMCAxMCwtMTAiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+PC9zdmc+';
            };
        };
    } else {
        console.warn('Elemento avatar-img-header não encontrado no cabeçalho');
    }
    
    // Se o usuário estiver logado, remover a imagem específica dele do localStorage
    const userId = document.getElementById('userId') ? document.getElementById('userId').value : null;
    if (userId) {
        localStorage.removeItem(`profileImage_${userId}`);
    }
}

/**
 * Inicializar funcionalidades de perfil
 */
function inicializarFuncionalidadesPerfil() {
    // Evitar inicialização duplicada
    if (perfilFuncionalidadesInicializadas) {
        console.log('Funcionalidades de perfil já foram inicializadas.');
        return;
    }
    
    console.log('Inicializando funcionalidades de perfil...');
    
    // Carregar imagem de perfil salva
    loadProfileImage();
    
    // Configurar evento de upload de imagem
    handleProfileImageUpload();
    
    // Adicionar evento de clique diretamente no avatar para upload
    const avatarContainer = document.querySelector('.profile-avatar-container');
    if (avatarContainer) {
        avatarContainer.addEventListener('click', alterarFotoPerfil);
    }
    
    // Marcar como inicializado
    perfilFuncionalidadesInicializadas = true;
}

// Marcar que já temos um event listener para DOMContentLoaded
let domContentLoadedListenerAdded = false;

// Principal event listener DOMContentLoaded para inicialização de todo o dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Evitar inicialização duplicada
    if (domContentLoadedListenerAdded) {
        console.log('DOMContentLoaded já foi processado anteriormente.');
        return;
    }
    domContentLoadedListenerAdded = true;
    
    console.log('Inicializando dashboard...');
    
    try {
        // Inicializar o painel principal (inclui clima e rotação de vídeos)
        inicializarPainel();
        
        // Inicializar a engrenagem de configurações
        inicializarEngrenagem();
        
        // Inicializar os formulários
        inicializarFormularios();
        
        // Inicializar funcionalidades de perfil (nova função)
        inicializarFuncionalidadesPerfil();
    } catch (error) {
        console.error('Erro durante a inicialização do dashboard:', error);
    }
});

/**
 * Inicializar funcionalidades do painel
 */
function inicializarPainel() {
    // Evitar inicialização duplicada do painel
    if (painelInicializado) {
        console.log('Painel já foi inicializado anteriormente.');
        return;
    }
    
    try {
        console.log('Inicializando painel...');
        
        /* Removido - O gráfico não existe mais no HTML
        // Inicializar chart de temperatura
        let tempChart;
        try {
            tempChart = initTemperatureChart();
            // Armazenar referência do gráfico para atualizações posteriores
            window.temperatureChart = tempChart;
        } catch (chartError) {
            console.error('Erro ao inicializar gráfico de temperatura:', chartError);
        }
        */
        
        // Configurar alternância entre Celsius e Fahrenheit
        setupTemperatureToggle();
        
        // Inicializar funções do perfil
        inicializarFuncionalidadesPerfil();
        
        // Inicializar formulários
        inicializarFormularios();
        
        // Verificar estado do Font Awesome
        checkFontAwesomeIcons();
        
        // Verificar tema do usuário
        checkUserTheme();
        
        // Configurar ações dos cards
        setupCardActions();
        
        // Formatar a data atual
        setCurrentDate();
        
        // Verificar e iniciar rotação de vídeo
        const videoElement = document.getElementById('profileVideo');
        if (videoElement) {
            try {
                startBackgroundVideoRotation(15000);
            } catch (videoError) {
                console.error('Erro ao iniciar rotação de vídeo:', videoError);
            }
        }
        
        // Mostrar mensagem de boas-vindas se necessário
        mostrarMensagemBoasVindas();
        
        // Carregar dados do clima utilizando a cidade do usuário
        carregarDadosClimaUsuario();
        
        // Marcar painel como inicializado
        painelInicializado = true;
        
        console.log('Painel inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar painel:', error);
    }
}

/**
 * Configurar event listeners para funcionalidade do perfil
 */
function configurarListenersPerfil() {
    // Configurar envio do formulário para edição de perfil
    const formEditProfile = document.getElementById('formEditProfile');
    if (formEditProfile) {
        formEditProfile.addEventListener('submit', atualizarPerfil);
    }
    
    // Fechar modais ao clicar apenas no fundo do modal, não em seu conteúdo
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        });
    });
}

/**
 * Inicializar configurações da engrenagem e menu de contexto
 */
function inicializarEngrenagem() {
    const configBtn = document.getElementById('configuracoes');
    const menuConfig = document.getElementById('menuConfiguracoes');
    
    if (configBtn && menuConfig) {
        // Adicionar efeito de rotação na engrenagem ao passar o mouse
        configBtn.addEventListener('mouseenter', function() {
            const icon = configBtn.querySelector('.settings-icon');
            if (icon) {
                icon.classList.add('fa-spin');
            }
            
            // Mostrar o menu
            showSettingsMenu();
            
            // Cancelar o temporizador de fechamento
            cancelMenuHideTimer();
        });
        
        configBtn.addEventListener('mouseleave', function() {
            const icon = configBtn.querySelector('.settings-icon');
            if (icon) {
                icon.classList.remove('fa-spin');
            }
            
            // Iniciar o temporizador para esconder o menu
            startMenuHideTimer();
        });
        
        // Quando o mouse entra no menu, cancelar o temporizador
        menuConfig.addEventListener('mouseenter', function() {
            cancelMenuHideTimer();
        });
        
        // Quando o mouse sai do menu, iniciar o temporizador
        menuConfig.addEventListener('mouseleave', function() {
            startMenuHideTimer();
        });
        
        // Impedir que cliques no menu fechem o próprio menu
        menuConfig.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
}

/**
 * Mostrar o menu de configurações
 */
function showSettingsMenu() {
    const menuConfig = document.getElementById('menuConfiguracoes');
    if (menuConfig) {
        // Remover indicador de tempo existente, se houver
        const existingIndicator = menuConfig.querySelector('.menu-timer-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Mostrar o menu
        menuConfig.style.display = 'block';
        menuConfig.style.opacity = '1';
        menuConfig.style.transform = 'translateY(0)';
        isMenuVisible = true;
    }
}

/**
 * Esconder o menu de configurações
 */
function hideSettingsMenu() {
    const menuConfig = document.getElementById('menuConfiguracoes');
    if (menuConfig) {
        // Remover indicador de tempo existente, se houver
        const existingIndicator = menuConfig.querySelector('.menu-timer-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        menuConfig.style.display = 'none';
        isMenuVisible = false;
    }
}

/**
 * Iniciar temporizador para esconder o menu
 */
function startMenuHideTimer() {
    // Cancelar qualquer temporizador existente
    cancelMenuHideTimer();
    
    const menuConfig = document.getElementById('menuConfiguracoes');
    if (!menuConfig || !isMenuVisible) return;
    
    // Remover indicador existente
    const existingIndicator = menuConfig.querySelector('.menu-timer-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Criar e adicionar indicador visual do temporizador
    const indicator = document.createElement('div');
    indicator.className = 'menu-timer-indicator';
    indicator.style.animation = `timerShrink ${MENU_HIDE_DELAY/1000}s linear forwards`;
    menuConfig.appendChild(indicator);
    
    // Após um pequeno delay, tornar o indicador visível
    setTimeout(() => {
        indicator.style.opacity = '1';
    }, 10);
    
    // Iniciar um novo temporizador
    menuCloseTimerId = setTimeout(function() {
        hideSettingsMenu();
        menuCloseTimerId = null;
    }, MENU_HIDE_DELAY);
    
    console.log("Menu será fechado em 0.25 segundos se o mouse não retornar");
}

/**
 * Cancelar o temporizador para esconder o menu
 */
function cancelMenuHideTimer() {
    if (menuCloseTimerId !== null) {
        clearTimeout(menuCloseTimerId);
        menuCloseTimerId = null;
        
        // Remover indicador visual
        const menuConfig = document.getElementById('menuConfiguracoes');
        if (menuConfig) {
            const indicator = menuConfig.querySelector('.menu-timer-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
        
        console.log("Temporizador de fechamento do menu cancelado");
    }
}

/**
 * Inicializar funcionalidades de formulários
 */
function inicializarFormularios() {
    try {
        console.log('Inicializando formulários...');
        
        // Configurar envio do formulário para edição de perfil
        const formEditProfile = document.getElementById('formEditProfile');
        if (formEditProfile) {
            // Remover qualquer listener anterior para evitar duplicação
            formEditProfile.removeEventListener('submit', atualizarPerfil);
            
            // Adicionar novo listener
            formEditProfile.addEventListener('submit', atualizarPerfil);
            console.log('Evento de envio do formulário de edição de perfil configurado');
        } else {
            console.warn('Formulário de edição de perfil não encontrado');
        }
        
        // Configurar eventos para todos os formulários (para evitar submissão tradicional)
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                if (!this.hasAttribute('data-allow-submit')) {
            e.preventDefault();
                }
            });
        });
        
        // Configurar validação em tempo real para campos
        document.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value.trim() === '') {
                    this.classList.add('invalid');
                    
                    // Adicionar mensagem de erro se não existir
                    let errorSpan = this.parentElement.querySelector('.error-message');
                    if (!errorSpan) {
                        errorSpan = document.createElement('span');
                        errorSpan.className = 'error-message';
                        errorSpan.textContent = 'Este campo é obrigatório';
                        this.parentElement.appendChild(errorSpan);
                    }
                } else {
                    this.classList.remove('invalid');
                    
                    // Remover mensagem de erro se existir
                    const errorSpan = this.parentElement.querySelector('.error-message');
                    if (errorSpan) {
                        errorSpan.remove();
                    }
                }
            });
        });
        
        // Validação específica para campo de email
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (this.value.trim() !== '' && !this.value.includes('@')) {
                    this.classList.add('invalid');
                    
                    // Adicionar mensagem de erro de formato de email se não existir
                    let errorSpan = this.parentElement.querySelector('.error-message');
                    if (!errorSpan) {
                        errorSpan = document.createElement('span');
                        errorSpan.className = 'error-message';
                        errorSpan.textContent = 'Digite um email válido';
                        this.parentElement.appendChild(errorSpan);
                    } else {
                        errorSpan.textContent = 'Digite um email válido';
                    }
                }
            });
        }
    } catch (error) {
        console.error('Erro ao inicializar formulários:', error);
    }
}

// Função para alternar a visibilidade do menu de configurações
function toggleMenuConfiguracoes(event) {
    const menu = document.getElementById('menuConfiguracoes');
    if (!menu) return;
    
    isMenuVisible = !isMenuVisible; // Alterna o estado

    if (isMenuVisible) {
        menu.style.display = 'block'; // Mostra o menu
    } else {
        menu.style.display = 'none'; // Esconde o menu
    }
    
    // Impedir que o clique se propague e feche o menu imediatamente
    if (event) {
        event.stopPropagation();
    }
}

/**
 * Alternar a visibilidade da senha no formulário de edição
 */
function togglePasswordVisibilityEdit() {
    const senhaInput = document.getElementById('senha');
    const icon = document.querySelector('.toggle-password i');
    
    if (senhaInput && icon) {
        if (senhaInput.type === 'password') {
            senhaInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            senhaInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// Atualizações para o JavaScript (dashboard.js)

// Função para inicializar o gráfico de temperatura usando Chart.js
function initTemperatureChart() {
  // Função comentada - O elemento temperatureChart foi removido do HTML
  /*
  const ctx = document.getElementById('temperatureChart').getContext('2d');
  
  // Dados de exemplo para o gráfico de temperatura durante o dia
  const hoursLabels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
  const temperatureData = [22, 21, 20, 24, 28, 30, 27, 24];
  
  const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
  gradientFill.addColorStop(0, 'rgba(99, 179, 237, 0.5)');
  gradientFill.addColorStop(1, 'rgba(99, 179, 237, 0.0)');
  
  const temperatureChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hoursLabels,
      datasets: [{
        label: 'Temperatura',
        data: temperatureData,
        borderColor: '#63b3ed',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#63b3ed',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        backgroundColor: gradientFill
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(26, 32, 44, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#e2e8f0',
          borderColor: 'rgba(99, 179, 237, 0.3)',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `${context.parsed.y}°C`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: '#a0aec0'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          ticks: {
            color: '#a0aec0',
            callback: function(value) {
              return value + '°C';
            }
          },
          suggestedMin: 15,
          suggestedMax: 35
        }
      }
    }
  });
  
  return temperatureChart;
  */
 
  console.log('initTemperatureChart: Elemento temperatureChart removido, função mantida para compatibilidade');
  return null;
}

/**
 * Função para alternar entre Celsius e Fahrenheit
 */
function setupTemperatureToggle() {
  const toggleElements = document.querySelectorAll('.temperature-unit-toggle span');
  if (!toggleElements.length) return;
  
  toggleElements.forEach(element => {
    element.addEventListener('click', function() {
      toggleElements.forEach(el => el.classList.remove('active'));
      this.classList.add('active');
      
      // Lógica para converter as temperaturas
      const isCelsius = this.textContent === '°C';
      updateTemperatureUnits(isCelsius);
    });
  });
}

/**
 * Função para atualizar unidades de temperatura em toda a interface
 * @deprecated Parcialmente obsoleto, mantido principalmente para o card de perfil
 */
function updateTemperatureUnits(isCelsius) {
  // Agora só precisamos procurar pelo elemento de temperatura no perfil
  const temperatureElements = document.querySelectorAll('.profile-weather-temp');
  
  temperatureElements.forEach(element => {
    const text = element.textContent;
    const numericValue = parseFloat(text);
    
    if (!isNaN(numericValue)) {
      if (isCelsius) {
        // Convertendo de F para C
        if (text.includes('°F')) {
          const celsius = Math.round((numericValue - 32) * 5 / 9);
          element.textContent = `${celsius}°C`;
        }
      } else {
        // Convertendo de C para F
        if (text.includes('°C')) {
          const fahrenheit = Math.round((numericValue * 9 / 5) + 32);
          element.textContent = `${fahrenheit}°F`;
        }
      }
    }
  });
  
  /* Removido - O gráfico não existe mais
  // Atualizar o gráfico se estiver inicializado
  if (window.temperatureChart) {
    // Lógica para atualizar os dados do gráfico
  }
  */
}

/**
 * Garante que o container de notificações exista na página
 * @returns {HTMLElement} O container de notificações
 */
function garantirContainerNotificacoes() {
    let container = document.getElementById('notificationContainer');
    
    // Se o container não existir, criar um novo
    if (!container) {
        console.log('Container de notificações não encontrado, criando um novo...');
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    return container;
}

/**
 * Mostra um toast de notificação na tela
 * @param {string} type - Tipo de notificação (success, error, warning, info)
 * @param {string} title - Título da notificação
 * @param {string} message - Mensagem da notificação
 * @param {number} duration - Duração em milissegundos
 */
function showToast(type, title, message, duration = 5000) {
    try {
        // Garantir que o container exista
        const container = garantirContainerNotificacoes();
        
        // Criar o elemento de toast
  const toast = document.createElement('div');
  toast.className = `notification-toast toast-${type}`;
  
        // Criar o container principal para ícone e conteúdo
        const mainContent = document.createElement('div');
        
        // Adicionar o ícone
        const iconDiv = document.createElement('div');
        iconDiv.className = 'toast-icon';
        iconDiv.innerHTML = `<i class="fas ${getIconForToastType(type)}"></i>`;
        mainContent.appendChild(iconDiv);
        
        // Adicionar o conteúdo
        const contentDiv = document.createElement('div');
        contentDiv.className = 'toast-content';
        contentDiv.innerHTML = `
            <p class="toast-title">${title}</p>
      <p class="toast-message">${message}</p>
  `;
        mainContent.appendChild(contentDiv);
  
        // Adicionar o container principal ao toast
        toast.appendChild(mainContent);
        
        // Adicionar ao container
  container.appendChild(toast);
  
        // Configurar remoção automática após a duração especificada
        setTimeout(() => {
            if (toast.parentNode) {
    toast.classList.add('removing');
    setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
      }
                }, 300); // Tempo para a animação de saída
            }
  }, duration);
  
  return toast;
    } catch (error) {
        console.error('Erro ao mostrar toast:', error);
        return null;
    }
}

/**
 * Retorna a classe de ícone apropriada para o tipo de toast
 * @param {string} type - Tipo de toast (success, error, warning, info)
 * @returns {string} - Classe CSS do ícone FontAwesome
 */
function getIconForToastType(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-info-circle';
    }
}

/**
 * Configura exibição da data e hora atuais
 */
function setCurrentDate() {
  // Formatar a data atual
  const now = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = now.toLocaleDateString('pt-BR', options);
  
  // Atualizar data no elemento principal, se existir
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    dateElement.textContent = formattedDate;
  }
  
  // Configurar temporizador para atualizar o relógio principal (apenas se reinitializeHomeSection não foi chamado)
  const clockElement = document.getElementById('current-time');
  if (clockElement && !window.homeClockInterval) {
    function updateClock() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    // Chamar uma vez e depois iniciar o intervalo
    updateClock();
    setInterval(updateClock, 1000);
  }
}

// Adicionar listeners para os botões de ação dos cards
function setupCardActions() {
  // Comentado - Não é mais necessário pois os cards foram removidos
  /*
  // Listener para botão de atualizar
  const refreshButtons = document.querySelectorAll('.refresh-btn');
  refreshButtons.forEach(button => {
    button.addEventListener('click', function() {
      const card = this.closest('.dashboard-card');
      card.classList.add('loading');
      
      // Mostrar um efeito de carregamento
      this.querySelector('i').classList.add('fa-spin');
      
      // Simular uma atualização após um delay
      setTimeout(() => {
        card.classList.remove('loading');
        this.querySelector('i').classList.remove('fa-spin');
        
        // Notificar o usuário
        showToast('success', 'Atualizado', 'Dados atualizados com sucesso');
      }, 1500);
    });
  });
  */
  console.log('setupCardActions: Cards foram removidos do HTML, função mantida para compatibilidade');
}

// Função para verificar e corrigir o carregamento de ícones do Font Awesome
function checkFontAwesomeIcons() {
  console.log('Verificando ícones do Font Awesome...');
  
  // Verificar se os ícones estão carregados corretamente
  const testIcon = document.querySelector('.fa-home');
  let hasIssue = false;
  
  if (!testIcon) {
    console.warn('Não foi possível encontrar ícones Font Awesome para testar.');
    hasIssue = true;
  } else {
    try {
      const style = window.getComputedStyle(testIcon, '::before');
      // Verificar se o conteúdo existe
      if (style.content === 'none' || style.content === '' || style.content === 'normal') {
        console.warn('Font Awesome não foi carregado corretamente (conteúdo vazio).');
        hasIssue = true;
      }
    } catch (e) {
      console.error('Erro ao verificar ícones:', e);
      hasIssue = true;
    }
  }
  
  if (hasIssue) {
    console.warn('Problema detectado nos ícones. Aplicando correções...');
    loadFontAwesomeEmergencyFix();
    
    // Adicionar um aviso visível e um botão para recarregar
    addEmergencyIconReloadButton();
    
    // Mostrar notificação após um curto delay
    setTimeout(() => {
      showToast('warning', 'Atenção', 'Problema detectado no carregamento dos ícones. Tentando corrigir automaticamente.');
    }, 1500);
    
    return false;
  } else {
    console.log('Font Awesome carregado corretamente.');
    return true;
  }
}

// Função para carregar soluções de emergência para o Font Awesome
function loadFontAwesomeEmergencyFix() {
  console.log('Aplicando correções de emergência para Font Awesome...');
  
  // 1. Remover todas as referências existentes do Font Awesome
  document.querySelectorAll('link[href*="font-awesome"], link[href*="fontawesome"]').forEach(el => el.remove());
  
  // 2. Adicionar múltiplas fontes do Font Awesome de diferentes CDNs
  const cdns = [
    {
      href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
      integrity: 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=='
    },
    {
      href: 'https://use.fontawesome.com/releases/v6.4.0/css/all.css'
    },
    {
      href: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css',
      integrity: 'sha256-HtsXJanqjKTc8vVQjO4YMhiqFoXkfBsjBWcX91T1jr8='
    }
  ];
  
  // Adicionar cada CDN com um pequeno delay entre eles
  cdns.forEach((cdn, index) => {
    setTimeout(() => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cdn.href;
      if (cdn.integrity) {
        link.integrity = cdn.integrity;
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
      console.log(`Adicionado CDN Font Awesome #${index + 1}`);
    }, index * 200);
  });
  
  // 3. Adicionar CSS inline com os ícones mais importantes
  const style = document.createElement('style');
  style.textContent = `
    .fas, .far, .fab, .fa, .fa-solid, .fa-regular, .fa-brands {
      font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands", "FontAwesome", sans-serif !important;
      -moz-osx-font-smoothing: grayscale;
      -webkit-font-smoothing: antialiased;
      display: inline-block;
      font-style: normal;
      font-variant: normal;
      text-rendering: auto;
      line-height: 1;
    }
    .fas, .fa-solid { font-weight: 900 !important; }
    .far, .fa-regular { font-weight: 400 !important; }
    .fab, .fa-brands { font-weight: 400 !important; }
    
    /* Fallback para ícones principais */
    i[class*="fa-"]:before { content: "" !important; }
    i[class*="fa-"]:after { 
      content: attr(class);
      font-size: 10px;
      background-color: rgba(0,0,0,0.7);
      color: white;
      padding: 2px 4px;
      border-radius: 3px;
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      display: none;
    }
    i[class*="fa-"]:hover:after {
      display: block;
    }
  `;
  document.head.appendChild(style);
  
  // 4. Carregar Font Awesome via JavaScript como último recurso
  const script = document.createElement('script');
  script.src = 'https://kit.fontawesome.com/a076d05399.js';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
  
  // 5. Recarregar a página após um tempo se necessário
  setTimeout(() => {
    const iconsLoaded = document.querySelectorAll('.fa-home, .fa-cog, .fa-user').length > 0;
    if (!iconsLoaded) {
      console.warn('Não foi possível carregar os ícones mesmo após correções. Considerando recarregar a página.');
      
      // Criar botão para recarregar a página
      const reloadPageBtn = document.createElement('button');
      reloadPageBtn.textContent = 'Recarregar Página';
      reloadPageBtn.style.position = 'fixed';
      reloadPageBtn.style.top = '20px';
      reloadPageBtn.style.left = '50%';
      reloadPageBtn.style.transform = 'translateX(-50%)';
      reloadPageBtn.style.zIndex = '9999';
      reloadPageBtn.style.padding = '10px 20px';
      reloadPageBtn.style.background = 'linear-gradient(135deg, #e53e3e, #c53030)';
      reloadPageBtn.style.color = 'white';
      reloadPageBtn.style.border = 'none';
      reloadPageBtn.style.borderRadius = '4px';
      reloadPageBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
      reloadPageBtn.style.cursor = 'pointer';
      
      reloadPageBtn.addEventListener('click', () => {
        window.location.reload();
      });
      
      document.body.appendChild(reloadPageBtn);
    }
  }, 5000);
}

// Função para adicionar botão de emergência para recarregar ícones
function addEmergencyIconReloadButton() {
  // Remover qualquer botão existente
  const existingButton = document.getElementById('emergency-icon-reload');
  if (existingButton) {
    existingButton.remove();
  }
  
  // Criar botão de recarga
  const reloadButton = document.createElement('button');
  reloadButton.id = 'emergency-icon-reload';
  reloadButton.innerHTML = '<i style="margin-right: 8px;">↻</i> Recarregar Ícones';
  reloadButton.style.position = 'fixed';
  reloadButton.style.bottom = '20px';
  reloadButton.style.right = '20px';
  reloadButton.style.zIndex = '9999';
  reloadButton.style.background = 'linear-gradient(135deg, #3182ce, #1a365d)';
  reloadButton.style.color = 'white';
  reloadButton.style.border = 'none';
  reloadButton.style.borderRadius = '4px';
  reloadButton.style.padding = '10px 15px';
  reloadButton.style.cursor = 'pointer';
  reloadButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  reloadButton.style.fontWeight = 'bold';
  
  reloadButton.addEventListener('click', () => {
    forceFontAwesomeReload();
    showToast('info', 'Recarregando', 'Tentando recarregar os ícones novamente...');
  });
  
  document.body.appendChild(reloadButton);
  
  // Animar o botão para chamar atenção
  let animationFrame = 0;
  function animateButton() {
    animationFrame = (animationFrame + 1) % 100;
    const scale = 1 + 0.05 * Math.sin(animationFrame * Math.PI / 50);
    reloadButton.style.transform = `scale(${scale})`;
    requestAnimationFrame(animateButton);
  }
  
  animateButton();
}

// Função para forçar o recarregamento do Font Awesome com cache-busting
function forceFontAwesomeReload() {
  console.log('Forçando recarregamento do Font Awesome...');
  
  // Limpar qualquer cache especialmente em navegadores modernos
  try {
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('font') || cacheName.includes('style')) {
            caches.delete(cacheName);
          }
        });
      });
    }
  } catch (e) {
    console.warn('Não foi possível limpar o cache:', e);
  }
  
  // Aplicar a solução completa
  loadFontAwesomeEmergencyFix();
  
  // Forçar atualização dos ícones existentes
  setTimeout(() => {
    document.querySelectorAll('[class*="fa-"]').forEach(icon => {
      // Criar uma cópia temporária das classes
      const classes = Array.from(icon.classList);
      
      // Remover e adicionar classes para forçar uma atualização
      icon.classList.remove(...classes);
      
      // Pequeno delay para garantir que o DOM seja atualizado
      setTimeout(() => {
        icon.classList.add(...classes);
      }, 10);
    });
    
    showToast('success', 'Ícones recarregados', 'Os ícones foram recarregados. A página está agora atualizada.');
  }, 1000);
  
  // Tentar corrigir ícones faltando com substituições alternativas
  document.querySelectorAll('[class*="fa-"]').forEach(icon => {
    // Verificar se o ícone está sendo exibido corretamente
    const style = window.getComputedStyle(icon, '::before');
    if (style.content === 'none' || style.content === '' || style.content === 'normal') {
      // Adicionar uma classe para tentar corrigir
      icon.classList.add('icon-fixed');
      
      // Adicionar data-icon com o nome do ícone para referência
      const iconName = Array.from(icon.classList)
                           .find(cls => cls.startsWith('fa-'))
                           ?.replace('fa-', '');
      if (iconName) {
        icon.setAttribute('data-icon', iconName);
      }
    }
  });
}

// Adicionar essa função ao objeto window para que possa ser chamada pelo console se necessário
window.reloadIcons = forceFontAwesomeReload;

/**
 * Inicializa as funcionalidades do painel quando a página carrega
 */
document.addEventListener('DOMContentLoaded', function() {
  // Inicializa funcionalidades
  inicializarPainel();
  inicializarFuncionalidadesPerfil();
  inicializarFormularios();
  inicializarEngrenagem();
  configurarListenersPerfil();
  setCurrentDate();
  setupCardActions();
  
  // Verifica se os ícones do Font Awesome estão carregados
  checkFontAwesomeIcons();
  
  // Inicia a rotação de vídeos de fundo
  startBackgroundVideoRotation();
  
  // Inicializa o gráfico de temperatura
  initTemperatureChart();
  
  // Configura o interruptor de unidades de temperatura
  setupTemperatureToggle();
  
  // Inicializa o sistema de temas
  checkUserTheme();
  
  // Verifica se o usuário acabou de fazer login ou se registrou
  const loginRecente = sessionStorage.getItem('loginRecente');
  const cadastroRecente = sessionStorage.getItem('cadastroRecente');
  const urlParams = new URLSearchParams(window.location.search);
  const novoUsuario = urlParams.get('novoUsuario');
  
  // Sempre chamamos mostrarMensagemBoasVindas que já tem a lógica para determinar qual mensagem mostrar
  mostrarMensagemBoasVindas();
  
  // Inicia busca de dados do clima
  const cidade = document.querySelector('.weather-location span').textContent;
  if (cidade) {
    fetchWeatherData(cidade);
  }
});

/**
 * Mostra mensagem de boas-vindas com base na origem do usuário
 */
function mostrarMensagemBoasVindas() {
  // Evitar mostrar mensagens duplicadas
  if (mensagemBoasVindasMostrada) {
    console.log('Mensagem de boas-vindas já foi mostrada nesta sessão.');
    return;
  }
  
  // Adicionando logs para diagnóstico
  console.log('---- Diagnóstico de Boas-vindas ----');
  console.log('URL:', window.location.href);
  console.log('Referrer:', document.referrer);
  
  // Verificar parâmetro de URL para novo usuário
  const urlParams = new URLSearchParams(window.location.search);
  const isNovoUsuario = urlParams.get('novoUsuario') === 'true';
  console.log('Parâmetro novoUsuario na URL:', isNovoUsuario);
  
  // Verificar se tem flag no sessionStorage (usado quando redirecionado do login)
  const isLoginRecente = sessionStorage.getItem('loginRecente') === 'true';
  console.log('Flag loginRecente no sessionStorage:', isLoginRecente);
  
  // Verificar se o usuário veio diretamente do cadastro
  const isCadastroRecente = sessionStorage.getItem('cadastroRecente') === 'true';
  console.log('Flag cadastroRecente no sessionStorage:', isCadastroRecente);
  
  // FORÇAR exibição da mensagem de novo usuário se veio do cadastro, independente dos outros parâmetros
  // Esta é uma abordagem mais agressiva para garantir que a mensagem seja mostrada
  if (document.referrer && (document.referrer.includes('/cadastro') || document.referrer.includes('/registro') || document.referrer.includes('/signup'))) {
    console.log('Detectado acesso vindo diretamente da página de cadastro via referrer!');
    sessionStorage.setItem('cadastroRecente', 'true');
  }
  
  // Verificar novamente após possível atualização acima
  const isCadastroRecenteAtualizado = sessionStorage.getItem('cadastroRecente') === 'true';
  
  // NOVA VERIFICAÇÃO: Verificar se é a primeira visita ao site (não existe registro no localStorage)
  const isPrimeiraVisita = !localStorage.getItem('usuarioExistente');
  console.log('Primeira visita (sem registro no localStorage):', isPrimeiraVisita);
  
  // Limpar as flags após verificação
  if (isLoginRecente) {
    sessionStorage.removeItem('loginRecente');
  }
  if (isCadastroRecente || isCadastroRecenteAtualizado) {
    sessionStorage.removeItem('cadastroRecente');
  }
  
  // Obter nome do usuário
  const nomeUsuario = document.querySelector('.welcome-name')?.textContent.trim() || 'Viajante';
  console.log('Nome do usuário:', nomeUsuario);
  
  // Determinar qual mensagem mostrar e configurar duração
  let titulo, mensagem, tipo;
  // Duração fixa de 10 segundos (10000ms) conforme solicitado
  const duracao = 10000;
  
  // Verificação mais abrangente para novos usuários
  // Adicionada verificação de primeira visita
  if (isNovoUsuario || isCadastroRecente || isCadastroRecenteAtualizado || isPrimeiraVisita) {
    console.log('Exibindo mensagem de boas-vindas para NOVO usuário');
    // Mensagem para novos usuários que acabaram de se cadastrar
    titulo = `Bem-vindo(a) ao SunnyTrips, ${nomeUsuario}!`;
    mensagem = 'Estamos muito felizes em ter você conosco! O SunnyTrips vai ajudar você a planejar suas viagens dos sonhos. Comece explorando o dashboard e aproveite todas as funcionalidades!';
    tipo = 'success';
    
    // Armazenar que o usuário agora é considerado "existente"
    localStorage.setItem('usuarioExistente', 'true');
    console.log('Definindo usuário como existente no localStorage');
    
    // Remover o parâmetro da URL sem recarregar a página
    window.history.replaceState({}, document.title, window.location.pathname);
  } 
  else if (isLoginRecente) {
    console.log('Exibindo mensagem de boas-vindas para usuário que fez LOGIN');
    // Mensagem para usuários retornando via login
    titulo = `Olá novamente, ${nomeUsuario}!`;
    mensagem = 'Que bom ter você de volta! Estamos aqui para ajudar a planejar sua próxima aventura.';
    tipo = 'info';
  }
  else {
    console.log('Nenhuma condição atendida para mostrar mensagem de boas-vindas');
    
    // ÚLTIMA TENTATIVA: se todas as verificações falharam, mas o usuário não tem histórico
    // no localStorage, assumimos que é um novo usuário e mostramos a mensagem de boas-vindas
    if (!localStorage.getItem('usuarioJaViuMensagem')) {
      console.log('Última tentativa: exibindo mensagem de boas-vindas pela primeira vez');
      titulo = `Bem-vindo(a) ao SunnyTrips, ${nomeUsuario}!`;
      mensagem = 'Estamos muito felizes em ter você conosco! O SunnyTrips vai ajudar você a planejar suas viagens dos sonhos. Comece explorando o dashboard e aproveite todas as funcionalidades!';
      tipo = 'success';
      
      // Armazenar que o usuário já viu a mensagem
      localStorage.setItem('usuarioJaViuMensagem', 'true');
      localStorage.setItem('usuarioExistente', 'true');
    } else {
      // Se não for nenhum dos casos acima, não exibir mensagem
      return;
    }
  }
  
  // Marcar que a mensagem já foi mostrada nesta sessão
  mensagemBoasVindasMostrada = true;
  
  // Exibir notificação após um pequeno delay para garantir que a UI esteja pronta
  setTimeout(() => {
    console.log(`Mostrando mensagem de boas-vindas com duração de ${duracao}ms: "${titulo}"`);
    const toastElement = showToast(tipo, titulo, mensagem, duracao);
    
    // Para novos usuários, também mostrar um tooltip de ajuda após um intervalo
    if (isNovoUsuario || isCadastroRecente || isCadastroRecenteAtualizado || isPrimeiraVisita || 
        !localStorage.getItem('usuarioJaViuDica')) {
      localStorage.setItem('usuarioJaViuDica', 'true');
      setTimeout(() => {
        mostrarDicaNovoUsuario();
      }, duracao + 500); // Mostrar a dica logo após o toast desaparecer
    }
  }, 1500);
  
  console.log('---- Fim do diagnóstico ----');
}

/**
 * Mostra uma dica contextual para novos usuários
 */
function mostrarDicaNovoUsuario() {
  // Criar elemento de dica flutuante
  const dicaElement = document.createElement('div');
  dicaElement.className = 'dica-novo-usuario';
  dicaElement.innerHTML = `
    <div class="dica-conteudo">
      <div class="dica-icone">
        <i class="fas fa-lightbulb fa-bounce"></i>
      </div>
      <div class="dica-texto">
        <h4>Dicas para iniciantes</h4>
        <div class="dica-passos">
          <div class="dica-passo">
            <span class="passo-numero">1</span>
            <p>Navegue pelo interface usando a barra lateral com ícones</p>
          </div>
          <div class="dica-passo">
            <span class="passo-numero">2</span>
            <p>Personalize seu perfil, clicando em <strong>"Editar dados"</strong> no menu lateral</p>
          </div>
          <div class="dica-passo">
            <span class="passo-numero">3</span>
            <p>Planeje suas viagens e passeios acessando os ícones <strong>"Viagem"</strong> e <strong>"Passeio"</strong> no menu lateral</p>
          </div>
        </div>
        <div class="dica-footer">
          <span class="dica-badge">Novo Usuário</span>
        </div>
      </div>
      <button class="dica-fechar">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  // Estilos para a dica
  dicaElement.style.position = 'fixed';
  dicaElement.style.bottom = '30px';
  dicaElement.style.right = '30px';
  dicaElement.style.maxWidth = '380px';
  dicaElement.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  dicaElement.style.backdropFilter = 'blur(12px)';
  dicaElement.style.borderRadius = '12px';
  dicaElement.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(99, 179, 237, 0.3)';
  dicaElement.style.border = '1px solid rgba(99, 179, 237, 0.3)';
  dicaElement.style.color = 'white';
  dicaElement.style.padding = '20px';
  dicaElement.style.zIndex = '1000';
  dicaElement.style.transform = 'translateY(100px)';
  dicaElement.style.opacity = '0';
  dicaElement.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  
  // Estilos para o conteúdo da dica
  const estilosDica = `
    .dica-conteudo {
      display: flex;
      gap: 15px;
      align-items: flex-start;
    }
    .dica-icone {
      font-size: 28px;
      color: #FFB700;
      margin-top: 3px;
    }
    .dica-texto {
      flex: 1;
    }
    .dica-texto h4 {
      margin: 0 0 12px 0;
      font-size: 18px;
      color: #FFB700;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 8px;
    }
    .dica-passos {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 15px;
    }
    .dica-passo {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .passo-numero {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      background: linear-gradient(135deg, #63B3ED, #3182CE);
      color: white;
      font-weight: bold;
      font-size: 12px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .dica-passo p {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
    }
    .dica-passo strong {
      color: #63B3ED;
    }
    .dica-footer {
      display: flex;
      justify-content: flex-end;
    }
    .dica-badge {
      display: inline-block;
      background: linear-gradient(135deg, #F6AD55, #ED8936);
      color: white;
      font-size: 11px;
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dica-fechar {
      background: none;
      border: none;
      color: #aaa;
      cursor: pointer;
      font-size: 16px;
      padding: 0;
      margin-left: 5px;
      transition: color 0.2s;
    }
    .dica-fechar:hover {
      color: white;
    }
    @keyframes fa-bounce {
      0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
      40% {transform: translateY(-8px);}
      60% {transform: translateY(-4px);}
    }
    .fa-bounce {
      animation: fa-bounce 2s ease infinite;
    }
  `;
  
  // Adicionar estilos ao documento
  const styleElement = document.createElement('style');
  styleElement.textContent = estilosDica;
  document.head.appendChild(styleElement);
  
  // Adicionar ao documento
  document.body.appendChild(dicaElement);
  
  // Animar entrada
  setTimeout(() => {
    dicaElement.style.transform = 'translateY(0)';
    dicaElement.style.opacity = '1';
  }, 100);
  
  // Adicionar evento para fechar a dica
  const botaoFechar = dicaElement.querySelector('.dica-fechar');
  botaoFechar.addEventListener('click', () => {
    dicaElement.style.transform = 'translateY(100px)';
    dicaElement.style.opacity = '0';
    
    // Remover do DOM após a animação
    setTimeout(() => {
      if (document.body.contains(dicaElement)) {
        document.body.removeChild(dicaElement);
      }
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    }, 500);
  });
  
  // Auto-fechar após 15 segundos
  setTimeout(() => {
    if (document.body.contains(dicaElement)) {
      dicaElement.style.transform = 'translateY(100px)';
      dicaElement.style.opacity = '0';
      
      setTimeout(() => {
        if (document.body.contains(dicaElement)) {
          document.body.removeChild(dicaElement);
        }
        if (document.head.contains(styleElement)) {
          document.head.removeChild(styleElement);
        }
      }, 500);
    }
  }, 7500); // Tempo reduzido pela metade (de 15000ms para 7500ms)
}

// SOLUÇÃO EXTREMA PARA ÍCONES - SUBSTITUIÇÃO POR SVG INLINE
// Este script substituirá os ícones Font Awesome por SVG inline se detectar que o Font Awesome
// não está carregando corretamente após múltiplas tentativas.

(function() {
  // Mapa de ícones SVG para substituir ícones Font Awesome com problemas
  // Os SVGs são versões simplificadas dos originais do Font Awesome
  const iconSvgMap = {
    'home': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"/></svg>',
    'user': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/></svg>',
    'cog': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"/></svg>',
    'comment': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7 1.3 3 4.1 4.8 7.3 4.8 66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4 0 256-93.1 256-208S397.4 32 256 32z"/></svg>',
    'sign-out-alt': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"/></svg>',
    'bell': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z"/></svg>',
    'search': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/></svg>',
    'sun': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z"/></svg>',
    'sync-alt': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M370.72 133.28C339.458 104.008 298.888 87.962 255.848 88c-77.458.068-144.328 53.178-162.791 126.85-1.344 5.363-6.122 9.15-11.651 9.15H24.103c-7.498 0-13.194-6.807-11.807-14.176C33.933 94.924 134.813 8 256 8c66.448 0 126.791 26.136 171.315 68.685L463.03 40.97C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.749zM32 296h134.059c21.382 0 32.09 25.851 16.971 40.971l-41.75 41.75c31.262 29.273 71.835 45.319 114.876 45.28 77.418-.07 144.315-53.144 162.787-126.849 1.344-5.363 6.122-9.15 11.651-9.15h57.304c7.498 0 13.194 6.807 11.807 14.176C478.067 417.076 377.187 504 256 504c-66.448 0-126.791-26.136-171.315-68.685L48.97 471.03C33.851 486.149 8 475.441 8 454.059V320c0-13.255 10.745-24 24-24z"/></svg>',
    'ellipsis-v': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512"><path d="M96 184c39.8 0 72 32.2 72 72s-32.2 72-72 72-72-32.2-72-72 32.2-72 72-72zM24 80c0 39.8 32.2 72 72 72s72-32.2 72-72S135.8 8 96 8 24 40.2 24 80zm0 352c0 39.8 32.2 72 72 72s72-32.2 72-72-32.2-72-72-72-72 32.2-72 72z"/></svg>',
    'tint': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path d="M205.22 22.09c-7.94-28.78-49.44-30.12-58.44 0C116.3 179.11 0 222.45 0 333.91 0 432.35 78.72 512 176 512s176-79.65 176-178.09c0-111.44-116.49-154.9-146.78-311.82zM176 448c-61.75 0-112-50.25-112-112 0-8.84 7.16-16 16-16s16 7.16 16 16c0 44.11 35.89 80 80 80 8.84 0 16 7.16 16 16s-7.16 16-16 16z"/></svg>',
    'wind': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M156.7 256H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h142.2c15.9 0 30.8 10.9 33.4 26.6 3.3 20-12.1 37.4-31.6 37.4-14.1 0-26.1-9.2-30.4-21.9-2.1-6.3-8.6-10.1-15.2-10.1H81.6c-9.8 0-17.7 8.8-15.9 18.4 8.6 44.1 47.6 77.6 94.2 77.6 57.1 0 102.7-50.1 95.2-108.6C249 291 205.4 256 156.7 256zM16 224h336c59.7 0 106.8-54.8 93.8-116.7-7.6-36.2-36.9-65.5-73.1-73.1-55.4-11.6-105.1 24.9-114.9 75.5-1.9 9.6 6.1 18.3 15.8 18.3h32.8c6.7 0 13.1-3.8 15.2-10.1C325.9 105 337.9 96 352 96c19.4 0 34.9 17.4 31.6 37.4-2.6 15.7-17.4 26.6-33.4 26.6H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16zm384 32H243.7c19.3 16.6 33.2 38.8 39.8 64H400c26.5 0 48 21.5 48 48s-21.5 48-48 48c-17.9 0-33.3-9.9-41.6-24.4-2.9-5-8.7-7.6-14.5-7.6h-33.8c-10.9 0-19 10.8-15.3 21.1 17.8 50.6 70.5 84.8 129.4 72.3 41.2-8.7 75.1-41.6 84.7-82.7C526 321.5 470.5 256 400 256z"/></svg>'
  };

  // Função para substituir ícones Font Awesome por SVG inline
  function replaceFontAwesomeWithSvg() {
    console.log('[EMERGENCY] Replacing Font Awesome icons with inline SVG...');
    
    // Encontrar todos os elementos com classes Font Awesome
    document.querySelectorAll('i[class*="fa-"]').forEach(icon => {
      // Extrair o nome do ícone da classe
      const iconClasses = Array.from(icon.classList);
      let iconName = null;
      
      for (const cls of iconClasses) {
        if (cls.startsWith('fa-') && cls !== 'fa-solid' && cls !== 'fa-regular' && cls !== 'fa-brands') {
          iconName = cls.replace('fa-', '');
          break;
        }
      }
      
      // Se encontrarmos o ícone no nosso mapa, substituir por SVG
      if (iconName && iconSvgMap[iconName]) {
        // Preservar classes para estilização
        const classNames = icon.className;
        
        // Criar um wrapper para o SVG que preserva o estilo original
        const wrapper = document.createElement('span');
        wrapper.className = 'svg-icon-wrapper ' + classNames;
        wrapper.style.display = 'inline-flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.height = '1em';
        wrapper.style.width = '1em';
        wrapper.style.verticalAlign = 'middle';
        wrapper.style.color = 'inherit';
        
        // Inserir o SVG dentro do wrapper
        wrapper.innerHTML = iconSvgMap[iconName];
        
        // Garantir que o SVG herda as cores do parent
        const svg = wrapper.querySelector('svg');
        if (svg) {
          svg.style.fill = 'currentColor';
          svg.style.width = '100%';
          svg.style.height = '100%';
        }
        
        // Substituir o ícone original pelo wrapper com SVG
        if (icon.parentNode) {
          icon.parentNode.replaceChild(wrapper, icon);
        }
      }
    });
    
    // Adicionar estilos globais para os ícones SVG
    const style = document.createElement('style');
    style.textContent = `
      .svg-icon-wrapper {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 1em !important;
        width: 1em !important;
        vertical-align: middle !important;
        color: inherit !important;
      }
      .svg-icon-wrapper svg {
        fill: currentColor !important;
        width: 100% !important;
        height: 100% !important;
      }
      .svg-icon-wrapper.fa-spin svg {
        animation: svg-spin 2s linear infinite !important;
      }
      @keyframes svg-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    console.log('[EMERGENCY] Icon replacement with SVG completed.');
  }

  // Função para verificar se os ícones Font Awesome estão carregados corretamente
  function checkIcons() {
    const testIcon = document.querySelector('.fa-home');
    if (!testIcon) return false;
    
    try {
      const style = window.getComputedStyle(testIcon, '::before');
      return style && style.content && style.content !== 'none' && style.content !== '';
    } catch (e) {
      return false;
    }
  }

  // Verificar ícones após carregamento completo e substituir se necessário
  window.addEventListener('load', function() {
    // Dar tempo para o Font Awesome carregar normalmente
    setTimeout(function() {
      if (!checkIcons()) {
        console.warn('[EMERGENCY] Font Awesome icons not loaded properly. Using SVG fallback...');
        replaceFontAwesomeWithSvg();
      }
    }, 2000);
  });
  
  // Expor a função para chamada manual se necessário
  window.replaceIconsWithSvg = replaceFontAwesomeWithSvg;
})();

/**
 * Abre o modal de confirmação de logout
 */
function confirmarLogout() {
  const modal = document.getElementById('modalLogoutConfirm');
  modal.style.display = 'flex';
  
  // Adiciona efeito de entrada suave
  setTimeout(() => {
    modal.classList.add('active');
    
    // Adiciona listener para fechar modal com ESC
    document.addEventListener('keydown', fecharModalComEsc);
  }, 10);
}

/**
 * Fecha o modal de confirmação de logout
 */
function closeModal(tipo) {
  const modal = document.getElementById(`modal${tipo}`);
  
  // Remove classe active para iniciar animação de saída
  modal.classList.remove('active');
  
  // Remove listener de ESC
  document.removeEventListener('keydown', fecharModalComEsc);
  
  // Aguarda a animação terminar
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

/**
 * Função para fechar modal com tecla ESC
 */
function fecharModalComEsc(e) {
  if (e.key === 'Escape') {
    const modaisAbertos = document.querySelectorAll('.modal[style*="display: flex"]');
    modaisAbertos.forEach(modal => {
      const modalId = modal.id.replace('modal', '');
      closeModal(modalId);
    });
  }
}

/**
 * Realiza o logout do usuário e redireciona para a página de login
 */
function realizarLogout() {
  // Adiciona efeito de saída
  document.body.classList.add('fade-out');
  
  // Aguarda a animação e redireciona
  setTimeout(() => {
    // Redireciona para a página de login após deslogar
    window.location.href = '/login';
  }, 1000);
}

/**
 * Sistema de temas (claro/escuro)
 */

// Verifica o tema atual do usuário ao carregar a página
function checkUserTheme() {
  // Verifica se há uma preferência salva no localStorage
  const savedTheme = localStorage.getItem('theme');
  
  // Verifica se o sistema operacional do usuário prefere modo escuro
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Aplica o tema salvo ou o tema preferido pelo sistema
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (prefersDarkMode) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }
  
  // Atualiza a interface do botão de tema
  updateThemeToggle();
}

// Aplica o tema ao documento
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// Alterna entre os temas claro e escuro
function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Aplica o novo tema
  applyTheme(newTheme);
  
  // Atualiza o botão de troca de tema
  updateThemeToggle();
  
  // Exibe notificação ao usuário
  showToast(
    'info', 
    newTheme === 'dark' ? 'Modo escuro ativado' : 'Modo claro ativado', 
    'A interface foi atualizada com sucesso!', 
    3000
  );
}

// Atualiza o ícone e texto do botão de troca de tema
function updateThemeToggle() {
  const currentTheme = localStorage.getItem('theme') || 'dark';
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  
  if (currentTheme === 'dark') {
    themeIcon.className = 'fas fa-moon';
    themeText.textContent = 'Modo claro';
  } else {
    themeIcon.className = 'fas fa-sun';
    themeText.textContent = 'Modo escuro';
  }
}

// Inicializa o sistema de temas ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  checkUserTheme();
});

/**
 * Verificação imediata para exibição da mensagem de boas-vindas
 * Executamos isto imediatamente para garantir que seja executado o mais cedo possível
 */
(function() {
  // Função para carregar a mensagem de boas-vindas após o DOM estar pronto
  function iniciarBoasVindas() {
    console.log('🚀 Inicializando verificação de boas-vindas imediata');
    
    // Verifica se está em uma página de Dashboard
    if (document.querySelector('.dashboard-container')) {
      try {
        // Verifica novamente se devemos mostrar mensagem de boas-vindas
        // Parâmetro URL
        const urlParams = new URLSearchParams(window.location.search);
        const novoUsuario = urlParams.get('novoUsuario') === 'true';
        
        // Flags no sessionStorage
        const isCadastroRecente = sessionStorage.getItem('cadastroRecente') === 'true';
        const isLoginRecente = sessionStorage.getItem('loginRecente') === 'true';
        
        console.log('Verificação rápida de flags para boas-vindas:', {
          novoUsuario,
          isCadastroRecente,
          isLoginRecente,
          referrer: document.referrer
        });
        
        // Se for um novo usuário vindo do cadastro, forçamos a flag
        if (document.referrer && (document.referrer.includes('/cadastro') || document.referrer.includes('/registro') || document.referrer.includes('/signup'))) {
          console.log('Forçando flag de cadastro recente!');
          sessionStorage.setItem('cadastroRecente', 'true');
        }
        
        // Se for um novo usuário e ainda não tem registro de existente no localStorage
        if (!localStorage.getItem('usuarioExistente')) {
          console.log('Usuário não tem registro de existente no localStorage, tratando como novo usuário');
          // Definimos como usuário de cadastro recente
          sessionStorage.setItem('cadastroRecente', 'true');
        }
      } catch (e) {
        console.error('Erro na verificação imediata de boas-vindas:', e);
      }
    }
  }
  
  // Executar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarBoasVindas);
  } else {
    iniciarBoasVindas();
  }
})();

/**
 * Agenda o recarregamento da página após um determinado número de segundos
 * @param {number} segundos - Número de segundos para aguardar antes de recarregar
 */
function agendarRecarregamentoPagina(segundos = 3) {
    try {
        // Verificar se a opção de recarregamento automático está habilitada
        const deveRecarregar = localStorage.getItem('autoReloadAfterUpdate') !== 'false';
        
        if (deveRecarregar) {
            console.log(`Agendando recarregamento da página em ${segundos} segundos...`);
            
            // Mostrar contador regressivo
            let contagem = segundos;
            const intervalId = setInterval(() => {
                contagem--;
                console.log(`Recarregando em ${contagem}...`);
                
                if (contagem <= 0) {
                    clearInterval(intervalId);
                    console.log('Recarregando página para garantir atualização completa');
                    window.location.reload();
                }
            }, 1000);
            
            // Armazenar o ID do intervalo para permitir cancelamento
            window.reloadCountdownId = intervalId;
            
            // Adicionar um toast informando sobre o recarregamento
            showToast('info', 'Atualizando', `A página será atualizada em ${segundos} segundos...`);
        } else {
            console.log('Recarregamento automático desabilitado nas configurações');
        }
    } catch (error) {
        console.error('Erro ao agendar recarregamento:', error);
    }
}

/**
 * Carrega os dados do clima utilizando a cidade do usuário armazenada na sessão
 */
function carregarDadosClimaUsuario() {
    try {
        // Procurar elementos que contenham a cidade do usuário
        const cidadeElements = document.querySelectorAll('.location-item:last-child .location-value');
        if (cidadeElements && cidadeElements.length > 0) {
            // Obter a cidade do primeiro elemento encontrado
            const cidade = cidadeElements[0].textContent.trim();
            console.log('Carregando dados do clima para cidade do usuário:', cidade);
            
            if (cidade) {
                // Atualizar o atributo data-city no card do clima
                const weatherCard = document.querySelector('.profile-weather-card');
                if (weatherCard) {
                    weatherCard.setAttribute('data-city', cidade);
                }
                
                // Buscar dados do clima para a cidade do usuário
                fetchWeatherData(cidade).catch(error => {
                    console.warn('Não foi possível carregar dados do clima inicialmente:', error);
                    showToast('warning', 'Clima', 'Não foi possível carregar dados do clima. Tente novamente mais tarde.');
                });
            } else {
                console.warn('Cidade do usuário não encontrada ou vazia');
            }
        } else {
            console.warn('Não foi possível encontrar elemento com a cidade do usuário');
        }
    } catch (error) {
        console.error('Erro ao carregar dados do clima do usuário:', error);
    }
}

/**
 * Gerencia a navegação entre diferentes seções da dashboard
 * @param {string} sectionId - ID da seção a ser exibida
 */
function navigateToSection(sectionId) {
  try {
    console.log(`Navegando para a seção: ${sectionId}`);
    
    // Verificar se é uma seção válida (apenas "início" e "planejamentos")
    const validSections = ['início', 'planejamentos'];
    if (!validSections.includes(sectionId)) {
      console.warn(`Tentativa de navegar para seção não permitida: ${sectionId}`);
      return;
    }
    
    // Remover classe active apenas dos itens que são seções navegáveis
    const menuItems = document.querySelectorAll('.nav-item[data-section]');
    menuItems.forEach(item => item.classList.remove('active'));
    
    // Ocultar todas as seções de conteúdo
    const contentSections = document.querySelectorAll('.dashboard-section');
    contentSections.forEach(section => {
      section.style.display = 'none';
    });
    
    // Ativar o item de menu correspondente à seção
    const activeMenuItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    if (activeMenuItem) {
      activeMenuItem.classList.add('active');
      console.log(`Item de menu "${sectionId}" ativado`);
    } else {
      console.warn(`Item de menu para seção "${sectionId}" não encontrado`);
    }
    
    // Verificar se é a seção "Início" para garantir que o conteúdo original seja restaurado
    if (sectionId === 'início') {
      // Obter a seção "Início"
      const homeSection = document.getElementById('section-início');
      
      // Se a seção existir e temos o conteúdo original salvo
      if (homeSection && window.originalHomeContent) {
        // Verificar se o conteúdo atual está vazio ou foi modificado
        if (homeSection.children.length === 0 || homeSection.innerHTML.trim() !== window.originalHomeContent.trim()) {
          console.log('Restaurando conteúdo original da seção Início');
          homeSection.innerHTML = window.originalHomeContent;
        }
      }
      
      // Exibir a seção
      if (homeSection) {
        homeSection.style.display = 'block';
        console.log('Seção Início exibida com conteúdo restaurado');
        
        // Reinicializar elementos dinâmicos da seção Início
        reinitializeHomeSection();
      }
    } else {
      // Para outras seções, exibir a seção correspondente
      const activeSection = document.getElementById(`section-${sectionId}`);
      if (activeSection) {
        activeSection.style.display = 'block';
        console.log(`Seção "${sectionId}" exibida`);
      } else {
        console.warn(`Seção com ID "section-${sectionId}" não encontrada`);
        
        // Se a seção não existir e for "planejamentos", criar uma seção vazia
        if (sectionId === 'planejamentos') {
          createEmptyPlanejamentosSection();
        }
      }
    }
  } catch (error) {
    console.error('Erro ao navegar entre seções:', error);
  }
}

/**
 * Cria uma seção vazia para planejamentos se ela não existir
 */
function createEmptyPlanejamentosSection() {
  console.log('Criando seção vazia para Planejamentos');
  
  // Verificar se a seção já existe
  if (document.getElementById('section-planejamentos')) {
    console.log('Seção de Planejamentos já existe, apenas exibindo');
    document.getElementById('section-planejamentos').style.display = 'block';
    return;
  }
  
  // Obter o container principal
  const contentWrapper = document.querySelector('.dashboard-content-wrapper');
  if (!contentWrapper) {
    console.error('Container principal não encontrado');
    return;
  }
  
  // Criar a nova seção vazia
  const newSection = document.createElement('div');
  newSection.id = 'section-planejamentos';
  newSection.className = 'dashboard-section';
  
  // Adicionar estrutura básica para a seção de planejamentos
  newSection.innerHTML = `
    <div class="section-heading">
      <h2 class="gradient-title">Planejamentos</h2>
      <p class="date-display">Hoje, <span id="planejamentos-date">${getCurrentFormattedDate()}</span><span id="planejamentos-time" class="time-display">00:00:00</span></p>
      <div class="section-description">
        <p>Esta é a seção de Planejamentos. Aqui você poderá gerenciar seus próximos destinos.</p>
      </div>
    </div>
    <div class="empty-state">
      <div class="empty-state-icon">
        <i class="fas fa-calendar-alt"></i>
      </div>
      <h3>Área de Planejamentos</h3>
      <p>Conteúdo a ser implementado em breve.</p>
    </div>
  `;
  
  // Adicionar a nova seção ao container
  contentWrapper.appendChild(newSection);
  
  // Inicializar o relógio desta seção
  initClockForSection('planejamentos');
  
  console.log('Seção vazia de Planejamentos criada e adicionada ao DOM');
}

/**
 * Retorna a data atual formatada em português
 */
function getCurrentFormattedDate() {
  const now = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return now.toLocaleDateString('pt-BR', options);
}

/**
 * Inicializa um relógio atualizado para a seção especificada
 */
function initClockForSection(sectionId) {
  const timeElement = document.getElementById(`${sectionId}-time`);
  if (!timeElement) return;
  
  function updateSectionClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
  }
  
  // Atualizar imediatamente e a cada segundo
  updateSectionClock();
  setInterval(updateSectionClock, 1000);
}

// Configurar os eventos de navegação quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Adicionar ouvintes de eventos aos itens do menu
  setupNavigationListeners();
  
  // Preparar a estrutura da dashboard para suportar seções
  prepareContentSections();
});

/**
 * Configura os ouvintes de eventos para navegação entre seções
 */
function setupNavigationListeners() {
  try {
    console.log('Configurando ouvintes de eventos para navegação');
    
    // Selecionar todos os itens de navegação
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    
    // Adicionar atributo data-section e ouvinte de eventos a cada item
    navItems.forEach(item => {
      // Verificar se o item já tem um evento onclick definido no HTML
      // Se tiver, não adicionar novos eventos para evitar duplicidade
      const hasInlineOnclick = item.hasAttribute('onclick');
      if (hasInlineOnclick) {
        console.log(`Item tem onclick inline, preservando comportamento original`);
        return; // Pula o resto do processamento para este item
      }
      
      const navText = item.querySelector('.nav-text');
      if (navText) {
        const sectionName = navText.textContent.trim().toLowerCase();
        
        // Lista das seções que realmente mudam de conteúdo
        const actualSections = ['início', 'planejamentos'];
        
        // Verificar se este item faz parte das seções reais
        if (actualSections.includes(sectionName)) {
          // Definir o atributo data-section
          item.setAttribute('data-section', sectionName);
          
          // Adicionar evento de clique para navegação entre seções
          item.addEventListener('click', function() {
            navigateToSection(sectionName);
          });
          
          console.log(`Ouvinte de evento de navegação configurado para seção "${sectionName}"`);
        } else {
          // Para outros itens de menu, não configurar como seção
          console.log(`Item "${sectionName}" não é uma seção navegável, mantendo comportamento original`);
          
          // Remover qualquer evento de clique de navegação que possa ter sido adicionado
          item.removeAttribute('data-section');
          
          // Preservar comportamentos originais para botões específicos
          preservarComportamentoOriginal(item, sectionName);
        }
      }
    });
  } catch (error) {
    console.error('Erro ao configurar ouvintes de navegação:', error);
  }
}

/**
 * Preserva o comportamento original dos itens de menu que não são seções principais
 * @param {HTMLElement} menuItem - O item de menu
 * @param {string} name - Nome do item de menu
 */
function preservarComportamentoOriginal(menuItem, name) {
  try {
    // Comportamentos específicos baseados no nome do item
    switch(name) {
      case 'admin':
        // Comportamento para o item Admin
        menuItem.addEventListener('click', function() {
          console.log('Clique em Admin - comportamento original preservado');
          // Comportamento silencioso - sem mensagem toast
        });
        break;
        
      case 'viagem':
        // Comportamento para o item Viagem
        menuItem.addEventListener('click', function() {
          console.log('Clique em Viagem - comportamento original preservado');
          // Comportamento silencioso - sem mensagem toast
        });
        break;
        
      case 'passeio':
        // Comportamento para o item Passeio
        menuItem.addEventListener('click', function() {
          console.log('Clique em Passeio - comportamento original preservado');
          // Comportamento silencioso - sem mensagem toast
        });
        break;
        
      case 'editar dados':
        // Evitar adicionar um novo evento para "Editar dados" pois ele já tem um
        console.log('Item "Editar dados" já tem seu próprio evento');
        break;
        
      case 'sair':
        // Evitar adicionar um novo evento para "Sair" pois ele já tem um
        console.log('Item "Sair" já tem seu próprio evento');
        break;
        
      default:
        // Comportamento padrão para outros itens - sem mensagem toast
        menuItem.addEventListener('click', function() {
          console.log(`Clique em ${name} - comportamento silencioso`);
          // Nenhuma mensagem toast exibida
        });
    }
  } catch (error) {
    console.error(`Erro ao preservar comportamento original para "${name}":`, error);
  }
}

/**
 * Prepara a estrutura da dashboard para suportar múltiplas seções
 */
function prepareContentSections() {
  try {
    console.log('Preparando estrutura da dashboard para múltiplas seções');
    
    // Obter o container principal
    const contentWrapper = document.querySelector('.dashboard-content-wrapper');
    if (!contentWrapper) {
      console.error('Container principal não encontrado');
      return;
    }
    
    // Verificar se a estrutura já foi preparada
    if (document.getElementById('section-início')) {
      console.log('Estrutura da dashboard já foi preparada anteriormente');
      return;
    }
    
    // Guardar o conteúdo original da página inicial
    const originalContent = contentWrapper.innerHTML;
    
    // Armazenar o conteúdo original para uso futuro
    window.originalHomeContent = originalContent;
    
    // Limpar o container
    contentWrapper.innerHTML = '';
    
    // Criar a seção "Início" com o conteúdo original
    const homeSection = document.createElement('div');
    homeSection.id = 'section-início';
    homeSection.className = 'dashboard-section';
    homeSection.style.display = 'block'; // Esta é a seção padrão visível
    homeSection.innerHTML = originalContent;
    
    // Adicionar a seção ao container
    contentWrapper.appendChild(homeSection);
    
    console.log('Estrutura da dashboard preparada para múltiplas seções');
  } catch (error) {
    console.error('Erro ao preparar estrutura da dashboard:', error);
  }
}

// Função principal que inicializa todos os componentes da dashboard
document.addEventListener('DOMContentLoaded', function() {
  console.log('Inicializando dashboard...');
  
  // Inicializar navegação entre seções
  setupNavigationListeners();
  prepareContentSections();
  
  // Marcar o item "Início" como ativo inicialmente
  const homeMenuItem = document.querySelector('.nav-item[data-section="início"]');
  if (homeMenuItem && !homeMenuItem.classList.contains('active')) {
    homeMenuItem.classList.add('active');
    console.log('Item do menu "Início" marcado como ativo inicialmente');
  }
  
  // Verificar se há uma seção para navegar diretamente (como parâmetro na URL)
  const urlParams = new URLSearchParams(window.location.search);
  const sectionParam = urlParams.get('section');
  if (sectionParam && ['início', 'planejamentos'].includes(sectionParam)) {
    navigateToSection(sectionParam);
  }
  
  // Inicializações existentes
  inicializarFuncionalidadesPerfil();
  inicializarPainel();
  configurarListenersPerfil();
  inicializarEngrenagem();
  inicializarFormularios();
  setCurrentDate();
  setupCardActions();
  checkFontAwesomeIcons();
  checkUserTheme();
  
  // Carregar dados do clima usando a cidade do usuário
  carregarDadosClimaUsuario();
  
  // Verificar se o usuário está vindo do cadastro e mostrar mensagem de boas-vindas
  iniciarBoasVindas();
  
  console.log('Dashboard inicializada com sucesso!');
});

/**
 * Reinicializa os elementos dinâmicos da seção "Início"
 */
function reinitializeHomeSection() {
  try {
    console.log('Reinicializando elementos dinâmicos da seção Início');
    
    // Reinicializar o relógio
    const currentTimeElement = document.getElementById('current-time');
    if (currentTimeElement) {
      // Limpar intervalos existentes para evitar múltiplas atualizações
      if (window.homeClockInterval) {
        clearInterval(window.homeClockInterval);
      }
      
      // Função para atualizar o relógio
      function updateHomeClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
      }
      
      // Atualizar imediatamente e a cada segundo
      updateHomeClock();
      window.homeClockInterval = setInterval(updateHomeClock, 1000);
      
      console.log('Relógio da seção Início reinicializado');
    }
    
    // Atualizar a data
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
      const now = new Date();
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      currentDateElement.textContent = now.toLocaleDateString('pt-BR', options);
      console.log('Data da seção Início atualizada');
    }
    
  } catch (error) {
    console.error('Erro ao reinicializar elementos dinâmicos da seção Início:', error);
  }
}

// Adicione no final do arquivo, antes da inicialização geral

// Função para inicializar os filtros de destinos
function initDestinationFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const localCards = document.getElementById('local-cards');
  const internacionalCards = document.getElementById('internacional-cards');
  
  if (!filterButtons.length || !localCards || !internacionalCards) return;
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove a classe active de todos os botões
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Adiciona a classe active ao botão clicado
      this.classList.add('active');
      
      // Obtém o tipo de filtro do atributo data-filter
      const filterType = this.getAttribute('data-filter');
      
      // Faz a transição suave entre os conjuntos de cards
      if (filterType === 'local') {
        // Fade out internacional, fade in local
        internacionalCards.style.opacity = '0';
        setTimeout(() => {
          internacionalCards.style.display = 'none';
          localCards.style.display = 'grid';
          setTimeout(() => {
            localCards.style.opacity = '1';
          }, 50);
        }, 300);
      } else {
        // Fade out local, fade in internacional
        localCards.style.opacity = '0';
        setTimeout(() => {
          localCards.style.display = 'none';
          internacionalCards.style.display = 'grid';
          setTimeout(() => {
            internacionalCards.style.opacity = '1';
          }, 50);
        }, 300);
      }
    });
  });
  
  // Configura o estado inicial
  localCards.style.opacity = '1';
  internacionalCards.style.opacity = '0';
}

// Adicionar a função à inicialização da página
document.addEventListener('DOMContentLoaded', function() {
  // Outras inicializações...
  
  // Inicializa os filtros de destinos
  initDestinationFilters();
});

/**
 * Inicializa o carregamento do clima para os cards de destino
 */
function initDestinationWeather() {
    try {
        console.log('Inicializando carregamento do clima para cards de destino');
        
        // Selecionar todos os cards de destino com informações de clima
        const destinationWeatherElements = document.querySelectorAll('.destination-weather');
        
        if (destinationWeatherElements.length === 0) {
            console.warn('Nenhum card de destino com clima encontrado na página');
            return;
        }
        
        console.log(`Encontrados ${destinationWeatherElements.length} cards de destino com clima para atualizar`);
        
        // Adicionar classe de loading
        destinationWeatherElements.forEach(element => {
            element.classList.add('loading');
        });
        
        // Buscar dados de clima para cada destino
        destinationWeatherElements.forEach(async (element) => {
            try {
                const city = element.getAttribute('data-city');
                if (!city) {
                    console.warn('Card de destino sem cidade definida:', element);
                    return;
                }
                
                console.log(`Buscando dados do clima para destino: ${city}`);
                
                // Buscar dados do clima para a cidade
                const weatherData = await fetchDestinationWeather(city);
                
                // Atualizar a UI com os dados
                updateDestinationWeather(element, weatherData);
            } catch (error) {
                console.error(`Erro ao carregar clima para card de destino:`, error);
                showDestinationWeatherError(element, 'Não foi possível obter dados');
            }
        });
    } catch (error) {
        console.error('Erro ao inicializar clima dos cards de destino:', error);
    }
}

/**
 * Busca dados do clima para uma cidade de destino
 * @param {string} city - Nome da cidade
 * @returns {Promise<Object>} - Promessa com os dados do clima
 */
async function fetchDestinationWeather(city) {
    // Token da API
    const apiKey = '52d46be6275fdb3d3e69537f894fc3f5';
    
    // URL da API com a cidade e os parâmetros
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`;
    
    console.log(`Fazendo requisição para clima de destino: ${apiUrl}`);
    
    // Fazer requisição
    const response = await fetch(apiUrl);
    
    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status} ao buscar clima para ${city}: ${errorText}`);
    }
    
    // Converter resposta para JSON
    const data = await response.json();
    console.log(`Dados do clima recebidos para ${city}:`, data);
    
    return data;
}

/**
 * Atualiza a interface de clima de um card de destino com os dados recebidos
 * @param {HTMLElement} element - Elemento do card de destino
 * @param {Object} weatherData - Dados do clima recebidos da API
 */
function updateDestinationWeather(element, weatherData) {
    try {
        // Verificar se os dados são válidos
        if (!weatherData || !weatherData.main || !weatherData.weather || !weatherData.weather[0]) {
            console.error('Dados do clima inválidos ou incompletos:', weatherData);
            showDestinationWeatherError(element, 'Dados incompletos');
            return;
        }
        
        // Extrair informações relevantes
        const temp = Math.round(weatherData.main.temp);
        const weatherDescription = weatherData.weather[0].description;
        const weatherIcon = weatherData.weather[0].icon;
        
        // Remover classe de loading
        element.classList.remove('loading');
        
        // Atualizar temperatura
        const tempElement = element.querySelector('.destination-weather-temp');
        if (tempElement) {
            tempElement.textContent = `${temp}°C`;
        }
        
        // Atualizar descrição
        const conditionElement = element.querySelector('.destination-weather-condition');
        if (conditionElement) {
            conditionElement.textContent = capitalizeFirstLetter(weatherDescription);
        }
        
        // Atualizar ícone
        const iconContainer = element.querySelector('.destination-weather-icon');
        if (iconContainer) {
            // Construir URL do ícone
            const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
            
            // Limpar conteúdo do container
            iconContainer.innerHTML = '';
            
            // Criar e adicionar imagem
            const imgElement = document.createElement('img');
            imgElement.src = iconUrl;
            imgElement.alt = weatherDescription;
            imgElement.setAttribute('data-icon-code', weatherIcon);
            imgElement.title = capitalizeFirstLetter(weatherDescription);
            
            // Adicionar ao container
            iconContainer.appendChild(imgElement);
        }
        
        // Adicionar tooltip com mais informações
        let tooltipText = `${capitalizeFirstLetter(weatherDescription)} · ${temp}°C`;
        if (weatherData.main.feels_like) {
            tooltipText += ` · Sensação: ${Math.round(weatherData.main.feels_like)}°C`;
        }
        if (weatherData.main.humidity) {
            tooltipText += ` · Umidade: ${weatherData.main.humidity}%`;
        }
        if (weatherData.wind && weatherData.wind.speed) {
            tooltipText += ` · Vento: ${weatherData.wind.speed} km/h`;
        }
        
        element.setAttribute('title', tooltipText);
        
    } catch (error) {
        console.error('Erro ao atualizar clima de destino:', error);
        showDestinationWeatherError(element, 'Erro ao exibir dados');
    }
}

/**
 * Exibe uma mensagem de erro no card de clima do destino
 * @param {HTMLElement} element - Elemento do card de destino
 * @param {string} message - Mensagem de erro
 */
function showDestinationWeatherError(element, message) {
    try {
        // Remover classe de loading
        element.classList.remove('loading');
        
        // Adicionar classe de erro
        element.classList.add('error');
        
        // Atualizar elementos com mensagem de erro
        const conditionElement = element.querySelector('.destination-weather-condition');
        if (conditionElement) {
            conditionElement.textContent = message || 'Erro ao carregar';
        }
        
        const tempElement = element.querySelector('.destination-weather-temp');
        if (tempElement) {
            tempElement.textContent = '--°C';
        }
        
        // Usar ícone de erro para o clima
        const iconContainer = element.querySelector('.destination-weather-icon');
        if (iconContainer) {
            // Limpar e adicionar ícone de erro
            iconContainer.innerHTML = '';
            const iconElement = document.createElement('i');
            iconElement.className = 'fas fa-exclamation-circle';
            iconContainer.appendChild(iconElement);
        }
        
    } catch (error) {
        console.error('Erro ao mostrar mensagem de erro no clima de destino:', error);
    }
}

/**
 * Função para inicializar o painel ao carregar a página
 */
function inicializarPainel() {
    console.log('Inicializando painel...');
    
    try {
        // Inicializar timer para atualização da data e hora
        setCurrentDate();
        
        // Disparar verificação dos ícones Font Awesome
        setTimeout(() => {
            checkFontAwesomeIcons();
        }, 500);
        
        // Função para verificar boas-vindas precisa ser executada rapidamente
        setTimeout(() => {
            iniciarBoasVindas();
        }, 100);
        
        // Carregar dados do clima do usuário
        carregarDadosClimaUsuario();
        
        // Inicializar clima dos cards de destino
        initDestinationWeather();
        
        // Configurar eventos para filtros de destino
        initDestinationFilters();
        
        // Configurar ações dos cards
        setupCardActions();
        
        // Se houverem gráficos na página, inicializar
        if (document.querySelector('.temperature-chart')) {
            initTemperatureChart();
        }
        
        // Inicializar engrenagem e configurações
        inicializarEngrenagem();
        
        // Inicializar formulários
        inicializarFormularios();
        
        // Inicializar funcionalidades de perfil
        inicializarFuncionalidadesPerfil();
        
        // Configurar listeners de perfil
        configurarListenersPerfil();
        
        console.log('Painel inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar o painel:', error);
        showToast('error', 'Erro de Inicialização', 'Ocorreu um erro ao inicializar o painel. Por favor, recarregue a página.');
    }
}

// Outras funções existentes...

// Inicializar código quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando funções...');
    
    // Inicializar painel principal
    inicializarPainel();
    
    // Configurar navegação
    setupNavigationListeners();
    
    // Preparar seções de conteúdo
    prepareContentSections();
    
    // Verificar tema do usuário
    checkUserTheme();
    
    // Inicializar vídeos de destino
    initDestinationVideos();
    
    // Inicializar clima dos cards de destino
    initDestinationWeather();
    
    // Inicializar filtros de destinos
    initDestinationFilters();
  });

/**
 * Inicializa os vídeos nos cards de destino
 */
function initDestinationVideos() {
    try {
        console.log('Inicializando vídeos de destino');
        
        // Selecionar todos os vídeos de destino
        const destinationVideos = document.querySelectorAll('.destination-video');
        
        if (destinationVideos.length === 0) {
            console.warn('Nenhum vídeo de destino encontrado na página');
            return;
        }
        
        console.log(`Encontrados ${destinationVideos.length} vídeos de destino para inicializar`);
        
        // Inicializar cada vídeo
        destinationVideos.forEach(function(video) {
            // Garantir que o vídeo esteja mudo para autoplay funcionar em todos os navegadores
            video.muted = true;
            
            // Configurar loop e autoplay
            video.loop = true;
            video.autoplay = true;
            
            // Tentar iniciar o vídeo manualmente para navegadores que bloqueiam autoplay
            video.play().catch(function(error) {
                console.log('Autoplay foi impedido para vídeo de destino: ', error);
                
                // Adicionar um evento de interação para iniciar o vídeo quando o usuário interagir com o card
                video.closest('.destination-card').addEventListener('mouseover', function() {
                    video.play().catch(function(e) {
                        console.log('Ainda não foi possível reproduzir o vídeo: ', e);
                    });
                });
            });
        });
    } catch (error) {
        console.error('Erro ao inicializar vídeos de destino:', error);
    }
}

/**
 * Abre o modal de planejamento de viagem e preenche os campos iniciais
 * @param {string} pais - País do destino
 * @param {string} estado - Estado do destino
 * @param {string} cidade - Cidade do destino
 * @param {string} videoSrc - URL do vídeo de fundo
 */
function abrirPlanejamentoViagem(pais, estado, cidade, videoSrc) {
    try {
        console.log('Abrindo planejamento de viagem para:', {pais, estado, cidade, videoSrc});
        
        // Preencher os campos de localização
        document.getElementById('tripPais').value = pais;
        document.getElementById('tripEstado').value = estado;
        document.getElementById('tripCidade').value = cidade;
        
        // Limpar e preencher o seletor de datas
        preencherSeletorDatas();
        
        // Limpar e preencher o seletor de horas
        preencherSeletorHoras();
        
        // Configurar evento de mudança na data para buscar previsão do tempo
        configurarEventoData();
        
        // Configurar o formulário para envio
        configurarEnvioFormulario();
        
        // Configurar o vídeo de fundo
        const videoElement = document.getElementById('tripPlanningVideo');
        if (videoElement && videoSrc) {
            videoElement.src = videoSrc;
            videoElement.muted = true;
            videoElement.loop = true;
            
            // Abrir o modal
            openModal('PlanTrip');
            
            // Tentar iniciar o vídeo depois que o modal estiver visível
            setTimeout(() => {
                videoElement.play().catch(error => {
                    console.warn('Não foi possível reproduzir o vídeo automaticamente:', error);
                    
                    // Alternativa: tentar reproduzir ao interagir com o modal
                    document.getElementById('modalPlanTrip').addEventListener('click', function playOnInteraction() {
                        videoElement.play().catch(e => console.warn('Ainda não foi possível reproduzir o vídeo:', e));
                        this.removeEventListener('click', playOnInteraction);
                    }, {once: true});
                });
            }, 300);
        } else {
            // Se não houver vídeo, apenas abrir o modal
            openModal('PlanTrip');
        }
        
        // Resetar estados do clima
        resetarEstadoClimaViagem();
        
        // Verificar ícones após a abertura do modal
        setTimeout(() => {
            garantirIconesFormulario();
        }, 500);
        
    } catch (error) {
        console.error('Erro ao abrir planejamento de viagem:', error);
        showToast('error', 'Erro', 'Não foi possível abrir o planejador de viagem.');
    }
}

/**
 * Garante que os ícones do formulário de planejamento sejam exibidos corretamente
 */
function garantirIconesFormulario() {
    try {
        // Verificar ícones do formulário
        const icones = document.querySelectorAll('#formPlanTrip .input-icon');
        
        icones.forEach(icone => {
            // Verificar se o ícone está visível (tem dimensões)
            const estiloComputado = window.getComputedStyle(icone);
            const visivel = estiloComputado.display !== 'none' && 
                            estiloComputado.visibility !== 'hidden' && 
                            icone.offsetWidth > 0;
            
            if (!visivel) {
                console.warn('Ícone não visível, aplicando correção:', icone);
                
                // Forçar exibição do ícone
                icone.style.display = 'inline-block';
                icone.style.visibility = 'visible';
                
                // Se for o ícone de relógio que está com problema, substituir
                if (icone.classList.contains('fa-clock')) {
                    icone.innerHTML = '⏰';
                    icone.classList.add('icon-fixed');
                }
                
                // Se for o ícone de calendário que está com problema, substituir
                if (icone.classList.contains('fa-calendar-alt')) {
                    icone.innerHTML = '📅';
                    icone.classList.add('icon-fixed');
                }
            }
        });
        
    } catch (error) {
        console.error('Erro ao verificar ícones do formulário:', error);
    }
}

/**
 * Preenche o seletor de datas com os próximos 7 dias
 */
function preencherSeletorDatas() {
    try {
        const seletor = document.getElementById('tripData');
        if (!seletor) return;
        
        // Limpar opções existentes
        seletor.innerHTML = '<option value="">Selecione a data</option>';
        
        // Data atual
        const hoje = new Date();
        
        // Adicionar opções para os próximos 7 dias
        for (let i = 0; i < 7; i++) {
            const data = new Date();
            data.setDate(hoje.getDate() + i);
            
            const valor = formatarDataParaApi(data);
            const texto = formatarDataParaExibicao(data);
            
            const option = document.createElement('option');
            option.value = valor;
            option.textContent = texto;
            
            // Adicionar espaço no início do texto para melhorar espaçamento no Firefox e outros navegadores
            option.style.paddingLeft = '10px';
            
            seletor.appendChild(option);
        }
        
    } catch (error) {
        console.error('Erro ao preencher seletor de datas:', error);
    }
}

/**
 * Preenche o seletor de horas com intervalos de 1 hora
 */
function preencherSeletorHoras() {
    try {
        const seletor = document.getElementById('tripHora');
        if (!seletor) return;
        
        // Limpar opções existentes
        seletor.innerHTML = '<option value="">Selecione a hora</option>';
        
        // Adicionar opções para cada hora do dia
        for (let hora = 0; hora < 24; hora++) {
            const valorHora = hora.toString().padStart(2, '0') + ':00';
            // Adicionar formato mais descritivo (manhã, tarde, noite)
            let textoHora = valorHora;
            if (hora >= 5 && hora < 12) {
                textoHora += ' (Manhã)';
            } else if (hora >= 12 && hora < 18) {
                textoHora += ' (Tarde)';
            } else if (hora >= 18) {
                textoHora += ' (Noite)';
            } else {
                textoHora += ' (Madrugada)';
            }
            
            const option = document.createElement('option');
            option.value = valorHora;
            option.textContent = textoHora;
            
            // Adicionar espaço no início do texto para melhorar espaçamento
            option.style.paddingLeft = '10px';
            
            seletor.appendChild(option);
        }
        
    } catch (error) {
        console.error('Erro ao preencher seletor de horas:', error);
    }
}

/**
 * Configura o evento de mudança na data para buscar a previsão do tempo
 */
function configurarEventoData() {
    try {
        const seletorData = document.getElementById('tripData');
        if (!seletorData) return;
        
        // Remover eventos antigos para evitar duplicação
        const clonedSelector = seletorData.cloneNode(true);
        seletorData.parentNode.replaceChild(clonedSelector, seletorData);
        
        clonedSelector.addEventListener('change', async function() {
            console.log('Data selecionada alterada!');
            const data = this.value;
            console.log('Valor selecionado:', data);
            
            if (!data) {
                resetarEstadoClimaViagem();
                return;
            }
            
            const cidade = document.getElementById('tripCidade').value;
            if (!cidade) {
                showToast('warning', 'Atenção', 'Selecione uma cidade para ver a previsão do tempo.');
                return;
            }
            
            console.log(`Buscando previsão para ${cidade} na data ${data}`);
            await buscarPrevisaoTempo(cidade, data);
        });
        
        console.log('Evento de alteração de data configurado com sucesso!');
    } catch (error) {
        console.error('Erro ao configurar evento de data:', error);
    }
}

/**
 * Reseta o estado da previsão do clima no modal de viagem
 */
function resetarEstadoClimaViagem() {
    try {
        const container = document.querySelector('.trip-weather-preview');
        if (!container) return;
        
        // Remover estados de carregamento ou erro
        container.classList.remove('loading', 'error');
        
        // Resetar textos
        document.querySelector('.trip-weather-condition').textContent = 'Selecione uma data';
        document.querySelector('.trip-weather-temp').textContent = '--°C';
        
        // Resetar ícone
        const iconElement = document.querySelector('.trip-weather-icon i');
        if (iconElement) {
            iconElement.className = '';
            iconElement.classList.add('fas', 'fa-cloud-sun');
        }
        
    } catch (error) {
        console.error('Erro ao resetar estado do clima:', error);
    }
}

/**
 * Busca a previsão do tempo para a cidade e data selecionadas
 * @param {string} cidade - Nome da cidade
 * @param {string} data - Data no formato YYYY-MM-DD
 */
async function buscarPrevisaoTempo(cidade, data) {
    try {
        console.log(`Buscando previsão do tempo para ${cidade} na data ${data}`);
        
        // Verificar parâmetros
        if (!cidade || !data) {
            throw new Error('Cidade ou data não fornecidas');
        }
        
        // Mostrar estado de carregamento
        const container = document.querySelector('.trip-weather-preview');
        if (container) {
            container.classList.add('loading');
            container.classList.remove('error');
        }
        
        // Token da API WeatherAPI
        const apiKey = '96b0e77cf9774d299c0230212232306'; // Chave da API WeatherAPI
        
        // Garantir que a data está no formato correto para a API
        const formattedDate = formatarDataParaApi(data);
        console.log(`Data formatada para API: ${formattedDate}`);
        
        if (!formattedDate) {
            throw new Error('Não foi possível formatar a data corretamente');
        }
        
        // API fornece previsão para até 14 dias, limitamos a 7 dias
        const days = 7; // Solicitar 7 dias para ter a semana completa
        
        // Usar a WeatherAPI para obter previsão meteorológica
        const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(cidade)}&days=${days}&aqi=no&alerts=no&lang=pt`;
        
        console.log(`URL da API: ${apiUrl}`);
        
        // Fazer a requisição
        const response = await fetch(apiUrl);
        
        // Verificar se houve erro
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status} ao buscar previsão: ${errorText}`);
        }
        
        // Converter para JSON
        const weatherData = await response.json();
        console.log('Dados de previsão recebidos:', weatherData);
        
        // Encontrar a previsão para a data selecionada
        let previsaoDia = null;
        
        // Procurar nos dados retornados a data específica
        if (weatherData.forecast && weatherData.forecast.forecastday) {
            console.log('Dias disponíveis na previsão:', weatherData.forecast.forecastday.map(day => day.date));
            
            previsaoDia = weatherData.forecast.forecastday.find(day => 
                day.date === formattedDate
            );
            
            console.log(`Procurando previsão para a data ${formattedDate}. Encontrado:`, previsaoDia ? 'Sim' : 'Não');
        }
        
        if (previsaoDia) {
            console.log('Previsão encontrada para a data:', previsaoDia);
            
            // Converter a data de string para objeto Date para processamento
            const dataSelecionada = new Date(formattedDate);
            atualizarPrevisaoTempo(previsaoDia, dataSelecionada);
        } else {
            console.error('Nenhuma previsão encontrada para a data:', formattedDate);
            throw new Error('Não foi possível encontrar a previsão para a data selecionada');
        }
        
    } catch (error) {
        console.error('Erro ao buscar previsão do tempo:', error);
        
        // Mostrar estado de erro
        const container = document.querySelector('.trip-weather-preview');
        if (container) {
            container.classList.remove('loading');
            container.classList.add('error');
        }
        
        // Atualizar textos de erro
        const conditionElement = document.querySelector('.trip-weather-condition');
        if (conditionElement) conditionElement.textContent = 'Dados indisponíveis';
        
        const tempElement = document.querySelector('.trip-weather-temp');
        if (tempElement) tempElement.textContent = '--°C';
        
        // Atualizar ícone
        const iconElement = document.querySelector('.trip-weather-icon i');
        if (iconElement) {
            iconElement.className = '';
            iconElement.classList.add('fas', 'fa-exclamation-circle');
        }
        
        showToast('error', 'Erro', 'Não foi possível obter a previsão do tempo para a data selecionada.');
    }
}

/**
 * Atualiza a interface com os dados da previsão do tempo
 * @param {Object} previsaoDia - Dados da previsão do tempo do dia selecionado
 * @param {Date} dataSelecionada - Data selecionada pelo usuário
 */
function atualizarPrevisaoTempo(previsaoDia, dataSelecionada) {
    try {
        // Remover estado de carregamento
        const container = document.querySelector('.trip-weather-preview');
        if (container) {
            container.classList.remove('loading', 'error');
        }
        
        // Extrair dados relevantes da API WeatherAPI
        const maxTemp = Math.round(previsaoDia.day.maxtemp_c);
        const minTemp = Math.round(previsaoDia.day.mintemp_c);
        const condicao = previsaoDia.day.condition.text;
        const iconeUrl = previsaoDia.day.condition.icon;
        
        // Formatar a data para exibição
        const dataFormatada = formatarDataParaExibicao(dataSelecionada);
        
        // Atualizar os textos
        const conditionElement = document.querySelector('.trip-weather-condition');
        if (conditionElement) {
            // Incluir a data formatada junto com a condição
            conditionElement.textContent = capitalizeFirstLetter(condicao);
        }
        
        // Atualizar a temperatura mostrando máxima/mínima
        const tempElement = document.querySelector('.trip-weather-temp');
        if (tempElement) {
            tempElement.textContent = `${maxTemp}°C / ${minTemp}°C`;
            tempElement.title = `Temperatura máxima: ${maxTemp}°C | Temperatura mínima: ${minTemp}°C`;
        }
        
        // Adicionar data formatada ao cabeçalho da previsão
        const weatherTitle = document.querySelector('.trip-weather-preview h4');
        if (weatherTitle) {
            weatherTitle.textContent = `Previsão do Tempo - ${dataFormatada}`;
        }
        
        // Atualizar ícone - Substituir ícone FontAwesome por imagem da API
        const iconContainer = document.querySelector('.trip-weather-icon');
        if (iconContainer) {
            // Limpar o conteúdo atual
            iconContainer.innerHTML = '';
            
            // Criar elemento de imagem para o ícone da API
            const imgElement = document.createElement('img');
            imgElement.src = 'https:' + iconeUrl; // Adicionar https: ao início da URL
            imgElement.alt = condicao;
            
            // Adicionar a imagem ao container
            iconContainer.appendChild(imgElement);
        }
        
        // Adicionar informações adicionais de clima que estão disponíveis na API
        const detalhesClima = document.createElement('div');
        detalhesClima.className = 'weather-details';
        detalhesClima.innerHTML = `
            <div class="weather-detail-item">
                <span class="detail-label">Umidade:</span>
                <span class="detail-value">${previsaoDia.day.avghumidity}%</span>
            </div>
            <div class="weather-detail-item">
                <span class="detail-label">Vento:</span>
                <span class="detail-value">${previsaoDia.day.maxwind_kph} km/h</span>
            </div>
            <div class="weather-detail-item">
                <span class="detail-label">Chance de chuva:</span>
                <span class="detail-value">${previsaoDia.day.daily_chance_of_rain}%</span>
            </div>
        `;
        
        // Verificar se já existe uma seção de detalhes para substituir
        const existingDetails = document.querySelector('.weather-details');
        if (existingDetails) {
            existingDetails.remove();
        }
        
        // Adicionar os detalhes após o container principal de clima
        container.appendChild(detalhesClima);
        
    } catch (error) {
        console.error('Erro ao atualizar previsão do tempo:', error);
    }
}

/**
 * Configura o envio do formulário de planejamento
 */
function configurarEnvioFormulario() {
    try {
        const formulario = document.getElementById('formPlanTrip');
        if (!formulario) return;
        
        // Remover event listeners anteriores para evitar duplicação
        const novoFormulario = formulario.cloneNode(true);
        formulario.parentNode.replaceChild(novoFormulario, formulario);
        
        // Adicionar novo event listener
        novoFormulario.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            await enviarPlanejamentoViagem();
        });
        
    } catch (error) {
        console.error('Erro ao configurar envio do formulário:', error);
    }
}

/**
 * Envia os dados do planejamento para a API
 */
async function enviarPlanejamentoViagem() {
    try {
        console.log('Enviando planejamento de viagem...');
        
        // Obter valores dos campos
        const paisDestino = document.getElementById('tripPais').value;
        const estadoDestino = document.getElementById('tripEstado').value;
        const cidadeDestino = document.getElementById('tripCidade').value;
        const dataViagem = document.getElementById('tripData').value;
        const horaViagem = document.getElementById('tripHora').value;
        
        // Obter o ID do usuário
        let usuarioId = document.getElementById('tripUserId').value;
        
        // Se não encontrar o ID do usuário no campo, tentar obter do campo no perfil
        if (!usuarioId && document.getElementById('userId')) {
            usuarioId = document.getElementById('userId').value;
            console.log('ID do usuário obtido do campo userId:', usuarioId);
        }
        
        // Se ainda não tiver ID, verificar se existe no objeto de sessão
        if (!usuarioId && window.userSession && window.userSession.id) {
            usuarioId = window.userSession.id;
            console.log('ID do usuário obtido da sessão:', usuarioId);
        }
        
        if (!usuarioId) {
            throw new Error('ID do usuário não encontrado');
        }
        
        // Validar campos obrigatórios
        if (!paisDestino || !estadoDestino || !cidadeDestino || !dataViagem || !horaViagem) {
            showToast('warning', 'Atenção', 'Preencha todos os campos para continuar.');
            return;
        }
        
        // Compor a data e hora no formato correto (ISO)
        const dataHora = `${dataViagem}T${horaViagem}:00`;
        
        // Preparar dados para envio
        const dadosViagem = {
            paisDestino,
            estadoDestino,
            cidadeDestino,
            dataHora
        };
        
        console.log('Dados a enviar:', dadosViagem);
        console.log('ID do usuário:', usuarioId);
        
        // Desabilitar o botão de submissão enquanto processa
        const btnSubmit = document.querySelector('#formPlanTrip .btn-primary');
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Processando...';
        }
        
        // Enviar para a API
        const response = await fetch(`/viagens?usuarioId=${usuarioId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosViagem)
        });
        
        // Verificar se houve erro
        if (!response.ok) {
            let mensagemErro = 'Não foi possível salvar o planejamento';
            
            try {
                const errorData = await response.json();
                mensagemErro = errorData.message || errorData.error || mensagemErro;
            } catch (e) {
                // Se não conseguir extrair JSON, usar o status HTTP
                mensagemErro = `Erro ${response.status}: ${response.statusText}`;
            }
            
            throw new Error(mensagemErro);
        }
        
        // Processar resposta de sucesso
        const resultado = await response.json();
        console.log('Viagem planejada com sucesso:', resultado);
        
        // Fechar o modal
        closeModal('PlanTrip');
        
        // Exibir mensagem de sucesso
        showToast('success', 'Sucesso', 'Sua viagem foi planejada com sucesso!');
        
        // Recarregar a página após um pequeno delay para atualizar os dados
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao enviar planejamento:', error);
        
        // Reabilitar o botão
        const btnSubmit = document.querySelector('#formPlanTrip .btn-primary');
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Confirmar Planejamento';
        }
        
        // Exibir mensagem de erro
        showToast('error', 'Erro', `Falha ao planejar viagem: ${error.message}`);
    }
}

/**
 * Formata uma data para exibição ao usuário no formato dia/mês
 * @param {Date} data - Data a ser formatada
 * @returns {string} Data formatada
 */
function formatarDataParaExibicao(data) {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const diaSemana = dias[data.getDay()];
    
    // Para o dia atual
    const hoje = new Date();
    if (data.getDate() === hoje.getDate() && 
        data.getMonth() === hoje.getMonth() && 
        data.getFullYear() === hoje.getFullYear()) {
        return `Hoje (${dia}/${mes})`;
    }
    
    // Para amanhã
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    if (data.getDate() === amanha.getDate() && 
        data.getMonth() === amanha.getMonth() && 
        data.getFullYear() === amanha.getFullYear()) {
        return `Amanhã (${dia}/${mes})`;
    }
    
    // Para os demais dias
    return `${diaSemana} (${dia}/${mes})`;
}

/**
 * Formata uma data para envio à API no formato YYYY-MM-DD
 * @param {Date} data - Data a ser formatada
 * @returns {string} Data formatada
 */
function formatarDataParaApi(data) {
    try {
        // Se a data já for uma string no formato YYYY-MM-DD, retornar diretamente
        if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
            console.log('A data já está no formato correto:', data);
            return data;
        }

        // Garantir que data seja um objeto Date
        const dataObj = data instanceof Date ? data : new Date(data);
        
        // Verificar se a data é válida
        if (isNaN(dataObj.getTime())) {
            console.error('Data inválida fornecida para formatação:', data);
            throw new Error('Data inválida');
        }
        
        // Extrair ano, mês e dia e formatar como YYYY-MM-DD
        const ano = dataObj.getFullYear();
        const mes = String(dataObj.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
        const dia = String(dataObj.getDate()).padStart(2, '0');
        
        const dataFormatada = `${ano}-${mes}-${dia}`;
        console.log(`Data formatada para API: ${dataFormatada}`);
        return dataFormatada;
    } catch (error) {
        console.error('Erro ao formatar data para API:', error);
        return null; // Retornar null em caso de erro
    }
}

// Adicionar evento de clique aos botões "Planejar" nos cards de destino
function inicializarBotoesPlanejamento() {
    try {
        console.log('Inicializando botões de planejamento...');
        
        // Selecionar todos os botões de planejamento
        const botoesPlanejamento = document.querySelectorAll('.destination-plan-btn');
        
        console.log(`Encontrados ${botoesPlanejamento.length} botões de planejamento para inicializar`);
        
        if (botoesPlanejamento.length === 0) {
            console.warn('Nenhum botão de planejamento encontrado. Verificando novamente em 1 segundo...');
            setTimeout(inicializarBotoesPlanejamento, 1000);
            return;
        }
        
        botoesPlanejamento.forEach(botao => {
            // Remover event listeners anteriores para evitar duplicação
            const novoBotao = botao.cloneNode(true);
            botao.parentNode.replaceChild(novoBotao, botao);
            
            novoBotao.addEventListener('click', function(event) {
                event.preventDefault();
                console.log('Botão de planejamento clicado');
                
                // Obter dados do card
                const card = this.closest('.destination-card');
                if (!card) {
                    console.error('Não foi possível encontrar o card do destino');
                    return;
                }
                
                // Extrair dados do card
                const pais = card.querySelector('.destination-country').textContent.trim();
                const estado = card.querySelector('.destination-state').textContent.trim();
                const cidade = card.querySelector('.destination-city').textContent.trim();
                
                // Obter vídeo de fundo (se existir)
                let videoSrc = '';
                const video = card.querySelector('.destination-video');
                if (video && video.src) {
                    videoSrc = video.src;
                }
                
                console.log(`Planejando viagem para: ${cidade}, ${estado}, ${pais}`);
                
                // Abrir o modal de planejamento
                abrirPlanejamentoViagem(pais, estado, cidade, videoSrc);
            });
        });
        
        console.log('Botões de planejamento inicializados com sucesso');
        
    } catch (error) {
        console.error('Erro ao inicializar botões de planejamento:', error);
    }
}

// Adicionar a inicialização dos botões de planejamento à função de inicialização do painel
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, verificando botões de planejamento...');
    
    // Inicializar botões de planejamento com um pequeno atraso para garantir que o DOM esteja pronto
    setTimeout(inicializarBotoesPlanejamento, 500);
});

// Exportar a função para o escopo global para que outros scripts possam acessá-la
window.abrirPlanejamentoViagem = abrirPlanejamentoViagem;