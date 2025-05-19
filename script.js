// Configurações globais
const config = {
    TEMPO: 15, // Tempo padrão em minutos (15 como padrão)
    ENABLE_SUBMISSION: true,
    LOGIN_URL: 'https://sedintegracoes.educacao.sp.gov.br/credenciais/api/LoginCompletoToken',
    SELECTED_TASKS: {
        rascunho: true,
        expirada: true,
        normal: true,
        redacao: false // Redações desativadas por padrão
    }
};

// Elementos do DOM
const MostrarSenha = document.getElementById("VerSenha");
const Senha = document.getElementById("senha");
const userAgent = navigator.userAgent;
let trava = false;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Configurar botões de tempo
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            config.TEMPO = parseInt(btn.dataset.time);
            document.getElementById('custom-time').value = '';
        });
    });

    // Configurar input de tempo personalizado
    document.getElementById('custom-time').addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value >= 10 && value <= 20) {
            config.TEMPO = value;
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        } else if (e.target.value !== '') {
            e.target.value = '';
            alert('Por favor, digite um valor entre 10 e 20 minutos');
        }
    });

    // Configurar seleção de tarefas
    document.querySelectorAll('.task-option input').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            config.SELECTED_TASKS[e.target.value] = e.target.checked;
        });
        
        // Definir estado inicial baseado na config
        checkbox.checked = config.SELECTED_TASKS[checkbox.value];
    });
});

