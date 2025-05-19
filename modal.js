let modalGlobal = null;
let tempoElGlobal = null;
let progressoElGlobal = null;
let descricaoElGlobal = null;

function solicitarTempoUsuario() {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0, 0, 0, 0.85)';
    overlay.style.backdropFilter = 'blur(8px)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '10000';

    const caixa = document.createElement('div');
    caixa.style.background = 'rgba(40, 40, 40, 0.95)';
    caixa.style.color = '#f5f5f5';
    caixa.style.padding = '35px 30px';
    caixa.style.borderRadius = '20px';
    caixa.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    caixa.style.textAlign = 'center';
    caixa.style.fontFamily = 'Segoe UI, sans-serif';
    caixa.style.width = '90%';
    caixa.style.maxWidth = '360px';
    caixa.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    caixa.style.animation = 'modalAppear 0.3s ease';

    const titulo = document.createElement('h3');
    titulo.textContent = 'Defina o tempo por atividade (10-20 min)';
    titulo.style.marginBottom = '20px';
    titulo.style.fontSize = '20px';
    titulo.style.fontWeight = '600';
    titulo.style.color = '#ffffff';

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '10';
    input.max = '20';
    input.placeholder = '10 a 20 minutos';
    input.style.padding = '12px 15px';
    input.style.width = '100%';
    input.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    input.style.borderRadius = '12px';
    input.style.marginBottom = '15px';
    input.style.fontSize = '16px';
    input.style.outline = 'none';
    input.style.background = 'rgba(255, 255, 255, 0.05)';
    input.style.color = '#fff';
    input.style.transition = 'all 0.3s ease';
    input.onfocus = () => {
      input.style.borderColor = 'rgba(255, 255, 255, 0.3)';
      input.style.background = 'rgba(255, 255, 255, 0.1)';
    };
    input.onblur = () => {
      input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      input.style.background = 'rgba(255, 255, 255, 0.05)';
    };

    const erro = document.createElement('p');
    erro.style.color = '#ff6b6b';
    erro.style.fontSize = '14px';
    erro.style.margin = '8px 0';
    erro.style.display = 'none';

    const botao = document.createElement('button');
    botao.textContent = 'Confirmar';
    botao.style.marginTop = '15px';
    botao.style.padding = '12px 25px';
    botao.style.background = 'linear-gradient(45deg, #404040, #505050)';
    botao.style.border = 'none';
    botao.style.borderRadius = '12px';
    botao.style.color = '#ffffff';
    botao.style.fontSize = '16px';
    botao.style.fontWeight = '600';
    botao.style.cursor = 'pointer';
    botao.style.transition = 'all 0.3s ease';
    botao.style.width = '100%';
    botao.onmouseover = () => {
      botao.style.background = 'linear-gradient(45deg, #505050, #606060)';
      botao.style.transform = 'translateY(-2px)';
      botao.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    };
    botao.onmouseout = () => {
      botao.style.background = 'linear-gradient(45deg, #404040, #505050)';
      botao.style.transform = 'translateY(0)';
      botao.style.boxShadow = 'none';
    };

    botao.onclick = () => {
      const valor = parseInt(input.value);
      if (isNaN(valor) {
        erro.textContent = 'Digite um número válido.';
        erro.style.display = 'block';
        return;
      }
      
      if (valor < 10 || valor > 20) {
        erro.textContent = 'Digite um número entre 10 e 20.';
        erro.style.display = 'block';
        return;
      }

      document.body.removeChild(overlay);
      resolve(valor);
    };

    caixa.appendChild(titulo);
    caixa.appendChild(input);
    caixa.appendChild(erro);
    caixa.appendChild(botao);
    overlay.appendChild(caixa);
    document.body.appendChild(overlay);
  });
}

