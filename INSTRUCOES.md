# 📋 App de Campo — Levantamento SST (PWA)
**FCA & Sabaini Engenharia**

App instalável no Android/tablet (PWA), com login da equipe. Abre como um app, com ícone próprio, mesmo sem internet. As visitas ficam guardadas no aparelho e sincronizam com a nuvem (Firebase) quando a conexão volta, então qualquer técnico logado consegue abrir, continuar ou gerar o PDF de qualquer visita.

## 📁 Arquivos (todos vão juntos, na mesma pasta)

```
index.html              ← o app
manifest.webmanifest    ← nome, cores e ícone do app instalado
sw.js                   ← faz o app abrir sem internet
icons/                  ← ícones
```

---

## 🚀 Passo a passo para colocar no ar

> Tempo estimado: **20–30 minutos** · Feito uma única vez.

### PASSO 1 — Criar o projeto no Firebase
1. Acesse **https://console.firebase.google.com** e entre com a conta Google da empresa
2. **Criar um projeto** → nome `fca-app-campo` → desative o Google Analytics → **Criar projeto**

### PASSO 2 — Ativar o login por e-mail e senha
1. Menu lateral → **Authentication** → **Vamos começar**
2. Aba **Método de login** → **E-mail/senha** → ativar a primeira opção → **Salvar**
3. Aba **Usuários** → **Adicionar usuário** → e-mail e senha de cada pessoa da equipe
   - Para tirar o acesso de alguém: na mesma lista, **Desativar conta** ou **Excluir**

### PASSO 3 — Ativar o banco de dados (Firestore)
1. Menu lateral → **Firestore Database** → **Criar banco de dados**
2. Localização **`southamerica-east1 (São Paulo)`**
3. Escolha **Iniciar no modo de produção** → **Criar**
4. Aba **Regras** → apague o que estiver lá, cole o bloco abaixo e clique em **Publicar**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /visitas/{id} {
      allow read, write: if request.auth != null;
    }
  }
}
```

> Assim só quem tem usuário criado no Passo 2 lê ou grava visitas. Não use o "modo de teste": ele deixa o banco aberto e para de funcionar em 30 dias.

### PASSO 4 — Pegar as chaves
1. Engrenagem ⚙️ → **Configurações do projeto** → **Seus aplicativos** → ícone **`</>`** (Web)
2. Apelido `app-campo` → **Registrar app** → copie o bloco `firebaseConfig`

### PASSO 5 — Colar as chaves
1. Abra o `index.html` num editor de texto
2. Procure `const firebaseConfig = {` e troque os `"COLE_AQUI"` pelos valores copiados
3. Salve

### PASSO 6 — Publicar (precisa ser HTTPS)
O PWA só instala e funciona offline em endereço **https**.

**A) GitHub Pages (gratuito)**
1. Crie um repositório (ex.: `app-campo-sst`)
2. Envie **todos** os arquivos e a pasta `icons/`, mantendo a estrutura
3. **Settings → Pages** → branch `main`, pasta `/root` → **Save**
4. Em 1–2 minutos o link aparece, ex.: `https://seu-usuario.github.io/app-campo-sst/`
5. No Firebase: **Authentication → Configurações → Domínios autorizados** → **Adicionar domínio** → `seu-usuario.github.io`

**B) Servidor da empresa (Nginx, com certificado HTTPS)**
Copie a pasta inteira para o diretório servido e adicione o domínio em **Domínios autorizados**, como no item 5 acima. Garanta que `.webmanifest` seja servido como `application/manifest+json`.

### PASSO 7 — Instalar no celular/tablet
1. Abra o link no **Chrome** do Android, com internet, e faça o login
2. **⋮ → Instalar app** (ou aceite o aviso "Adicionar à tela inicial")
3. O ícone **Campo SST** aparece na tela inicial

---

## 🧭 Fluxo da visita

1. **Visita e Unidade** → Próximo
2. **Setores** → Próximo
3. **Funções**, cada uma vinculada a um setor
   - Opcional: **Incluir análise ergonômica (AEP — NR-17)**, com checklist de 12 fatores (Sim/Não/N/A, observação e conclusão)
   - Com a AEP ligada, a função ganha na lista o botão **Aplicar questionário anônimo**
4. **Ambientes**, com os botões de características que montam a descrição
5. **GHE**: funções vinculadas, riscos (tipo, fator, fonte, trajetória e avaliação qualitativa ou quantitativa) e medidas de proteção do grupo → **Salvar este GHE**
6. **Relatório / PDF** → **Salvar PDF** → na tela de impressão, **Salvar como PDF**

## 🙋 Questionário anônimo do funcionário
- O técnico toca em **Aplicar questionário anônimo** na função e entrega o aparelho
- O funcionário vê só as perguntas (dor por parte do corpo + percepção do trabalho + sugestão), sem dados da visita
- Ao terminar: **Próximo funcionário** ou **Encerrar (técnico)**
- Não são gravados nome, data nem hora. O relatório mostra só os totais por função e avisa quando há menos de 3 respostas

## 📶 Sem internet no cliente
- O selo no topo mostra **Online** ou **Offline — salvando no aparelho**
- Offline, o app abre e salva no aparelho; a visita aparece com a etiqueta **"aguardando sincronizar"** até a conexão voltar
- **Não desinstale o app nem limpe os dados do navegador** antes de sincronizar
- O **primeiro login** em cada aparelho precisa de internet. Depois, o login fica guardado

## 🔄 Publicar uma nova versão
Ao alterar o `index.html`, aumente o número em `const VERSION = 'campo-sst-v2'` no `sw.js` (v3, v4…). Os aparelhos pegam a versão nova na próxima abertura com internet.