// Mostrar/ocultar senha
MostrarSenha.addEventListener("click", () => {
    Senha.type = Senha.type === "password" ? "text" : "password";
    MostrarSenha.innerHTML = Senha.type === "password" ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

// Função para exibir notificações
function Atividade(Titulo, Atividade) {
    const div = document.createElement("div");
    div.className = "Notificacao";

    const h1 = document.createElement("h1");
    h1.textContent = Titulo;

    const p = document.createElement("p");
    p.textContent = Atividade;

    div.appendChild(h1);
    div.appendChild(p);

    const article = document.getElementById("TamanhoN");
    article.appendChild(div);

    // Atualizar barra de status
    updateStatus(`${Titulo}: ${Atividade}`);

    setTimeout(() => {
        div.style.animation = "sumir 1.5s ease";
        div.addEventListener("animationstart", () => {
            setTimeout(() => {
                const interval = setInterval(() => {
                    const currentScroll = article.scrollTop;
                    const targetScroll = article.scrollHeight;
                    const distance = targetScroll - currentScroll;
                    
                    article.scrollTop += distance * 0.4;
        
                    if (distance < 1) {
                        clearInterval(interval);
                    }
                }, 16);
            }, 200);
        });

        div.addEventListener("animationend", () => {
            div.remove();
        });
    }, 2500);
}

// Atualizar barra de status
function updateStatus(message, progress = null) {
    const statusMessage = document.getElementById("status-message");
    const progressBar = document.getElementById("progress-bar");
    
    if (message) statusMessage.textContent = message;
    if (progress !== null) progressBar.style.width = `${progress}%`;
}

// Função para fazer requisições
async function makeRequest(url, method = 'GET', headers = {}, body = null) {
    const options = {
        method,
        headers: {
            'User-Agent': navigator.userAgent,
            'Content-Type': 'application/json',
            ...headers,
        },
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`❌ HTTP ${method} ${url} => ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Evento de submit do formulário
document.getElementById('Enviar').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (trava) return;
    trava = true;
    updateStatus("Iniciando processo...", 0);

    try {
        // Validar tempo selecionado
        if (config.TEMPO < 10 || config.TEMPO > 20) {
            throw new Error('Tempo por atividade deve ser entre 10 e 20 minutos');
        }

        // Configurar dados de login
        const loginData = {
            user: document.getElementById('ra').value, 
            senha: document.getElementById('senha').value,
        };

        // Fazer login
        updateStatus("Realizando login...", 10);
        const loginResponse = await loginRequest(loginData);
        
        // Obter token
        updateStatus("Obtendo token de acesso...", 20);
        const tokenResponse = await sendRequest(loginResponse.token);
        
        // Buscar salas do usuário
        updateStatus("Buscando salas...", 30);
        const rooms = await fetchUserRooms(tokenResponse.auth_token);
        
        if (rooms.rooms && rooms.rooms.length > 0) {
            updateStatus("Procurando atividades...", 40);
            const totalRooms = rooms.rooms.length;
            let processedRooms = 0;
            
            for (const room of rooms.rooms) {
                await fetchTasks(tokenResponse.auth_token, room.name, room.topic);
                processedRooms++;
                updateStatus(`Processando sala ${processedRooms} de ${totalRooms}...`, 40 + (processedRooms / totalRooms * 30));
            }
            
            updateStatus("Todas as atividades processadas!", 100);
        } else {
            Atividade('TAREFA-SP', 'Nenhuma sala encontrada');
            updateStatus("Nenhuma sala encontrada", 100);
        }
    } catch (error) {
        console.error('Erro no processo principal:', error);
        Atividade('ERRO', 'Ocorreu um erro durante o processo');
        updateStatus("Erro: " + error.message, 100);
    } finally {
        trava = false;
    }
});

// Função de login
async function loginRequest(loginData) {
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': userAgent,
        'Ocp-Apim-Subscription-Key': '2b03c1db3884488795f79c37c069381a',
    };

    try {
        const data = await makeRequest(config.LOGIN_URL, 'POST', headers, loginData);
        console.log('✅ Login bem-sucedido:', data);
        Atividade('SALA-DO-FUTURO', 'Logado com sucesso!');
        return data;
    } catch (error) {
        Atividade('SALA-DO-FUTURO', 'Não foi possível logar!');
        throw error;
    }
}

// Função para enviar requisição com token
async function sendRequest(token) {
    const url = 'https://edusp-api.ip.tv/registration/edusp/token';
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Host': 'edusp-api.ip.tv',
        'x-api-realm': 'edusp',
        'x-api-platform': 'webclient',
        "User-Agent": userAgent,
        "Connection": "keep-alive",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
    };

    try {
        const data = await makeRequest(url, 'POST', headers, { token });
        console.log('✅ Informações do Aluno:', data);
        return data;
    } catch (error) {
        Atividade('SALA-DO-FUTURO', 'Erro ao registrar');
        throw error;
    }
}

// Função para buscar salas do usuário
async function fetchUserRooms(token) {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': token,
            "User-Agent": userAgent,
            "Connection": "keep-alive",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",       
        },
    };

    try {
        const response = await fetch(
            'https://edusp-api.ip.tv/room/user?list_all=true&with_cards=true',
            options
        );
        
        if (!response.ok) throw new Error(`❌ Erro: ${response.statusText}`);
        const data = await response.json();
        
        console.log('✅ Salas do usuário:', data);
        return data;
    } catch (error) {
        console.error('❌ Erro na requisição de salas:', error);
        throw error;
    }
}

// Função para buscar tarefas
async function fetchTasks(token, room, name) {
    const urls = [];
    
    if (config.SELECTED_TASKS.rascunho) {
        urls.push({
            label: 'Rascunho',
            url: `https://edusp-api.ip.tv/tms/task/todo?expired_only=false&filter_expired=true&with_answer=true&publication_target=${room}&answer_statuses=draft&with_apply_moment=true`,
            type: 'rascunho'
        });
    }
    
    if (config.SELECTED_TASKS.expirada) {
        urls.push({
            label: 'Expirada',
            url: `https://edusp-api.ip.tv/tms/task/todo?expired_only=true&filter_expired=false&with_answer=true&publication_target=${room}&answer_statuses=pending&with_apply_moment=true`,
            type: 'expirada'
        });
    }
    
    if (config.SELECTED_TASKS.normal) {
        urls.push({
            label: 'Normal',
            url: `https://edusp-api.ip.tv/tms/task/todo?expired_only=false&filter_expired=true&with_answer=true&publication_target=${room}&answer_statuses=pending&with_apply_moment=false`,
            type: 'normal'
        });
    }

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': token,
            "User-Agent": userAgent,
            "Connection": "keep-alive",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
        },
    };

    try {
        const requests = urls.map(({ label, url }) =>
            fetch(url, options)
                .then(response => {
                    if (!response.ok) throw new Error(`❌ Erro na ${label}: ${response.statusText}`);
                    return response.json();
                })
                .then(data => ({ label, data }))
                .catch(error => {
                    console.error(`❌ Erro na ${label}:`, error);
                    return null;
                });

        const results = await Promise.all(requests);
        
        results.forEach(result => {
            if (result) {
                console.log(`✅ ${result.label} - Sala: ${name} - Atividades encontradas:`, result.data);
            }
        });

        for (const result of results) {
            if (result && result.data.length > 0) {
                await loadTasks(result.data, token, room, result.label);
            }
        }
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        throw error;
    }
}