function iniciarModalGlobal(total) {
  modalGlobal = document.createElement("div");
  modalGlobal.style.position = "fixed";
  modalGlobal.style.top = "0";
  modalGlobal.style.left = "0";
  modalGlobal.style.width = "100vw";
  modalGlobal.style.height = "100vh";
  modalGlobal.style.background = "rgba(0, 0, 0, 0.85)";
  modalGlobal.style.backdropFilter = "blur(8px)";
  modalGlobal.style.display = "flex";
  modalGlobal.style.flexDirection = "column";
  modalGlobal.style.justifyContent = "center";
  modalGlobal.style.alignItems = "center";
  modalGlobal.style.zIndex = "9999";
  modalGlobal.style.fontFamily = "Segoe UI, sans-serif";
  modalGlobal.id = "modal-global";
  modalGlobal.style.animation = "modalAppear 0.3s ease";

  let caixa = document.createElement("div");
  caixa.style.background = "rgba(40, 40, 40, 0.95)";
  caixa.style.padding = "35px 30px";
  caixa.style.borderRadius = "20px";
  caixa.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
  caixa.style.textAlign = "center";
  caixa.style.maxWidth = "90%";
  caixa.style.width = "400px";
  caixa.style.color = "white";
  caixa.style.border = "1px solid rgba(255, 255, 255, 0.1)";

  let tituloEl = document.createElement("h2");
  tituloEl.textContent = "Processando Atividades";
  tituloEl.style.marginBottom = "20px";
  tituloEl.style.fontSize = "24px";
  tituloEl.style.fontWeight = "600";
  tituloEl.style.color = "#ffffff";

  let loader = document.createElement("div");
  loader.style.width = "50px";
  loader.style.height = "50px";
  loader.style.border = "4px solid rgba(255, 255, 255, 0.1)";
  loader.style.borderTop = "4px solid #ffffff";
  loader.style.borderRadius = "50%";
  loader.style.margin = "15px auto";
  loader.style.animation = "spin 1s linear infinite";

  tempoElGlobal = document.createElement("div");
  tempoElGlobal.style.fontSize = "32px";
  tempoElGlobal.style.fontWeight = "bold";
  tempoElGlobal.style.margin = "15px 0";
  tempoElGlobal.style.color = "#ffffff";
  tempoElGlobal.style.textShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";

  descricaoElGlobal = document.createElement("p");
  descricaoElGlobal.style.fontSize = "16px";
  descricaoElGlobal.style.marginBottom = "15px";
  descricaoElGlobal.style.color = "#e0e0e0";
  descricaoElGlobal.style.lineHeight = "1.5";

  progressoElGlobal = document.createElement("p");
  progressoElGlobal.style.marginTop = "15px";
  progressoElGlobal.style.fontSize = "15px";
  progressoElGlobal.style.color = "#cccccc";

  const avisoEl = document.createElement("p");
  avisoEl.textContent = "⚠️ Não feche esta página até que todas as atividades sejam concluídas.";
  avisoEl.style.marginTop = "25px";
  avisoEl.style.color = "#ffd700";
  avisoEl.style.fontSize = "14px";
  avisoEl.style.padding = "10px";
  avisoEl.style.background = "rgba(255, 215, 0, 0.1)";
  avisoEl.style.borderRadius = "8px";
  avisoEl.style.border = "1px solid rgba(255, 215, 0, 0.2)";

  const sucessoEl = document.createElement("div");
  sucessoEl.id = "mensagem-sucesso";
  sucessoEl.style.marginTop = "15px";
  sucessoEl.style.fontSize = "15px";
  sucessoEl.style.color = "#4CAF50";
  sucessoEl.style.fontWeight = "600";
  sucessoEl.textContent = "";

  caixa.appendChild(tituloEl);
  caixa.appendChild(loader);
  caixa.appendChild(tempoElGlobal);
  caixa.appendChild(descricaoElGlobal);
  caixa.appendChild(progressoElGlobal);
  caixa.appendChild(sucessoEl);
  caixa.appendChild(avisoEl);
  modalGlobal.appendChild(caixa);
  document.body.appendChild(modalGlobal);
}

function atualizarModalGlobal(titulo, tempo, index, total) {
  if (!window.filaDeTitulos) window.filaDeTitulos = [];
  if (!window.tituloAtual) window.tituloAtual = 0;
  
  filaDeTitulos.push(titulo);

  let tempoRestante = tempo;
  const sucessoEl = document.getElementById("mensagem-sucesso");
  const tamanhoN = document.getElementById("TamanhoN");

  const totalAtividades = total;
  const indexAtividade = index;

  const atualizarTitulo = () => {
    const tituloAtual = filaDeTitulos[indexAtividade];
    if (tituloAtual) {
      descricaoElGlobal.innerHTML = `Aguardando tempo para a atividade:<br><strong>${tituloAtual}</strong>`;
      progressoElGlobal.textContent = `Processando atividade ${indexAtividade + 1} de ${totalAtividades}`;
      if (tamanhoN) {
        tamanhoN.style.display = "block";
        tamanhoN.style.marginTop = "15px";
        tamanhoN.style.fontSize = "15px";
        tamanhoN.style.color = "#cccccc";
        tamanhoN.textContent = `Tamanho da atividade: ${tituloAtual.length} caracteres`;
      }
    }
  };

  const atualizarTempo = () => {
    const min = String(Math.floor(tempoRestante / 60)).padStart(2, "0");
    const sec = String(tempoRestante % 60).padStart(2, "0");
    tempoElGlobal.textContent = `${min}:${sec}`;
  };

  atualizarTitulo();
  atualizarTempo();

  const tituloInterval = setInterval(() => {
    if (tempoRestante <= 0) return;
    atualizarTitulo();
  }, 3000);

  const tempoInterval = setInterval(() => {
    tempoRestante--;
    atualizarTempo();

    if (tempoRestante <= 0) {
      clearInterval(tempoInterval);
      clearInterval(tituloInterval);
      sucessoEl.textContent = "✅ Atividade concluída com sucesso!";
      if (tamanhoN) {
        tamanhoN.style.display = "none";
      }
      setTimeout(() => {
        const modal = document.getElementById("modal-global");
        if (modal && modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
        if (indexAtividade === totalAtividades - 1) {
          window.filaDeTitulos = [];
          window.tituloAtual = 0;
        }
      }, 3000);
    }
  }, 1000);
}

const estilo = document.createElement("style");
estilo.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}`;
document.head.appendChild(estilo);