// Função para carregar e processar tarefas
async function loadTasks(data, token, room, tipo) {
    if (tipo === 'Rascunho' && !config.SELECTED_TASKS.rascunho) {
        console.log(`⚠️ Ignorado: Tipo "${tipo}" - Nenhuma tarefa será processada.`);
        return;
    }

    const isRedacao = task =>
        task.tags.some(t => t.toLowerCase().includes('redacao')) ||
        task.title.toLowerCase().includes('redação');

    if (tipo === 'Expirada') {
        data = data.filter(task => !isRedacao(task) || config.SELECTED_TASKS.redacao);
        console.log(`⚠️ Ignorado: Tipo "${tipo}" - Redações serão processadas apenas se selecionadas.`);
    }

    if (!data || data.length === 0) {
        Atividade('TAREFA-SP', '🚫 Nenhuma atividade disponível');
        return; 
    }

    const redacaoTasks = config.SELECTED_TASKS.redacao ? 
        data.filter(task => isRedacao(task)) : [];
    
    const outrasTasks = data.filter(
        task => !isRedacao(task)
    );

    const orderedTasks = [...redacaoTasks, ...outrasTasks];
    let redacaoLogFeito = false;
    
    iniciarModalGlobal(orderedTasks.length);

    for (const [i, task] of orderedTasks.entries()) {
        const taskId = task.id;
        const taskTitle = task.title;

        try {
            const details = await getTaskDetails(taskId, token);
            const answersData = processTaskQuestions(details);

            if (isRedacao(task)) {
                if (!redacaoLogFeito) {
                    console.log("===================================");
                    console.log("★ ✦ CEBOLITOS REDACAO PAULISTA ✦ ★");
                    console.log("===================================");
                    redacaoLogFeito = true;
                }
                console.log(`✍️ Redação: ${taskTitle}`);
                console.log('⚠️ Auto-Redação', 'Manutenção');
                Atividade('REDACÃO', `Redação detectada: ${taskTitle}`);
            } else {
                Atividade('TAREFA-SP', `Processando atividade: ${taskTitle}`);
                console.log(`📝 Tarefa: ${taskTitle}`);
                
                if (config.ENABLE_SUBMISSION) {
                    await submitAnswers(taskId, answersData, token, room, taskTitle, i + 1, orderedTasks.length);
                }
            }
        } catch (error) {
            console.error(`❌ Erro ao processar tarefa ${taskId}:`, error);
            Atividade('ERRO', `Falha ao processar: ${taskTitle}`);
        }
    }
}

// Função auxiliar para obter detalhes da tarefa
async function getTaskDetails(taskId, token) {
    const url = `https://edusp-api.ip.tv/tms/task/${taskId}/apply?preview_mode=false`;
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-realm': 'edusp',
        'x-api-platform': 'webclient',
        'x-api-key': token,
        "User-Agent": userAgent,
        "Connection": "keep-alive",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",        
    };

    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
    return await response.json();
}

// Função auxiliar para processar questões da tarefa
function processTaskQuestions(details) {
    const answersData = {};

    details.questions.forEach(question => {
        const questionId = question.id;
        let answer = {};

        if (question.type === 'info') return;

        if (question.type === 'media') {
            answer = {
                status: 'error',
                message: 'Type=media system require url',
            };
        } else if (question.options && typeof question.options === 'object') {
            const options = Object.values(question.options);
            const correctIndex = Math.floor(Math.random() * options.length);

            options.forEach((_, i) => {
                answer[i] = i === correctIndex;
            });
        }

        answersData[questionId] = {
            question_id: questionId,
            question_type: question.type,
            answer,
        };
    });

    return answersData;
}

// Função para enviar respostas
async function submitAnswers(taskId, answersData, token, room, taskTitle, index, total) {
    const draft_body = {
        status: 'submitted',
        accessed_on: 'room',
        executed_on: room,
        answers: answersData,
    };

    console.log(`⏳ Aguardando ${config.TEMPO} minutos e realizando a tarefa ID: ${taskId}...`);
    atualizarModalGlobal(taskTitle, config.TEMPO * 60, index, total);
    
    // Aguardar o tempo configurado
    await new Promise(resolve => setTimeout(resolve, config.TEMPO * 60 * 1000));

    try {
        const response = await sendAnswerRequest(taskId, token, draft_body);
        const response_json = await response.json();
        const new_task_id = response_json.id;
        
        await fetchCorrectAnswers(taskId, new_task_id, token, taskTitle);
    } catch (error) {
        console.error('❌ Erro ao enviar as respostas:', error);
        throw error;
    }
}

// Função auxiliar para enviar requisição de resposta
async function sendAnswerRequest(taskId, token, body) {
    const url = `https://edusp-api.ip.tv/tms/task/${taskId}/answer`;
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-realm': 'edusp',
        'x-api-platform': 'webclient',
        'x-api-key': token,
        "User-Agent": userAgent,
        "Connection": "keep-alive",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",      
    };

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
    return response;
}

// Função para buscar respostas corretas
async function fetchCorrectAnswers(taskId, answerId, token, taskTitle) {
    const url = `https://edusp-api.ip.tv/tms/task/${taskId}/answer/${answerId}?with_task=true&with_genre=true&with_questions=true&with_assessed_skills=true`;
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-realm': 'edusp',
        'x-api-platform': 'webclient',
        'x-api-key': token,
        "User-Agent": userAgent,
        "Connection": "keep-alive",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",      
    };

    try {
        const response = await fetch(url, { method: 'GET', headers });
        if (!response.ok) throw new Error(`❌ Erro ao buscar respostas corretas! Status: ${response.status}`);
        const data = await response.json();
        
        console.log('📂 Respostas corretas recebidas:', data);
        await putAnswer(data, taskId, answerId, token, taskTitle);
    } catch (error) {
        console.error('❌ Erro ao buscar respostas corretas:', error);
        throw error;
    }
}

// Função para enviar respostas corrigidas
async function putAnswer(respostasAnteriores, taskId, answerId, token, taskTitle) {
    const url = `https://edusp-api.ip.tv/tms/task/${taskId}/answer/${answerId}`;
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-realm': 'edusp',
        'x-api-platform': 'webclient',
        'x-api-key': token,
        "User-Agent": userAgent,
        "Connection": "keep-alive",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",      
    };

    try {
        const novasRespostasPayload = transformJson(respostasAnteriores);
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(novasRespostasPayload),
        });

        if (!response.ok) throw new Error(`❌ Erro ao enviar respostas corrigidas! Status: ${response.status}`);
        const data = await response.json();
        
        Atividade('TAREFA-SP', `✅ Atividade Concluída - ${taskTitle}`);
        console.log('✅ Respostas corrigidas enviadas com sucesso:', data);
    } catch (error) {
        Atividade('TAREFA-SP', `❌ Erro ao corrigir a atividade - ${taskTitle}`);
        console.error('❌ Erro ao enviar respostas corrigidas:', error);
        throw error;
    }
}

// Função para transformar JSON de respostas
function transfo
